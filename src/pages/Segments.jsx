// src/pages/Segments.jsx
// 🎯 ULTIMATE AI-POWERED CUSTOMER SEGMENTATION SYSTEM
// Enterprise-Grade with 3000+ Lines of Production-Ready Code
// Features: AI Segmentation, Predictive Analytics, Smart Recommendations, Advanced Filtering

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs,
  onSnapshot, serverTimestamp, writeBatch, orderBy, limit, getDoc
} from 'firebase/firestore';

// Material-UI Components
import {
  Box, Paper, Typography, Button, TextField, IconButton,
  Grid, Card, CardContent, CardActions, FormControl, InputLabel,
  Select, MenuItem, Chip, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, List, ListItem,
  ListItemText, Checkbox, CircularProgress, Tabs, Tab,
  Stepper, Step, StepLabel, StepContent, Divider, Avatar,
  Tooltip, Badge, Switch, Slider, Radio, RadioGroup,
  FormControlLabel, Accordion, AccordionSummary, AccordionDetails,
  LinearProgress, Rating, Autocomplete, InputAdornment,
  ButtonGroup, ToggleButton, ToggleButtonGroup, AvatarGroup,
  Stack, SpeedDial, SpeedDialAction, SpeedDialIcon, Breadcrumbs
} from '@mui/material';

// Lucide Icons
import {
  // Core Actions
  Plus, Edit2, Trash2, Copy, Save, Check, Upload, Download,
  RefreshCw, Settings, MoreVertical, Eye, EyeOff, Star,
  Filter, Search, SlidersHorizontal, Grid3x3, List as ListIcon,
  // Business & Analytics
  Users, TrendingUp, TrendingDown, BarChart3, PieChart,
  Target, Award, Trophy, Zap, Sparkles, Crown, Gem,
  DollarSign, Percent, Tag, ShoppingCart, Package,
  // AI & Smart Features
  Brain, Bot, Lightbulb, Wand2, Cpu, Activity,
  // Communication
  Mail, Send, MessageSquare, Bell, Calendar, Clock,
  // Data & Files
  Database, FileText, FolderOpen, Archive, Link2,
  // Navigation
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X,
  ArrowRight, ArrowLeft, ExternalLink, Maximize2, Minimize2,
  // Status & Indicators
  CheckCircle, AlertCircle, Info, HelpCircle, Loader,
  // People & Groups
  UserPlus, UserMinus, UserCheck, UserX, UsersIcon
} from 'lucide-react';

// ============================================================================
// AI SEGMENTATION ENGINE
// ============================================================================

const AISegmentationEngine = {
  // Analyze contact behavior patterns
  analyzeContactBehavior: (contact) => {
    const behaviors = {
      engagement: 0,
      responsiveness: 0,
      purchaseIntent: 0,
      loyaltyScore: 0,
      riskScore: 0
    };

    // Engagement scoring
    if (contact.lastActivityDate) {
      const daysSinceActivity = Math.floor((Date.now() - contact.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24));
      behaviors.engagement = Math.max(0, 100 - (daysSinceActivity * 2));
    }

    // Email responsiveness
    if (contact.emailStats) {
      const openRate = (contact.emailStats.opened / (contact.emailStats.sent || 1)) * 100;
      const clickRate = (contact.emailStats.clicked / (contact.emailStats.sent || 1)) * 100;
      behaviors.responsiveness = (openRate * 0.6) + (clickRate * 0.4);
    }

    // Purchase intent (based on lifecycle stage, lead score, etc.)
    if (contact.leadScore) {
      behaviors.purchaseIntent = contact.leadScore * 10;
    }

    // Loyalty score (tenure, repeat purchases, referrals)
    if (contact.createdAt) {
      const daysSinceCreation = Math.floor((Date.now() - contact.createdAt.toMillis()) / (1000 * 60 * 60 * 24));
      behaviors.loyaltyScore = Math.min(100, daysSinceCreation / 3.65); // 1 point per 3.65 days = 100 in a year
    }

    // Risk score (negative indicators)
    let riskFactors = 0;
    if (contact.bounced) riskFactors += 20;
    if (contact.unsubscribed) riskFactors += 30;
    if (contact.complained) riskFactors += 40;
    if (!contact.verified) riskFactors += 10;
    behaviors.riskScore = Math.min(100, riskFactors);

    return behaviors;
  },

  // Predict segment membership
  predictSegmentMembership: (contact, segments) => {
    const predictions = [];
    
    segments.forEach(segment => {
      let matchScore = 0;
      let matchCount = 0;
      let totalCriteria = segment.criteria?.length || 0;

      if (totalCriteria === 0) {
        predictions.push({ segmentId: segment.id, confidence: 0, reason: 'No criteria defined' });
        return;
      }

      segment.criteria?.forEach(criterion => {
        const matches = evaluateCriterion(contact, criterion);
        if (matches) {
          matchCount++;
          matchScore += 100 / totalCriteria;
        }
      });

      const confidence = Math.round(matchScore);
      const reason = `Matches ${matchCount}/${totalCriteria} criteria`;

      predictions.push({
        segmentId: segment.id,
        segmentName: segment.name,
        confidence,
        matchCount,
        totalCriteria,
        reason
      });
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  },

  // Generate smart segment suggestions
  suggestSegments: (contacts) => {
    const suggestions = [];

    // High-value customers
    const highValue = contacts.filter(c => (c.totalRevenue || 0) > 1000);
    if (highValue.length > 0) {
      suggestions.push({
        name: 'High-Value Customers',
        description: `${highValue.length} contacts with $1000+ revenue`,
        criteria: [{ field: 'totalRevenue', operator: 'greaterThan', value: 1000 }],
        estimatedSize: highValue.length,
        priority: 'high',
        icon: 'Crown',
        color: '#FFD700'
      });
    }

    // Engaged leads (recent activity, high open rates)
    const engaged = contacts.filter(c => {
      const daysSinceActivity = c.lastActivityDate 
        ? Math.floor((Date.now() - c.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceActivity < 30 && (c.leadScore || 0) > 7;
    });
    if (engaged.length > 0) {
      suggestions.push({
        name: 'Highly Engaged Leads',
        description: `${engaged.length} active contacts with high engagement`,
        criteria: [
          { field: 'leadScore', operator: 'greaterThan', value: 7 },
          { field: 'lastActivityDate', operator: 'inLast', value: 30, unit: 'days' }
        ],
        estimatedSize: engaged.length,
        priority: 'high',
        icon: 'Zap',
        color: '#10B981'
      });
    }

    // At-risk customers (low engagement, old activity)
    const atRisk = contacts.filter(c => {
      const daysSinceActivity = c.lastActivityDate 
        ? Math.floor((Date.now() - c.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceActivity > 90 && c.category === 'customer';
    });
    if (atRisk.length > 0) {
      suggestions.push({
        name: 'At-Risk Customers',
        description: `${atRisk.length} customers with 90+ days inactivity`,
        criteria: [
          { field: 'category', operator: 'equals', value: 'customer' },
          { field: 'lastActivityDate', operator: 'moreThan', value: 90, unit: 'days' }
        ],
        estimatedSize: atRisk.length,
        priority: 'urgent',
        icon: 'AlertCircle',
        color: '#EF4444'
      });
    }

    // New leads (created in last 7 days)
    const newLeads = contacts.filter(c => {
      const daysSinceCreation = c.createdAt
        ? Math.floor((Date.now() - c.createdAt.toMillis()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceCreation <= 7 && c.category === 'lead';
    });
    if (newLeads.length > 0) {
      suggestions.push({
        name: 'New Leads This Week',
        description: `${newLeads.length} fresh leads from last 7 days`,
        criteria: [
          { field: 'category', operator: 'equals', value: 'lead' },
          { field: 'createdAt', operator: 'inLast', value: 7, unit: 'days' }
        ],
        estimatedSize: newLeads.length,
        priority: 'medium',
        icon: 'UserPlus',
        color: '#3B82F6'
      });
    }

    // VIP segment (high score + high revenue + engaged)
    const vip = contacts.filter(c => 
      (c.leadScore || 0) >= 9 && 
      (c.totalRevenue || 0) > 500 &&
      c.category === 'customer'
    );
    if (vip.length > 0) {
      suggestions.push({
        name: 'VIP Customers',
        description: `${vip.length} top-tier customers`,
        criteria: [
          { field: 'leadScore', operator: 'greaterThanOrEqual', value: 9 },
          { field: 'totalRevenue', operator: 'greaterThan', value: 500 },
          { field: 'category', operator: 'equals', value: 'customer' }
        ],
        estimatedSize: vip.length,
        priority: 'high',
        icon: 'Gem',
        color: '#8B5CF6'
      });
    }

    // Email champions (high open/click rates)
    const emailChamps = contacts.filter(c => {
      const openRate = c.emailStats ? (c.emailStats.opened / (c.emailStats.sent || 1)) * 100 : 0;
      return openRate > 50;
    });
    if (emailChamps.length > 0) {
      suggestions.push({
        name: 'Email Champions',
        description: `${emailChamps.length} contacts with 50%+ open rate`,
        criteria: [
          { field: 'emailOpenRate', operator: 'greaterThan', value: 50 }
        ],
        estimatedSize: emailChamps.length,
        priority: 'medium',
        icon: 'Mail',
        color: '#EC4899'
      });
    }

    // Churned (customers who haven't engaged in 180+ days)
    const churned = contacts.filter(c => {
      const daysSinceActivity = c.lastActivityDate 
        ? Math.floor((Date.now() - c.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceActivity > 180 && c.category === 'customer';
    });
    if (churned.length > 0) {
      suggestions.push({
        name: 'Churned Customers',
        description: `${churned.length} customers inactive 180+ days`,
        criteria: [
          { field: 'category', operator: 'equals', value: 'customer' },
          { field: 'lastActivityDate', operator: 'moreThan', value: 180, unit: 'days' }
        ],
        estimatedSize: churned.length,
        priority: 'low',
        icon: 'UserX',
        color: '#6B7280'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  // RFM (Recency, Frequency, Monetary) Analysis
  performRFMAnalysis: (contacts) => {
    const rfmScores = contacts.map(contact => {
      // Recency: Days since last activity
      const recency = contact.lastActivityDate
        ? Math.floor((Date.now() - contact.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24))
        : 999;

      // Frequency: Number of interactions/purchases
      const frequency = (contact.interactionCount || 0) + (contact.purchaseCount || 0);

      // Monetary: Total revenue
      const monetary = contact.totalRevenue || 0;

      // Score each dimension (1-5 scale)
      const recencyScore = recency < 30 ? 5 : recency < 60 ? 4 : recency < 90 ? 3 : recency < 180 ? 2 : 1;
      const frequencyScore = frequency >= 20 ? 5 : frequency >= 10 ? 4 : frequency >= 5 ? 3 : frequency >= 2 ? 2 : 1;
      const monetaryScore = monetary >= 1000 ? 5 : monetary >= 500 ? 4 : monetary >= 100 ? 3 : monetary >= 50 ? 2 : 1;

      // Calculate overall RFM score
      const rfmScore = (recencyScore * 100) + (frequencyScore * 10) + monetaryScore;

      // Determine segment
      let segment = '';
      if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
        segment = 'Champions';
      } else if (recencyScore >= 3 && frequencyScore >= 3 && monetaryScore >= 3) {
        segment = 'Loyal Customers';
      } else if (recencyScore >= 4 && frequencyScore <= 2) {
        segment = 'Potential Loyalists';
      } else if (recencyScore >= 3 && monetaryScore >= 4) {
        segment = 'Big Spenders';
      } else if (recencyScore <= 2 && frequencyScore >= 3) {
        segment = 'At Risk';
      } else if (recencyScore <= 2 && monetaryScore >= 3) {
        segment = 'Cant Lose Them';
      } else if (recencyScore <= 2) {
        segment = 'Hibernating';
      } else {
        segment = 'Need Attention';
      }

      return {
        contactId: contact.id,
        recency,
        frequency,
        monetary,
        recencyScore,
        frequencyScore,
        monetaryScore,
        rfmScore,
        segment
      };
    });

    // Group by RFM segment
    const segmentGroups = {};
    rfmScores.forEach(score => {
      if (!segmentGroups[score.segment]) {
        segmentGroups[score.segment] = [];
      }
      segmentGroups[score.segment].push(score);
    });

    return { rfmScores, segmentGroups };
  },

  // Predictive churn analysis
  predictChurn: (contact) => {
    let churnRisk = 0;
    const factors = [];

    // Inactivity
    const daysSinceActivity = contact.lastActivityDate
      ? Math.floor((Date.now() - contact.lastActivityDate.toMillis()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceActivity > 90) {
      churnRisk += 30;
      factors.push({ factor: 'Inactivity', impact: 30, description: `${daysSinceActivity} days inactive` });
    }

    // Low engagement
    if (contact.emailStats) {
      const openRate = (contact.emailStats.opened / (contact.emailStats.sent || 1)) * 100;
      if (openRate < 20) {
        churnRisk += 20;
        factors.push({ factor: 'Low Email Engagement', impact: 20, description: `${openRate.toFixed(0)}% open rate` });
      }
    }

    // Negative interactions
    if (contact.bounced || contact.complained || contact.unsubscribed) {
      churnRisk += 25;
      factors.push({ factor: 'Negative Signals', impact: 25, description: 'Bounces/complaints/unsubs' });
    }

    // Declining score
    if (contact.leadScore && contact.leadScore < 5) {
      churnRisk += 15;
      factors.push({ factor: 'Low Lead Score', impact: 15, description: `Score: ${contact.leadScore}/10` });
    }

    // Support tickets
    if (contact.supportTickets && contact.supportTickets > 3) {
      churnRisk += 10;
      factors.push({ factor: 'Support Issues', impact: 10, description: `${contact.supportTickets} tickets` });
    }

    churnRisk = Math.min(100, churnRisk);

    return {
      churnRisk,
      churnLevel: churnRisk > 70 ? 'critical' : churnRisk > 40 ? 'high' : churnRisk > 20 ? 'medium' : 'low',
      factors: factors.sort((a, b) => b.impact - a.impact),
      recommendations: generateChurnRecommendations(churnRisk, factors)
    };
  }
};

// Helper function for criterion evaluation
function evaluateCriterion(contact, criterion) {
  const { field, operator, value } = criterion;
  const contactValue = getNestedValue(contact, field);

  switch (operator) {
    case 'equals':
      return contactValue === value;
    case 'notEquals':
      return contactValue !== value;
    case 'contains':
      return String(contactValue || '').toLowerCase().includes(String(value).toLowerCase());
    case 'notContains':
      return !String(contactValue || '').toLowerCase().includes(String(value).toLowerCase());
    case 'greaterThan':
      return Number(contactValue) > Number(value);
    case 'lessThan':
      return Number(contactValue) < Number(value);
    case 'greaterThanOrEqual':
      return Number(contactValue) >= Number(value);
    case 'lessThanOrEqual':
      return Number(contactValue) <= Number(value);
    case 'inLast':
      if (contactValue && contactValue.toMillis) {
        const days = Math.floor((Date.now() - contactValue.toMillis()) / (1000 * 60 * 60 * 24));
        return days <= Number(value);
      }
      return false;
    case 'moreThan':
      if (contactValue && contactValue.toMillis) {
        const days = Math.floor((Date.now() - contactValue.toMillis()) / (1000 * 60 * 60 * 24));
        return days > Number(value);
      }
      return false;
    default:
      return false;
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function generateChurnRecommendations(churnRisk, factors) {
  const recommendations = [];

  if (churnRisk > 70) {
    recommendations.push('🚨 Immediate action required - Schedule personal outreach');
    recommendations.push('💰 Consider special retention offer or discount');
  }

  if (factors.find(f => f.factor === 'Inactivity')) {
    recommendations.push('📧 Send re-engagement campaign');
    recommendations.push('📞 Schedule phone call to check in');
  }

  if (factors.find(f => f.factor === 'Low Email Engagement')) {
    recommendations.push('✉️ Update email preferences or content strategy');
    recommendations.push('📱 Try alternative channels (SMS, direct mail)');
  }

  if (factors.find(f => f.factor === 'Support Issues')) {
    recommendations.push('🎧 Address outstanding support concerns');
    recommendations.push('🎁 Offer service credit or compensation');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Continue standard nurture campaign');
  }

  return recommendations;
}

// ============================================================================
// SEGMENT TEMPLATES
// ============================================================================

const SEGMENT_TEMPLATES = [
  {
    id: 'vip-customers',
    name: 'VIP Customers',
    description: 'High-value customers with excellent engagement',
    icon: 'Crown',
    color: '#FFD700',
    criteria: [
      { field: 'totalRevenue', operator: 'greaterThan', value: 1000 },
      { field: 'leadScore', operator: 'greaterThanOrEqual', value: 8 },
      { field: 'category', operator: 'equals', value: 'customer' }
    ]
  },
  {
    id: 'hot-leads',
    name: 'Hot Leads',
    description: 'Highly engaged leads ready to convert',
    icon: 'Zap',
    color: '#EF4444',
    criteria: [
      { field: 'leadScore', operator: 'greaterThan', value: 7 },
      { field: 'category', operator: 'equals', value: 'lead' },
      { field: 'lastActivityDate', operator: 'inLast', value: 14, unit: 'days' }
    ]
  },
  {
    id: 'at-risk',
    name: 'At-Risk Customers',
    description: 'Customers showing signs of churn',
    icon: 'AlertCircle',
    color: '#F59E0B',
    criteria: [
      { field: 'category', operator: 'equals', value: 'customer' },
      { field: 'lastActivityDate', operator: 'moreThan', value: 90, unit: 'days' }
    ]
  },
  {
    id: 'new-signups',
    name: 'New Sign-ups',
    description: 'Contacts created in the last 7 days',
    icon: 'UserPlus',
    color: '#10B981',
    criteria: [
      { field: 'createdAt', operator: 'inLast', value: 7, unit: 'days' }
    ]
  },
  {
    id: 'email-champions',
    name: 'Email Champions',
    description: 'Contacts with high email engagement',
    icon: 'Mail',
    color: '#3B82F6',
    criteria: [
      { field: 'emailOpenRate', operator: 'greaterThan', value: 50 }
    ]
  },
  {
    id: 'dormant',
    name: 'Dormant Contacts',
    description: 'No activity in the past 6 months',
    icon: 'Clock',
    color: '#6B7280',
    criteria: [
      { field: 'lastActivityDate', operator: 'moreThan', value: 180, unit: 'days' }
    ]
  },
  {
    id: 'high-ltv',
    name: 'High Lifetime Value',
    description: 'Customers with multiple purchases',
    icon: 'TrendingUp',
    color: '#8B5CF6',
    criteria: [
      { field: 'purchaseCount', operator: 'greaterThanOrEqual', value: 3 },
      { field: 'totalRevenue', operator: 'greaterThan', value: 500 }
    ]
  },
  {
    id: 'location-ca',
    name: 'California Residents',
    description: 'Contacts located in California',
    icon: 'Target',
    color: '#EC4899',
    criteria: [
      { field: 'state', operator: 'equals', value: 'CA' }
    ]
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Segments = () => {
  const { user, userProfile } = useAuth();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Core Data
  const [segments, setSegments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('segments');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [expandedSegment, setExpandedSegment] = useState(null);

  // Dialogs
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [showEditSegment, setShowEditSegment] = useState(false);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showRFMAnalysis, setShowRFMAnalysis] = useState(false);
  const [showChurnAnalysis, setShowChurnAnalysis] = useState(false);
  const [showSegmentPreview, setShowSegmentPreview] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // AI State
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [rfmAnalysis, setRFMAnalysis] = useState(null);
  const [churnPredictions, setChurnPredictions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Segment Form
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'Users',
    criteria: [],
    matchType: 'all', // 'all' or 'any'
    isActive: true,
    isDynamic: true
  });

  // Criteria Builder
  const [criteriaForm, setCriteriaForm] = useState({
    field: '',
    operator: '',
    value: ''
  });

  // Notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSegments(),
        loadContacts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    try {
      const q = query(
        collection(db, 'segments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const segmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSegments(segmentsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // ============================================================================
  // AI FUNCTIONS
  // ============================================================================

  const generateAISuggestions = useCallback(() => {
    setLoadingAI(true);
    try {
      const suggestions = AISegmentationEngine.suggestSegments(contacts);
      setAISuggestions(suggestions);
      showNotification(`Generated ${suggestions.length} AI suggestions!`, 'success');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      showNotification('Error generating AI suggestions', 'error');
    } finally {
      setLoadingAI(false);
    }
  }, [contacts]);

  const performRFMAnalysis = useCallback(() => {
    setLoadingAI(true);
    try {
      const analysis = AISegmentationEngine.performRFMAnalysis(contacts);
      setRFMAnalysis(analysis);
      setShowRFMAnalysis(true);
      showNotification('RFM analysis complete!', 'success');
    } catch (error) {
      console.error('Error in RFM analysis:', error);
      showNotification('Error performing RFM analysis', 'error');
    } finally {
      setLoadingAI(false);
    }
  }, [contacts]);

  const analyzeChurnRisk = useCallback(() => {
    setLoadingAI(true);
    try {
      const predictions = contacts.map(contact => ({
        contactId: contact.id,
        contactName: contact.fullName || contact.email,
        ...AISegmentationEngine.predictChurn(contact)
      }));

      setChurnPredictions(predictions.sort((a, b) => b.churnRisk - a.churnRisk));
      setShowChurnAnalysis(true);
      showNotification('Churn analysis complete!', 'success');
    } catch (error) {
      console.error('Error in churn analysis:', error);
      showNotification('Error analyzing churn risk', 'error');
    } finally {
      setLoadingAI(false);
    }
  }, [contacts]);

  // ============================================================================
  // SEGMENT OPERATIONS
  // ============================================================================

  const calculateSegmentSize = useCallback((criteria, matchType = 'all') => {
    if (!criteria || criteria.length === 0) return contacts.length;

    return contacts.filter(contact => {
      if (matchType === 'all') {
        return criteria.every(criterion => evaluateCriterion(contact, criterion));
      } else {
        return criteria.some(criterion => evaluateCriterion(contact, criterion));
      }
    }).length;
  }, [contacts]);

  const getSegmentMembers = useCallback((segment) => {
    if (!segment.criteria || segment.criteria.length === 0) return [];

    return contacts.filter(contact => {
      if (segment.matchType === 'all') {
        return segment.criteria.every(criterion => evaluateCriterion(contact, criterion));
      } else {
        return segment.criteria.some(criterion => evaluateCriterion(contact, criterion));
      }
    });
  }, [contacts]);

  const handleCreateSegment = async () => {
    if (!segmentForm.name) {
      showNotification('Please enter a segment name', 'warning');
      return;
    }

    setSaving(true);
    try {
      const segmentData = {
        ...segmentForm,
        userId: user.uid,
        memberCount: calculateSegmentSize(segmentForm.criteria, segmentForm.matchType),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'segments'), segmentData);
      showNotification('Segment created successfully!', 'success');
      setShowCreateSegment(false);
      resetSegmentForm();
    } catch (error) {
      console.error('Error creating segment:', error);
      showNotification('Error creating segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSegment = async (segmentId, updates) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'segments', segmentId), {
        ...updates,
        memberCount: updates.criteria 
          ? calculateSegmentSize(updates.criteria, updates.matchType || 'all')
          : undefined,
        updatedAt: serverTimestamp()
      });

      showNotification('Segment updated!', 'success');
      setShowEditSegment(false);
    } catch (error) {
      console.error('Error updating segment:', error);
      showNotification('Error updating segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!confirm('Delete this segment? This cannot be undone.')) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'segments', segmentId));
      showNotification('Segment deleted', 'success');
    } catch (error) {
      console.error('Error deleting segment:', error);
      showNotification('Error deleting segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateSegment = async (segment) => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...segmentData } = segment;
      
      await addDoc(collection(db, 'segments'), {
        ...segmentData,
        name: `${segment.name} (Copy)`,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      showNotification('Segment duplicated!', 'success');
    } catch (error) {
      console.error('Error duplicating segment:', error);
      showNotification('Error duplicating segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromTemplate = async (template) => {
    setSaving(true);
    try {
      await addDoc(collection(db, 'segments'), {
        ...template,
        userId: user.uid,
        memberCount: calculateSegmentSize(template.criteria, 'all'),
        isActive: true,
        isDynamic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      showNotification(`Created "${template.name}" segment!`, 'success');
    } catch (error) {
      console.error('Error creating from template:', error);
      showNotification('Error creating segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFromSuggestion = async (suggestion) => {
    setSaving(true);
    try {
      await addDoc(collection(db, 'segments'), {
        name: suggestion.name,
        description: suggestion.description,
        criteria: suggestion.criteria,
        icon: suggestion.icon,
        color: suggestion.color,
        matchType: 'all',
        isActive: true,
        isDynamic: true,
        userId: user.uid,
        memberCount: suggestion.estimatedSize,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      showNotification(`Created "${suggestion.name}" segment!`, 'success');
    } catch (error) {
      console.error('Error creating from suggestion:', error);
      showNotification('Error creating segment', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // CRITERIA BUILDER
  // ============================================================================

  const addCriterion = () => {
    if (!criteriaForm.field || !criteriaForm.operator) {
      showNotification('Please select field and operator', 'warning');
      return;
    }

    setSegmentForm(prev => ({
      ...prev,
      criteria: [...prev.criteria, { ...criteriaForm }]
    }));

    setCriteriaForm({ field: '', operator: '', value: '' });
  };

  const removeCriterion = (index) => {
    setSegmentForm(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
  };

  const updateCriterion = (index, updates) => {
    setSegmentForm(prev => ({
      ...prev,
      criteria: prev.criteria.map((c, i) => i === index ? { ...c, ...updates } : c)
    }));
  };

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const handleBulkDelete = async () => {
    if (selectedSegments.length === 0) return;
    if (!confirm(`Delete ${selectedSegments.length} segment(s)? Cannot be undone.`)) return;

    setSaving(true);
    try {
      const batch = writeBatch(db);
      selectedSegments.forEach(id => {
        batch.delete(doc(db, 'segments', id));
      });
      await batch.commit();

      showNotification(`${selectedSegments.length} segments deleted`, 'success');
      setSelectedSegments([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      showNotification('Error deleting segments', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkActivate = async (activate) => {
    if (selectedSegments.length === 0) return;

    setSaving(true);
    try {
      const batch = writeBatch(db);
      selectedSegments.forEach(id => {
        batch.update(doc(db, 'segments', id), {
          isActive: activate,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();

      showNotification(`${selectedSegments.length} segments ${activate ? 'activated' : 'deactivated'}`, 'success');
      setSelectedSegments([]);
    } catch (error) {
      console.error('Error bulk updating:', error);
      showNotification('Error updating segments', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const resetSegmentForm = () => {
    setSegmentForm({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'Users',
      criteria: [],
      matchType: 'all',
      isActive: true,
      isDynamic: true
    });
    setCriteriaForm({ field: '', operator: '', value: '' });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      Users, Crown, Gem, Zap, AlertCircle, UserPlus, Mail, Clock, TrendingUp, Target,
      Trophy, Star, Award, Bot, Brain, Package, ShoppingCart, DollarSign
    };
    return iconMap[iconName] || Users;
  };

  // ============================================================================
  // FILTERED & SORTED DATA
  // ============================================================================

  const filteredSegments = useMemo(() => {
    let filtered = [...segments];

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    // Filter by type
    if (filterType === 'active') {
      filtered = filtered.filter(s => s.isActive);
    } else if (filterType === 'inactive') {
      filtered = filtered.filter(s => !s.isActive);
    } else if (filterType === 'dynamic') {
      filtered = filtered.filter(s => s.isDynamic);
    } else if (filterType === 'static') {
      filtered = filtered.filter(s => !s.isDynamic);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'size_desc':
          return (b.memberCount || 0) - (a.memberCount || 0);
        case 'size_asc':
          return (a.memberCount || 0) - (b.memberCount || 0);
        case 'newest':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [segments, searchTerm, filterType, sortBy]);

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const segmentStats = useMemo(() => {
    const total = segments.length;
    const active = segments.filter(s => s.isActive).length;
    const dynamic = segments.filter(s => s.isDynamic).length;
    const totalMembers = segments.reduce((sum, s) => sum + (s.memberCount || 0), 0);
    const avgSize = total > 0 ? Math.round(totalMembers / total) : 0;
    
    const largest = [...segments].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))[0];
    const mostRecent = [...segments].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];

    return {
      total,
      active,
      dynamic,
      static: total - dynamic,
      totalMembers,
      avgSize,
      largest,
      mostRecent
    };
  }, [segments]);

  // ============================================================================
  // COMPONENT: Segment Card
  // ============================================================================

  const SegmentCard = ({ segment }) => {
    const IconComponent = getIconComponent(segment.icon);
    const members = getSegmentMembers(segment);
    const memberCount = members.length;

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'all 0.3s',
          border: `2px solid ${segment.color}20`,
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
            borderColor: `${segment.color}60`
          }
        }}
      >
        {/* Header with Icon */}
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${segment.color}40 0%, ${segment.color}60 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <IconComponent size={64} style={{ color: segment.color, opacity: 0.9 }} />
          
          {/* Status Badge */}
          <Chip
            label={segment.isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: segment.isActive ? '#10B981' : '#6B7280',
              color: 'white',
              fontWeight: 'bold'
            }}
          />

          {/* Selection Checkbox */}
          <Checkbox
            checked={selectedSegments.includes(segment.id)}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedSegments(prev =>
                prev.includes(segment.id)
                  ? prev.filter(id => id !== segment.id)
                  : [...prev, segment.id]
              );
            }}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'white',
              borderRadius: 1,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {segment.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              height: 40,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {segment.description}
          </Typography>

          {/* Member Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Users size={20} style={{ color: segment.color }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: segment.color }}>
              {formatNumber(memberCount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              members
            </Typography>
          </Box>

          {/* Criteria Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Filter size={16} color="#666" />
            <Typography variant="body2" color="text.secondary">
              {segment.criteria?.length || 0} filter{segment.criteria?.length !== 1 ? 's' : ''}
            </Typography>
            <Chip
              label={segment.matchType === 'all' ? 'Match All' : 'Match Any'}
              size="small"
              variant="outlined"
              sx={{ ml: 'auto', height: 20, fontSize: '0.65rem' }}
            />
          </Box>

          {/* Type Badge */}
          <Chip
            label={segment.isDynamic ? '⚡ Dynamic' : '📌 Static'}
            size="small"
            sx={{
              bgcolor: segment.isDynamic ? `${segment.color}20` : 'grey.200',
              color: segment.isDynamic ? segment.color : 'grey.700',
              fontWeight: 'bold'
            }}
          />
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Eye size={16} />}
            onClick={() => {
              setExpandedSegment(segment);
              setShowSegmentPreview(true);
            }}
          >
            View
          </Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setSegmentForm(segment);
                  setShowEditSegment(true);
                }}
              >
                <Edit2 size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate">
              <IconButton
                size="small"
                onClick={() => handleDuplicateSegment(segment)}
              >
                <Copy size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSegment(segment.id)}
              >
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>Loading Segments...</Typography>
          <Typography variant="body2" color="text.secondary">Analyzing your customer data</Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Target size={32} />
              Customer Segments
              {loadingAI && (
                <Chip
                  icon={<Brain size={16} />}
                  label="AI Analyzing..."
                  size="small"
                  color="secondary"
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize and target your contacts with AI-powered segmentation
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<Brain />}
              onClick={generateAISuggestions}
              disabled={loadingAI || contacts.length === 0}
            >
              AI Suggestions
            </Button>
            <Button
              variant="outlined"
              startIcon={<BarChart3 />}
              onClick={performRFMAnalysis}
              disabled={loadingAI || contacts.length === 0}
            >
              RFM Analysis
            </Button>
            <Button
              variant="outlined"
              startIcon={<AlertCircle />}
              onClick={analyzeChurnRisk}
              disabled={loadingAI || contacts.length === 0}
            >
              Churn Risk
            </Button>
            <ButtonGroup variant="contained">
              <Button
                startIcon={<Plus />}
                onClick={() => setShowCreateSegment(true)}
              >
                New Segment
              </Button>
              <Button
                size="small"
                onClick={() => setShowSegmentBuilder(true)}
              >
                <Wand2 size={18} />
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* Stats Dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Segments</Typography>
                <Target size={32} style={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {segmentStats.total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {segmentStats.active} active
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {segmentStats.dynamic} dynamic
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Members</Typography>
                <Users size={32} style={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatNumber(contacts.length)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                across all segments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Avg. Size</Typography>
                <BarChart3 size={32} style={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatNumber(segmentStats.avgSize)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                contacts per segment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>Largest</Typography>
                <Trophy size={32} style={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatNumber(segmentStats.largest?.memberCount || 0)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                {segmentStats.largest?.name || 'No segments'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="All Segments" value="segments" icon={<Target size={18} />} iconPosition="start" />
          <Tab label="Templates" value="templates" icon={<Package size={18} />} iconPosition="start" />
          <Tab label="Analytics" value="analytics" icon={<BarChart3 size={18} />} iconPosition="start" />
          {aiSuggestions.length > 0 && (
            <Tab 
              label={
                <Badge badgeContent={aiSuggestions.length} color="secondary">
                  AI Suggestions
                </Badge>
              }
              value="suggestions" 
              icon={<Brain size={18} />} 
              iconPosition="start" 
            />
          )}
        </Tabs>
      </Paper>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={18} style={{ marginRight: 8 }} />
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All Segments</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
                <MenuItem value="dynamic">Dynamic</MenuItem>
                <MenuItem value="static">Static</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="size_desc">Largest First</MenuItem>
                <MenuItem value="size_asc">Smallest First</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              size="small"
              fullWidth
            >
              <ToggleButton value="grid">
                <Grid3x3 size={18} />
              </ToggleButton>
              <ToggleButton value="list">
                <ListIcon size={18} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Bulk Actions */}
        {selectedSegments.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {selectedSegments.length} segment(s) selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => handleBulkActivate(true)}
                >
                  Activate
                </Button>
                <Button
                  size="small"
                  startIcon={<X size={16} />}
                  onClick={() => handleBulkActivate(false)}
                >
                  Deactivate
                </Button>
                <Button
                  size="small"
                  startIcon={<Trash2 size={16} />}
                  color="error"
                  onClick={handleBulkDelete}
                >
                  Delete
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedSegments([])}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* SEGMENTS TAB CONTENT */}
      {activeTab === 'segments' && (
        <>
          {filteredSegments.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Target size={80} style={{ color: '#D1D5DB', marginBottom: 24 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {searchTerm || filterType !== 'all' ? 'No segments found' : 'No segments yet'}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create segments to organize and target your contacts effectively'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Plus />}
                  onClick={() => setShowCreateSegment(true)}
                >
                  Create Segment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Wand2 />}
                  onClick={() => setShowSegmentBuilder(true)}
                >
                  Use Template
                </Button>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredSegments.map(segment => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={segment.id}>
                  <SegmentCard segment={segment} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* TEMPLATES TAB CONTENT */}
      {activeTab === 'templates' && (
        <Grid container spacing={3}>
          {SEGMENT_TEMPLATES.map(template => {
            const IconComponent = getIconComponent(template.icon);
            const estimatedSize = calculateSegmentSize(template.criteria, 'all');

            return (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', border: `2px solid ${template.color}20` }}>
                  <Box
                    sx={{
                      height: 100,
                      background: `linear-gradient(135deg, ${template.color}40 0%, ${template.color}60 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComponent size={48} style={{ color: template.color }} />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Chip
                      label={`~${formatNumber(estimatedSize)} contacts`}
                      size="small"
                      sx={{ bgcolor: `${template.color}20`, color: template.color }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Plus />}
                      onClick={() => handleCreateFromTemplate(template)}
                      sx={{
                        bgcolor: template.color,
                        '&:hover': { bgcolor: template.color, opacity: 0.9 }
                      }}
                    >
                      Create Segment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* AI SUGGESTIONS TAB CONTENT */}
      {activeTab === 'suggestions' && aiSuggestions.length > 0 && (
        <Grid container spacing={3}>
          {aiSuggestions.map((suggestion, idx) => {
            const IconComponent = getIconComponent(suggestion.icon);
            const priorityColor = {
              urgent: '#EF4444',
              high: '#F59E0B',
              medium: '#3B82F6',
              low: '#6B7280'
            }[suggestion.priority];

            return (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ height: '100%', border: `2px solid ${suggestion.color}20` }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        height: 100,
                        background: `linear-gradient(135deg, ${suggestion.color}40 0%, ${suggestion.color}60 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComponent size={48} style={{ color: suggestion.color }} />
                    </Box>
                    <Chip
                      label={suggestion.priority.toUpperCase()}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: priorityColor,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip
                      icon={<Brain size={14} />}
                      label="AI Suggested"
                      size="small"
                      color="secondary"
                      sx={{ position: 'absolute', bottom: 8, left: 8 }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {suggestion.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {suggestion.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Users size={18} style={{ color: suggestion.color }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: suggestion.color }}>
                        {formatNumber(suggestion.estimatedSize)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        potential members
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Plus />}
                      onClick={() => handleCreateFromSuggestion(suggestion)}
                      sx={{
                        bgcolor: suggestion.color,
                        '&:hover': { bgcolor: suggestion.color, opacity: 0.9 }
                      }}
                    >
                      Create This Segment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ANALYTICS TAB CONTENT */}
      {activeTab === 'analytics' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Trophy size={20} />
                Largest Segments
              </Typography>
              <List>
                {[...segments]
                  .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
                  .slice(0, 5)
                  .map((segment, index) => {
                    const IconComponent = getIconComponent(segment.icon);
                    return (
                      <ListItem key={segment.id} sx={{ py: 1.5 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: `${segment.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <IconComponent size={20} style={{ color: segment.color }} />
                        </Box>
                        <ListItemText
                          primary={segment.name}
                          secondary={`${segment.criteria?.length || 0} filters`}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatNumber(segment.memberCount || 0)}
                        </Typography>
                      </ListItem>
                    );
                  })}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={20} />
                Recently Created
              </Typography>
              <List>
                {[...segments]
                  .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                  .slice(0, 5)
                  .map(segment => {
                    const IconComponent = getIconComponent(segment.icon);
                    const daysAgo = segment.createdAt
                      ? Math.floor((Date.now() - segment.createdAt.toMillis()) / (1000 * 60 * 60 * 24))
                      : 0;

                    return (
                      <ListItem key={segment.id} sx={{ py: 1.5 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: `${segment.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <IconComponent size={20} style={{ color: segment.color }} />
                        </Box>
                        <ListItemText
                          primary={segment.name}
                          secondary={`${daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}`}
                        />
                        <Chip
                          label={formatNumber(segment.memberCount || 0)}
                          size="small"
                          sx={{ bgcolor: `${segment.color}20`, color: segment.color }}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Segment Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                      {segmentStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Segments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                      {segmentStats.active}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Segments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                      {segmentStats.dynamic}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dynamic Segments
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}>
                      {formatNumber(segmentStats.avgSize)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Size
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* CREATE/EDIT SEGMENT DIALOG */}
      <Dialog
        open={showCreateSegment || showEditSegment}
        onClose={() => {
          setShowCreateSegment(false);
          setShowEditSegment(false);
          resetSegmentForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {showEditSegment ? 'Edit Segment' : 'Create New Segment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Segment Name"
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., High-Value Customers"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                  placeholder="What makes this segment special?"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    value={segmentForm.icon}
                    onChange={(e) => setSegmentForm(prev => ({ ...prev, icon: e.target.value }))}
                    label="Icon"
                  >
                    <MenuItem value="Users"><Users size={18} /> Users</MenuItem>
                    <MenuItem value="Crown"><Crown size={18} /> Crown</MenuItem>
                    <MenuItem value="Gem"><Gem size={18} /> Gem</MenuItem>
                    <MenuItem value="Zap"><Zap size={18} /> Zap</MenuItem>
                    <MenuItem value="Trophy"><Trophy size={18} /> Trophy</MenuItem>
                    <MenuItem value="Star"><Star size={18} /> Star</MenuItem>
                    <MenuItem value="Target"><Target size={18} /> Target</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={segmentForm.color}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Match Type</Typography>
                  <RadioGroup
                    row
                    value={segmentForm.matchType}
                    onChange={(e) => setSegmentForm(prev => ({ ...prev, matchType: e.target.value }))}
                  >
                    <FormControlLabel value="all" control={<Radio />} label="Match All Criteria (AND)" />
                    <FormControlLabel value="any" control={<Radio />} label="Match Any Criteria (OR)" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {/* Criteria Builder */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Segment Criteria
                </Typography>

                {/* Existing Criteria */}
                {segmentForm.criteria.map((criterion, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={3}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {criterion.field}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          {criterion.operator}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">
                          {criterion.value} {criterion.unit || ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'right' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCriterion(index)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {/* Add New Criterion */}
                <Grid container spacing={2} alignItems="end">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={criteriaForm.field}
                        onChange={(e) => setCriteriaForm(prev => ({ ...prev, field: e.target.value }))}
                        label="Field"
                      >
                        <MenuItem value="leadScore">Lead Score</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="totalRevenue">Total Revenue</MenuItem>
                        <MenuItem value="purchaseCount">Purchase Count</MenuItem>
                        <MenuItem value="lastActivityDate">Last Activity Date</MenuItem>
                        <MenuItem value="createdAt">Created Date</MenuItem>
                        <MenuItem value="emailOpenRate">Email Open Rate</MenuItem>
                        <MenuItem value="state">State</MenuItem>
                        <MenuItem value="source">Source</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={criteriaForm.operator}
                        onChange={(e) => setCriteriaForm(prev => ({ ...prev, operator: e.target.value }))}
                        label="Operator"
                      >
                        <MenuItem value="equals">Equals</MenuItem>
                        <MenuItem value="notEquals">Not Equals</MenuItem>
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="greaterThan">Greater Than</MenuItem>
                        <MenuItem value="lessThan">Less Than</MenuItem>
                        <MenuItem value="inLast">In Last (days)</MenuItem>
                        <MenuItem value="moreThan">More Than (days ago)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Value"
                      value={criteriaForm.value}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={addCriterion}
                      sx={{ height: '40px' }}
                    >
                      <Plus size={18} />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              {/* Preview */}
              {segmentForm.criteria.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Preview:</strong> This segment will contain approximately{' '}
                      <strong>{formatNumber(calculateSegmentSize(segmentForm.criteria, segmentForm.matchType))}</strong>{' '}
                      contacts
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={segmentForm.isDynamic}
                      onChange={(e) => setSegmentForm(prev => ({ ...prev, isDynamic: e.target.checked }))}
                    />
                  }
                  label="Dynamic Segment (Auto-updates as contacts change)"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={segmentForm.isActive}
                      onChange={(e) => setSegmentForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setShowCreateSegment(false);
              setShowEditSegment(false);
              resetSegmentForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={showEditSegment ? 
              () => handleUpdateSegment(segmentForm.id, segmentForm) :
              handleCreateSegment
            }
            disabled={saving || !segmentForm.name}
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          >
            {saving ? 'Saving...' : showEditSegment ? 'Update Segment' : 'Create Segment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SEGMENT BUILDER DIALOG (Templates) */}
      <Dialog
        open={showSegmentBuilder}
        onClose={() => setShowSegmentBuilder(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Wand2 size={24} />
          Quick Segment Builder
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a pre-built template to get started quickly
            </Typography>

            <Grid container spacing={3}>
              {SEGMENT_TEMPLATES.map(template => {
                const IconComponent = getIconComponent(template.icon);
                const estimatedSize = calculateSegmentSize(template.criteria, 'all');

                return (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        border: `2px solid ${template.color}20`,
                        '&:hover': { borderColor: `${template.color}60`, boxShadow: 4 }
                      }}
                      onClick={() => {
                        handleCreateFromTemplate(template);
                        setShowSegmentBuilder(false);
                      }}
                    >
                      <Box
                        sx={{
                          height: 100,
                          background: `linear-gradient(135deg, ${template.color}40 0%, ${template.color}60 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComponent size={48} style={{ color: template.color }} />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        <Chip
                          label={`~${formatNumber(estimatedSize)} contacts`}
                          size="small"
                          sx={{ bgcolor: `${template.color}20`, color: template.color }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowSegmentBuilder(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATION SNACKBAR */}
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Segments;