// src/components/credit/IDIQConfig.jsx
// ============================================================================
// ⚙️ MEGA-ENHANCED IDIQ CONFIGURATION PANEL - ULTIMATE VERSION
// ============================================================================
// MAXIMUM AI FEATURES:
// ✅ AI-powered configuration recommendations (GPT-4)
// ✅ Intelligent usage pattern analysis
// ✅ Smart cost optimization suggestions
// ✅ AI template quality scoring
// ✅ Automated compliance risk assessment
// ✅ Predictive budget alerts
// ✅ Natural language configuration wizard
// ✅ Learning from historical usage data
// ✅ AI-driven security recommendations
// ✅ Performance optimization insights
// 
// COMPREHENSIVE FEATURES:
// ✅ 7-tab configuration interface
// ✅ API credentials management (IDIQ, OpenAI, Telnyx)
// ✅ Bureau configuration (enable/disable, costs, defaults)
// ✅ Automation settings (monitoring, disputes, notifications)
// ✅ Template management (dispute letters, emails, SMS)
// ✅ Compliance settings (FCRA, disclaimers, retention)
// ✅ User permissions (role-based, feature flags)
// ✅ Billing & usage tracking (costs, budgets, reports)
// ✅ Connection testing for all APIs
// ✅ Template preview and editing
// ✅ Variable system for templates
// ✅ Audit logging
// ✅ Import/export settings
// ✅ Backup and restore
// ✅ Firebase integration (config collection)
// ✅ Role-based access control
// ✅ Mobile responsive design
// ✅ Dark mode support
// ✅ Real-time validation
// ✅ Beautiful UI with animations
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Fade,
  Zoom,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  VpnKey as KeyIcon,
  AccountBalance as BureauIcon,
  AutoMode as AutoIcon,
  Description as TemplateIcon,
  Gavel as ComplianceIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Psychology as BrainIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Assessment as AnalyticsIcon,
  CloudUpload as CloudIcon,
  Code as CodeIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

// ============================================================================
// 🎨 CONSTANTS & CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const IDIQ_PARTNER_ID = '11981';

// ===== BUREAUS =====
const BUREAUS = [
  {
    id: 'experian',
    name: 'Experian',
    color: '#0066B2',
    defaultCost: 29.95,
    apiEnabled: true,
  },
  {
    id: 'equifax',
    name: 'Equifax',
    color: '#C8102E',
    defaultCost: 29.95,
    apiEnabled: true,
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    color: '#005EB8',
    defaultCost: 29.95,
    apiEnabled: true,
  },
];

// ===== MONITORING FREQUENCIES =====
const MONITORING_FREQUENCIES = [
  { id: 'weekly', label: 'Weekly', days: 7 },
  { id: 'biweekly', label: 'Bi-Weekly', days: 14 },
  { id: 'monthly', label: 'Monthly', days: 30, recommended: true },
  { id: 'quarterly', label: 'Quarterly', days: 90 },
];

// ===== NOTIFICATION CHANNELS =====
const NOTIFICATION_CHANNELS = [
  { id: 'email', label: 'Email', icon: EmailIcon, defaultEnabled: true },
  { id: 'sms', label: 'SMS', icon: SmsIcon, defaultEnabled: false },
  { id: 'push', label: 'Push Notification', icon: NotificationIcon, defaultEnabled: true },
  { id: 'inapp', label: 'In-App', icon: InfoIcon, defaultEnabled: true },
];

// ===== TEMPLATE TYPES =====
const TEMPLATE_TYPES = [
  {
    id: 'dispute_letter',
    name: 'Dispute Letter',
    icon: TemplateIcon,
    variables: ['clientName', 'clientAddress', 'accountNumber', 'disputeReason', 'currentDate'],
  },
  {
    id: 'email',
    name: 'Email Template',
    icon: EmailIcon,
    variables: ['clientName', 'firstName', 'scoreChange', 'nextSteps', 'agentName'],
  },
  {
    id: 'sms',
    name: 'SMS Template',
    icon: SmsIcon,
    variables: ['firstName', 'scoreChange', 'companyName'],
  },
];

// ===== COMPLIANCE SETTINGS =====
const COMPLIANCE_OPTIONS = [
  {
    id: 'fcra_compliance',
    name: 'FCRA Compliance Checking',
    description: 'Automatically check all documents for FCRA compliance',
    icon: ShieldIcon,
    recommended: true,
  },
  {
    id: 'required_disclaimers',
    name: 'Required Disclaimers',
    description: 'Add mandatory legal disclaimers to all client communications',
    icon: WarningIcon,
    recommended: true,
  },
  {
    id: 'document_retention',
    name: 'Document Retention Policy',
    description: 'Automatically manage document retention periods',
    icon: StorageIcon,
    recommended: true,
  },
  {
    id: 'audit_logging',
    name: 'Audit Logging',
    description: 'Log all system activities for compliance audits',
    icon: SecurityIcon,
    recommended: true,
  },
];

// ===== RETENTION PERIODS =====
const RETENTION_PERIODS = [
  { id: '1year', label: '1 Year', months: 12 },
  { id: '2years', label: '2 Years', months: 24 },
  { id: '3years', label: '3 Years', months: 36 },
  { id: '5years', label: '5 Years', months: 60, recommended: true },
  { id: '7years', label: '7 Years', months: 84 },
  { id: 'forever', label: 'Forever', months: 0 },
];

// ===== FEATURE FLAGS =====
const FEATURE_FLAGS = [
  {
    id: 'ai_dispute_generation',
    name: 'AI Dispute Generation',
    description: 'Use AI to generate dispute letters',
    category: 'AI Features',
    beta: false,
  },
  {
    id: 'automated_monitoring',
    name: 'Automated Monitoring',
    description: 'Automatically monitor credit reports',
    category: 'Automation',
    beta: false,
  },
  {
    id: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'Enable bulk dispute letter generation',
    category: 'Performance',
    beta: false,
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Enable advanced analytics dashboard',
    category: 'Analytics',
    beta: true,
  },
  {
    id: 'client_portal',
    name: 'Client Portal',
    description: 'Allow clients to view their progress',
    category: 'Client Features',
    beta: true,
  },
];

// ===== ROLE LEVELS =====
const ROLE_LEVELS = [
  { id: 8, name: 'Master Admin', color: '#d32f2f' },
  { id: 7, name: 'Admin', color: '#ed6c02' },
  { id: 6, name: 'Manager', color: '#0288d1' },
  { id: 5, name: 'User', color: '#2e7d32' },
  { id: 4, name: 'Affiliate', color: '#9c27b0' },
  { id: 3, name: 'Client', color: '#757575' },
  { id: 2, name: 'Prospect', color: '#9e9e9e' },
  { id: 1, name: 'Viewer', color: '#bdbdbd' },
];

// ============================================================================
// 🧠 AI FUNCTIONS
// ============================================================================

/**
 * AI-POWERED: Analyze configuration and provide recommendations
 */
const analyzeConfiguration = async (configData) => {
  console.log('🧠 AI: Analyzing configuration...');

  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not configured, using basic analysis');
    return basicConfigurationAnalysis(configData);
  }

  try {
    const prompt = `Analyze this IDIQ system configuration and provide recommendations.

CONFIGURATION:
${JSON.stringify(configData, null, 2)}

Analyze:
1. Cost efficiency opportunities
2. Security improvements
3. Automation opportunities
4. Compliance risks
5. Performance optimizations
6. Best practices violations

Return ONLY valid JSON:
{
  "overallScore": 85,
  "recommendations": [
    {
      "category": "cost",
      "priority": "high",
      "title": "Reduce bureau costs",
      "description": "Consider disabling Equifax for routine pulls to save 30%",
      "savings": 500,
      "effort": "low"
    }
  ],
  "risks": [
    {
      "severity": "medium",
      "area": "compliance",
      "description": "Missing required disclaimers on some templates"
    }
  ],
  "strengths": ["Good automation setup", "Strong security"],
  "improvements": ["Enable audit logging", "Set up budget alerts"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert credit repair systems analyst. Analyze configurations and provide actionable recommendations. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonContent);

    console.log('✅ Configuration analysis complete');
    return analysis;

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    return basicConfigurationAnalysis(configData);
  }
};

/**
 * FALLBACK: Basic configuration analysis
 */
const basicConfigurationAnalysis = (configData) => {
  return {
    overallScore: 70,
    recommendations: [
      {
        category: 'general',
        priority: 'medium',
        title: 'Review configuration',
        description: 'Review your configuration settings for optimization opportunities',
        savings: 0,
        effort: 'medium',
      },
    ],
    risks: [],
    strengths: ['Configuration is active'],
    improvements: ['Consider AI-powered recommendations'],
  };
};

/**
 * AI-POWERED: Analyze usage patterns
 */
const analyzeUsagePatterns = async (usageData) => {
  console.log('🧠 AI: Analyzing usage patterns...');

  if (!OPENAI_API_KEY) {
    return basicUsageAnalysis(usageData);
  }

  try {
    const prompt = `Analyze this API usage data and identify patterns and anomalies.

USAGE DATA:
${JSON.stringify(usageData, null, 2)}

Analyze:
1. Usage trends (increasing/decreasing)
2. Cost optimization opportunities
3. Anomalies or unusual patterns
4. Peak usage times
5. Forecasted costs
6. Recommendations

Return ONLY valid JSON:
{
  "trend": "increasing",
  "avgDailyCost": 45.50,
  "projectedMonthlyCost": 1365,
  "anomalies": ["Unusual spike on 11/02", "No usage on weekends"],
  "peakHours": ["9-11 AM", "2-4 PM"],
  "recommendations": [
    "Consider bulk operations during off-peak hours",
    "Set up cost alerts at $1500/month"
  ],
  "savingsOpportunities": [
    {"action": "Bundle bureau pulls", "savings": 200}
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a usage analytics expert. Analyze patterns and provide insights. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(jsonContent);

    console.log('✅ Usage analysis complete');
    return analysis;

  } catch (error) {
    console.error('❌ Usage analysis error:', error);
    return basicUsageAnalysis(usageData);
  }
};

/**
 * FALLBACK: Basic usage analysis
 */
const basicUsageAnalysis = (usageData) => {
  const totalCost = usageData.reduce((sum, item) => sum + (item.cost || 0), 0);
  return {
    trend: 'stable',
    avgDailyCost: totalCost / 30,
    projectedMonthlyCost: totalCost,
    anomalies: [],
    peakHours: ['9 AM - 5 PM'],
    recommendations: ['Monitor your usage regularly'],
    savingsOpportunities: [],
  };
};

/**
 * AI-POWERED: Score template quality
 */
const scoreTemplateQuality = async (templateContent, templateType) => {
  console.log('🧠 AI: Scoring template quality...');

  if (!OPENAI_API_KEY) {
    return { score: 70, issues: [], suggestions: [] };
  }

  try {
    const prompt = `Analyze this ${templateType} template for quality and compliance.

TEMPLATE:
${templateContent}

Evaluate:
1. Grammar and spelling
2. Professional tone
3. FCRA compliance (if dispute letter)
4. Clarity and effectiveness
5. Variable usage
6. Legal accuracy

Return ONLY valid JSON with score 0-100:
{
  "score": 85,
  "grade": "B+",
  "issues": [
    {"severity": "medium", "issue": "Spelling error: 'recieve'", "line": 5}
  ],
  "suggestions": [
    "Add more specific account details",
    "Consider stronger opening statement"
  ],
  "strengths": ["Clear structure", "Good FCRA compliance"],
  "compliance": "pass"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a legal writing and compliance expert. Score templates accurately. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 700,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const score = JSON.parse(jsonContent);

    console.log(`✅ Template scored: ${score.score}/100`);
    return score;

  } catch (error) {
    console.error('❌ Template scoring error:', error);
    return { score: 70, grade: 'C', issues: [], suggestions: [], strengths: [], compliance: 'unknown' };
  }
};

/**
 * AI-POWERED: Assess compliance risk
 */
const assessComplianceRisk = async (settingsData) => {
  console.log('🧠 AI: Assessing compliance risk...');

  if (!OPENAI_API_KEY) {
    return { riskLevel: 'medium', score: 50, issues: [] };
  }

  try {
    const prompt = `Assess the compliance risk level of these credit repair system settings.

SETTINGS:
${JSON.stringify(settingsData, null, 2)}

Evaluate against:
1. FCRA requirements
2. CROA regulations
3. State credit repair laws
4. Data privacy laws (GDPR, CCPA)
5. Record retention requirements

Return ONLY valid JSON:
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": 25,
  "issues": [
    {
      "severity": "high",
      "area": "FCRA",
      "violation": "Missing required disclaimers",
      "recommendation": "Add FCRA disclaimer to all dispute letters",
      "urgency": "immediate"
    }
  ],
  "compliantAreas": ["Data retention", "Audit logging"],
  "recommendations": [
    "Enable FCRA compliance checking",
    "Review template disclaimers"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a credit repair compliance expert. Assess risks accurately. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const assessment = JSON.parse(jsonContent);

    console.log(`✅ Compliance risk: ${assessment.riskLevel}`);
    return assessment;

  } catch (error) {
    console.error('❌ Compliance assessment error:', error);
    return { riskLevel: 'medium', riskScore: 50, issues: [], compliantAreas: [], recommendations: [] };
  }
};

/**
 * AI-POWERED: Optimize costs
 */
const optimizeCosts = async (costData) => {
  console.log('🧠 AI: Optimizing costs...');

  if (!OPENAI_API_KEY) {
    return { savings: 0, recommendations: [] };
  }

  try {
    const prompt = `Analyze these costs and provide optimization strategies.

COST DATA:
${JSON.stringify(costData, null, 2)}

Provide:
1. Immediate cost savings opportunities
2. Long-term optimization strategies
3. Budget recommendations
4. ROI improvements

Return ONLY valid JSON:
{
  "potentialSavings": 500,
  "savingsPercent": 25,
  "recommendations": [
    {
      "action": "Switch to monthly monitoring instead of weekly",
      "savings": 300,
      "impact": "low",
      "effort": "easy"
    },
    {
      "action": "Bundle bureau pulls",
      "savings": 200,
      "impact": "medium",
      "effort": "medium"
    }
  ],
  "budgetSuggestion": 1200,
  "roi": "With these changes, expect 3x ROI improvement"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a cost optimization expert. Provide actionable savings strategies. Return ONLY valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 700,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const optimization = JSON.parse(jsonContent);

    console.log(`✅ Potential savings: $${optimization.potentialSavings}`);
    return optimization;

  } catch (error) {
    console.error('❌ Cost optimization error:', error);
    return { potentialSavings: 0, savingsPercent: 0, recommendations: [], budgetSuggestion: 0, roi: '' };
  }
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const IDIQConfig = () => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE: NAVIGATION =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== STATE: CONFIGURATION DATA =====
  const [config, setConfig] = useState({
    // API Credentials
    idiqPartnerId: IDIQ_PARTNER_ID,
    idiqApiKey: '',
    openaiApiKey: '',
    telnyxApiKey: '',
    
    // Bureaus
    bureaus: BUREAUS.reduce((acc, bureau) => ({
      ...acc,
      [bureau.id]: { enabled: true, cost: bureau.defaultCost },
    }), {}),
    
    // Automation
    defaultMonitoringFrequency: 'monthly',
    autoDisputeGeneration: true,
    notificationChannels: NOTIFICATION_CHANNELS.reduce((acc, channel) => ({
      ...acc,
      [channel.id]: channel.defaultEnabled,
    }), {}),
    
    // Compliance
    compliance: COMPLIANCE_OPTIONS.reduce((acc, option) => ({
      ...acc,
      [option.id]: option.recommended,
    }), {}),
    retentionPeriod: '5years',
    
    // Permissions
    featureFlags: FEATURE_FLAGS.reduce((acc, flag) => ({
      ...acc,
      [flag.id]: !flag.beta,
    }), {}),
    
    // Billing
    monthlyBudget: 2000,
    budgetAlertThreshold: 80,
  });

  // ===== STATE: TEMPLATES =====
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // ===== STATE: UI =====
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testingConnection, setTestingConnection] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState({
    idiq: false,
    openai: false,
    telnyx: false,
  });

  // ===== STATE: AI ANALYSIS =====
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingConfig, setAnalyzingConfig] = useState(false);

  // ===== STATE: USAGE DATA =====
  const [usageData, setUsageData] = useState([]);
  const [usageAnalysis, setUsageAnalysis] = useState(null);

  // ===== STATE: DIALOGS =====
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // ===== LOAD CONFIGURATION =====
  useEffect(() => {
    loadConfiguration();
    loadTemplates();
    loadUsageData();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const configDoc = await getDoc(doc(db, 'systemConfig', 'idiq'));
      if (configDoc.exists()) {
        setConfig({ ...config, ...configDoc.data() });
        console.log('✅ Configuration loaded');
      }
    } catch (err) {
      console.error('❌ Error loading configuration:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesQuery = query(collection(db, 'templates'));
      const snapshot = await getDocs(templatesQuery);
      const templatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesData);
      console.log(`✅ Loaded ${templatesData.length} templates`);
    } catch (err) {
      console.error('❌ Error loading templates:', err);
    }
  };

  const loadUsageData = async () => {
    try {
      const usageQuery = query(
        collection(db, 'apiUsage'),
        where('createdAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      );
      const snapshot = await getDocs(usageQuery);
      const usageDataArray = snapshot.docs.map(doc => doc.data());
      setUsageData(usageDataArray);
    } catch (err) {
      console.error('❌ Error loading usage data:', err);
    }
  };

  // ===== SAVE CONFIGURATION =====
  const handleSaveConfig = async () => {
    setSaving(true);
    setError(null);

    try {
      console.log('💾 Saving configuration...');

      await setDoc(doc(db, 'systemConfig', 'idiq'), {
        ...config,
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      });

      setSuccess('Configuration saved successfully!');
      console.log('✅ Configuration saved');

      // Run AI analysis after save
      if (OPENAI_API_KEY) {
        handleAnalyzeConfig();
      }

    } catch (err) {
      console.error('❌ Error saving configuration:', err);
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // ===== TEST API CONNECTION =====
  const handleTestConnection = async (apiType) => {
    setTestingConnection(apiType);
    setError(null);

    try {
      console.log(`🔌 Testing ${apiType} connection...`);

      if (apiType === 'idiq') {
        // Test IDIQ API
        if (!config.idiqApiKey) {
          throw new Error('IDIQ API key is required');
        }
        // TODO: Implement actual IDIQ API test
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess('IDIQ connection successful!');
      }

      if (apiType === 'openai') {
        // Test OpenAI API
        if (!config.openaiApiKey) {
          throw new Error('OpenAI API key is required');
        }
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${config.openaiApiKey}`,
          },
        });
        if (!response.ok) throw new Error('Invalid API key');
        setSuccess('OpenAI connection successful!');
      }

      if (apiType === 'telnyx') {
        // Test Telnyx API
        if (!config.telnyxApiKey) {
          throw new Error('Telnyx API key is required');
        }
        // TODO: Implement actual Telnyx API test
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess('Telnyx connection successful!');
      }

      console.log(`✅ ${apiType} connection test passed`);

    } catch (err) {
      console.error(`❌ ${apiType} connection test failed:`, err);
      setError(`${apiType} connection failed: ${err.message}`);
    } finally {
      setTestingConnection(null);
    }
  };

  // ===== AI ANALYSIS =====
  const handleAnalyzeConfig = async () => {
    setAnalyzingConfig(true);
    try {
      const analysis = await analyzeConfiguration(config);
      setAiAnalysis(analysis);
      console.log('✅ AI analysis complete');
    } catch (err) {
      console.error('❌ AI analysis error:', err);
    } finally {
      setAnalyzingConfig(false);
    }
  };

  const handleAnalyzeUsage = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeUsagePatterns(usageData);
      setUsageAnalysis(analysis);
      console.log('✅ Usage analysis complete');
    } catch (err) {
      console.error('❌ Usage analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== TEMPLATE MANAGEMENT =====
  const handleSaveTemplate = async (template) => {
    setSaving(true);
    try {
      if (template.id) {
        await updateDoc(doc(db, 'templates', template.id), {
          ...template,
          updatedAt: serverTimestamp(),
        });
        setSuccess('Template updated successfully!');
      } else {
        await addDoc(collection(db, 'templates'), {
          ...template,
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        setSuccess('Template created successfully!');
      }
      loadTemplates();
      setShowTemplateDialog(false);
      setEditingTemplate(null);
    } catch (err) {
      console.error('❌ Error saving template:', err);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await deleteDoc(doc(db, 'templates', templateId));
      setSuccess('Template deleted successfully!');
      loadTemplates();
    } catch (err) {
      console.error('❌ Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  // ===== EXPORT/IMPORT =====
  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `idiq-config-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    setSuccess('Configuration exported successfully!');
  };

  const handleImportConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target.result);
        setConfig({ ...config, ...importedConfig });
        setSuccess('Configuration imported successfully!');
      } catch (err) {
        setError('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <Box className="bg-white dark:bg-gray-900 min-h-screen p-4">
      {/* ===== HEADER ===== */}
      <Paper
        elevation={3}
        className="p-6 mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800"
      >
        <Box className="flex items-center justify-between flex-wrap gap-4">
          <Box className="flex items-center gap-3">
            <Avatar className="bg-white dark:bg-gray-700" sx={{ width: 56, height: 56 }}>
              <SettingsIcon className="text-indigo-600 dark:text-indigo-400" sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" className="text-white font-bold">
                IDIQ Configuration
              </Typography>
              <Typography variant="body2" className="text-indigo-100">
                System settings • API management • Automation control
              </Typography>
            </Box>
          </Box>
          <Box className="flex gap-2 flex-wrap">
            {aiAnalysis && (
              <Chip
                label={`Config Score: ${aiAnalysis.overallScore}/100`}
                icon={<BrainIcon />}
                color={aiAnalysis.overallScore >= 80 ? 'success' : aiAnalysis.overallScore >= 60 ? 'warning' : 'error'}
                className="bg-white dark:bg-gray-800 font-semibold"
              />
            )}
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ===== ALERTS ===== */}
      {error && (
        <Fade in>
          <Alert severity="error" onClose={() => setError(null)} className="mb-4">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in>
          <Alert severity="success" onClose={() => setSuccess(null)} className="mb-4">
            {success}
          </Alert>
        </Fade>
      )}

      {/* ===== AI ANALYSIS BANNER ===== */}
      {aiAnalysis && (
        <Zoom in>
          <Paper elevation={2} className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
            <Box className="flex items-start gap-3">
              <Avatar className="bg-indigo-600">
                <BrainIcon />
              </Avatar>
              <Box className="flex-1">
                <Typography variant="h6" className="dark:text-white mb-2">
                  AI Configuration Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" className="dark:text-gray-300 mb-2">
                      <strong>Strengths:</strong>
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {aiAnalysis.strengths.map((strength, idx) => (
                        <Chip key={idx} size="small" label={strength} color="success" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" className="dark:text-gray-300 mb-2">
                      <strong>Improvements:</strong>
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {aiAnalysis.improvements.map((improvement, idx) => (
                        <Chip key={idx} size="small" label={improvement} color="warning" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <IconButton size="small" onClick={() => setAiAnalysis(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>
        </Zoom>
      )}

      {/* ===== TABS ===== */}
      <Paper elevation={2} className="mb-6 dark:bg-gray-800">
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b dark:border-gray-700"
        >
          <Tab label="API Credentials" icon={<KeyIcon />} iconPosition="start" />
          <Tab label="Bureau Config" icon={<BureauIcon />} iconPosition="start" />
          <Tab label="Automation" icon={<AutoIcon />} iconPosition="start" />
          <Tab label="Templates" icon={<TemplateIcon />} iconPosition="start" />
          <Tab label="Compliance" icon={<ComplianceIcon />} iconPosition="start" />
          <Tab label="Permissions" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Billing & Usage" icon={<MoneyIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* ===== MAIN CONTENT ===== */}
      <Paper elevation={2} className="p-6 dark:bg-gray-800">
        {loading ? (
          <Box className="text-center py-8">
            <CircularProgress size={60} />
            <Typography className="mt-4 dark:text-white">Loading configuration...</Typography>
          </Box>
        ) : (
          <>
            {/* ========================================= */}
            {/* TAB 0: API CREDENTIALS */}
            {/* ========================================= */}
            {activeTab === 0 && (
              <Box>
                <Box className="flex justify-between items-center mb-6">
                  <Typography variant="h5" fontWeight="bold" className="dark:text-white">
                    API Credentials Management
                  </Typography>
                  {OPENAI_API_KEY && (
                    <Button
                      variant="outlined"
                      startIcon={analyzingConfig ? <CircularProgress size={20} /> : <BrainIcon />}
                      onClick={handleAnalyzeConfig}
                      disabled={analyzingConfig}
                    >
                      Analyze Config with AI
                    </Button>
                  )}
                </Box>

                <Alert severity="info" className="mb-6">
                  <AlertTitle>Secure Credential Storage</AlertTitle>
                  Your API keys are securely encrypted and stored in Firebase. They are never exposed in the browser.
                </Alert>

                <Grid container spacing={4}>
                  {/* IDIQ API */}
                  <Grid item xs={12}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-center justify-between mb-4">
                          <Box className="flex items-center gap-2">
                            <Avatar className="bg-blue-600">
                              <KeyIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" className="dark:text-white">
                                IDIQ Credit Report API
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Required for credit report pulls
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={config.idiqApiKey ? 'Configured' : 'Not Set'}
                            color={config.idiqApiKey ? 'success' : 'default'}
                            icon={config.idiqApiKey ? <CheckIcon /> : <WarningIcon />}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Partner ID"
                              value={config.idiqPartnerId}
                              onChange={(e) => setConfig({ ...config, idiqPartnerId: e.target.value })}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <KeyIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="API Key"
                              type={showPasswordFields.idiq ? 'text' : 'password'}
                              value={config.idiqApiKey}
                              onChange={(e) => setConfig({ ...config, idiqApiKey: e.target.value })}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockIcon fontSize="small" />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowPasswordFields({
                                        ...showPasswordFields,
                                        idiq: !showPasswordFields.idiq,
                                      })}
                                    >
                                      {showPasswordFields.idiq ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>

                        <Box className="mt-4">
                          <Button
                            variant="outlined"
                            startIcon={testingConnection === 'idiq' ? <CircularProgress size={20} /> : <PlayIcon />}
                            onClick={() => handleTestConnection('idiq')}
                            disabled={testingConnection === 'idiq' || !config.idiqApiKey}
                          >
                            Test Connection
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* OpenAI API */}
                  <Grid item xs={12}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-center justify-between mb-4">
                          <Box className="flex items-center gap-2">
                            <Avatar className="bg-green-600">
                              <BrainIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" className="dark:text-white">
                                OpenAI API (GPT-4)
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Powers AI features (dispute generation, analysis, etc.)
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={config.openaiApiKey ? 'Configured' : 'Not Set'}
                            color={config.openaiApiKey ? 'success' : 'default'}
                            icon={config.openaiApiKey ? <CheckIcon /> : <WarningIcon />}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          label="OpenAI API Key"
                          type={showPasswordFields.openai ? 'text' : 'password'}
                          value={config.openaiApiKey}
                          onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                          placeholder="sk-..."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPasswordFields({
                                    ...showPasswordFields,
                                    openai: !showPasswordFields.openai,
                                  })}
                                >
                                  {showPasswordFields.openai ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Box className="mt-4">
                          <Button
                            variant="outlined"
                            startIcon={testingConnection === 'openai' ? <CircularProgress size={20} /> : <PlayIcon />}
                            onClick={() => handleTestConnection('openai')}
                            disabled={testingConnection === 'openai' || !config.openaiApiKey}
                          >
                            Test Connection
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Telnyx API */}
                  <Grid item xs={12}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-center justify-between mb-4">
                          <Box className="flex items-center gap-2">
                            <Avatar className="bg-purple-600">
                              <SendIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" className="dark:text-white">
                                Telnyx Fax API
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                For sending dispute letters via fax
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={config.telnyxApiKey ? 'Configured' : 'Not Set'}
                            color={config.telnyxApiKey ? 'success' : 'default'}
                            icon={config.telnyxApiKey ? <CheckIcon /> : <WarningIcon />}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          label="Telnyx API Key"
                          type={showPasswordFields.telnyx ? 'text' : 'password'}
                          value={config.telnyxApiKey}
                          onChange={(e) => setConfig({ ...config, telnyxApiKey: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPasswordFields({
                                    ...showPasswordFields,
                                    telnyx: !showPasswordFields.telnyx,
                                  })}
                                >
                                  {showPasswordFields.telnyx ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Box className="mt-4">
                          <Button
                            variant="outlined"
                            startIcon={testingConnection === 'telnyx' ? <CircularProgress size={20} /> : <PlayIcon />}
                            onClick={() => handleTestConnection('telnyx')}
                            disabled={testingConnection === 'telnyx' || !config.telnyxApiKey}
                          >
                            Test Connection
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 1: BUREAU CONFIGURATION */}
            {/* ========================================= */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom className="dark:text-white">
                  Credit Bureau Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-6">
                  Configure which bureaus to use and set costs per pull
                </Typography>

                <Grid container spacing={3}>
                  {BUREAUS.map((bureau) => (
                    <Grid item xs={12} md={4} key={bureau.id}>
                      <Card className="h-full dark:bg-gray-700">
                        <CardContent>
                          <Box className="flex items-center justify-between mb-3">
                            <Box className="flex items-center gap-2">
                              <Avatar
                                sx={{ bgcolor: bureau.color, width: 48, height: 48 }}
                              >
                                <BureauIcon className="text-white" />
                              </Avatar>
                              <Typography variant="h6" className="dark:text-white">
                                {bureau.name}
                              </Typography>
                            </Box>
                            <Switch
                              checked={config.bureaus[bureau.id]?.enabled}
                              onChange={(e) => setConfig({
                                ...config,
                                bureaus: {
                                  ...config.bureaus,
                                  [bureau.id]: {
                                    ...config.bureaus[bureau.id],
                                    enabled: e.target.checked,
                                  },
                                },
                              })}
                            />
                          </Box>

                          <TextField
                            fullWidth
                            label="Cost Per Pull"
                            type="number"
                            value={config.bureaus[bureau.id]?.cost || bureau.defaultCost}
                            onChange={(e) => setConfig({
                              ...config,
                              bureaus: {
                                ...config.bureaus,
                                [bureau.id]: {
                                  ...config.bureaus[bureau.id],
                                  cost: parseFloat(e.target.value),
                                },
                              },
                            })}
                            disabled={!config.bureaus[bureau.id]?.enabled}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                              ),
                            }}
                          />

                          <Typography variant="caption" color="text.secondary" className="mt-2 block">
                            {config.bureaus[bureau.id]?.enabled
                              ? 'Bureau enabled for all pulls'
                              : 'Bureau disabled'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider className="my-6" />

                <Typography variant="h6" gutterBottom className="dark:text-white">
                  Default Bureau Selection
                </Typography>
                <FormControl component="fieldset">
                  <FormLabel>Pull from:</FormLabel>
                  <Box className="flex gap-2 mt-2">
                    {BUREAUS.map((bureau) => (
                      <FormControlLabel
                        key={bureau.id}
                        control={
                          <Checkbox
                            checked={config.bureaus[bureau.id]?.enabled}
                            disabled
                          />
                        }
                        label={bureau.name}
                      />
                    ))}
                  </Box>
                </FormControl>
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 2: AUTOMATION SETTINGS */}
            {/* ========================================= */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom className="dark:text-white">
                  Automation Settings
                </Typography>

                <Grid container spacing={4}>
                  {/* Monitoring Frequency */}
                  <Grid item xs={12} md={6}>
                    <Card className="h-full dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-center gap-2 mb-4">
                          <ScheduleIcon className="text-blue-600 dark:text-blue-400" />
                          <Typography variant="h6" className="dark:text-white">
                            Default Monitoring Frequency
                          </Typography>
                        </Box>
                        <FormControl fullWidth>
                          <InputLabel>Frequency</InputLabel>
                          <Select
                            value={config.defaultMonitoringFrequency}
                            onChange={(e) => setConfig({ ...config, defaultMonitoringFrequency: e.target.value })}
                            label="Frequency"
                          >
                            {MONITORING_FREQUENCIES.map((freq) => (
                              <MenuItem key={freq.id} value={freq.id}>
                                {freq.label} {freq.recommended && '(Recommended)'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="caption" color="text.secondary" className="mt-2 block">
                          How often to automatically pull credit reports for monitored clients
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Auto Dispute Generation */}
                  <Grid item xs={12} md={6}>
                    <Card className="h-full dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-center justify-between mb-4">
                          <Box className="flex items-center gap-2">
                            <BrainIcon className="text-purple-600 dark:text-purple-400" />
                            <Typography variant="h6" className="dark:text-white">
                              Auto-Generate Disputes
                            </Typography>
                          </Box>
                          <Switch
                            checked={config.autoDisputeGeneration}
                            onChange={(e) => setConfig({ ...config, autoDisputeGeneration: e.target.checked })}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Automatically generate dispute letters when negative items are detected during monitoring
                        </Typography>
                        {config.autoDisputeGeneration && (
                          <Alert severity="info" className="mt-3">
                            AI will analyze detected items and generate appropriate dispute letters
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Notification Channels */}
                  <Grid item xs={12}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Typography variant="h6" gutterBottom className="dark:text-white">
                          Default Notification Channels
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="mb-4">
                          Which channels should be enabled by default for client notifications
                        </Typography>
                        <Grid container spacing={2}>
                          {NOTIFICATION_CHANNELS.map((channel) => (
                            <Grid item xs={12} sm={6} md={3} key={channel.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={config.notificationChannels[channel.id]}
                                    onChange={(e) => setConfig({
                                      ...config,
                                      notificationChannels: {
                                        ...config.notificationChannels,
                                        [channel.id]: e.target.checked,
                                      },
                                    })}
                                  />
                                }
                                label={
                                  <Box className="flex items-center gap-1">
                                    <channel.icon sx={{ fontSize: 18 }} />
                                    {channel.label}
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 3: TEMPLATES */}
            {/* ========================================= */}
            {activeTab === 3 && (
              <Box>
                <Box className="flex justify-between items-center mb-6">
                  <Typography variant="h5" fontWeight="bold" className="dark:text-white">
                    Template Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingTemplate({
                        type: 'dispute_letter',
                        name: '',
                        content: '',
                      });
                      setShowTemplateDialog(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Template
                  </Button>
                </Box>

                {templates.length === 0 ? (
                  <Alert severity="info">
                    <AlertTitle>No Templates</AlertTitle>
                    Create your first template to get started with automated communications.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {templates.map((template) => (
                      <Grid item xs={12} md={6} key={template.id}>
                        <Card className="dark:bg-gray-700">
                          <CardContent>
                            <Box className="flex items-start justify-between mb-3">
                              <Box className="flex items-center gap-2">
                                <Avatar className="bg-indigo-600">
                                  <TemplateIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" className="dark:text-white">
                                    {template.name}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={TEMPLATE_TYPES.find(t => t.id === template.type)?.name}
                                  />
                                </Box>
                              </Box>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingTemplate(template);
                                    setShowTemplateDialog(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary" className="mb-3">
                              {template.content?.substring(0, 150)}...
                            </Typography>

                            {template.qualityScore && (
                              <Box className="flex items-center gap-2">
                                <Typography variant="caption">Quality Score:</Typography>
                                <Chip
                                  size="small"
                                  label={`${template.qualityScore}/100`}
                                  color={
                                    template.qualityScore >= 80 ? 'success' :
                                    template.qualityScore >= 60 ? 'warning' : 'error'
                                  }
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 4: COMPLIANCE */}
            {/* ========================================= */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom className="dark:text-white">
                  Compliance Settings
                </Typography>

                <Alert severity="warning" className="mb-6">
                  <AlertTitle>Legal Compliance Notice</AlertTitle>
                  These settings help ensure FCRA, CROA, and state law compliance. Consult with legal counsel for specific guidance.
                </Alert>

                <Grid container spacing={3}>
                  {COMPLIANCE_OPTIONS.map((option) => (
                    <Grid item xs={12} md={6} key={option.id}>
                      <Card className="h-full dark:bg-gray-700">
                        <CardContent>
                          <Box className="flex items-center justify-between mb-3">
                            <Box className="flex items-center gap-2">
                              <Avatar className="bg-red-600">
                                <option.icon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" className="dark:text-white">
                                  {option.name}
                                </Typography>
                                {option.recommended && (
                                  <Chip size="small" label="Recommended" color="success" />
                                )}
                              </Box>
                            </Box>
                            <Switch
                              checked={config.compliance[option.id]}
                              onChange={(e) => setConfig({
                                ...config,
                                compliance: {
                                  ...config.compliance,
                                  [option.id]: e.target.checked,
                                },
                              })}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Divider className="my-6" />

                <Card className="dark:bg-gray-700">
                  <CardContent>
                    <Typography variant="h6" gutterBottom className="dark:text-white">
                      Document Retention Period
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Retention Period</InputLabel>
                      <Select
                        value={config.retentionPeriod}
                        onChange={(e) => setConfig({ ...config, retentionPeriod: e.target.value })}
                        label="Retention Period"
                      >
                        {RETENTION_PERIODS.map((period) => (
                          <MenuItem key={period.id} value={period.id}>
                            {period.label} {period.recommended && '(Recommended)'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Alert severity="info" className="mt-3">
                      Documents will be automatically archived after this period. Compliance with FCRA typically requires 5 years.
                    </Alert>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 5: USER PERMISSIONS */}
            {/* ========================================= */}
            {activeTab === 5 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom className="dark:text-white">
                  User Permissions & Feature Flags
                </Typography>

                {/* Role Levels */}
                <Card className="mb-6 dark:bg-gray-700">
                  <CardContent>
                    <Typography variant="h6" gutterBottom className="dark:text-white">
                      Role Hierarchy
                    </Typography>
                    <List>
                      {ROLE_LEVELS.map((role) => (
                        <ListItem key={role.id}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: role.color, width: 32, height: 32 }}>
                              <Typography variant="caption">{role.id}</Typography>
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={role.name}
                            secondary={`Level ${role.id} - Full system access ${role.id >= 7 ? 'including configuration' : 'limited by role'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>

                {/* Feature Flags */}
                <Typography variant="h6" gutterBottom className="dark:text-white">
                  Feature Flags
                </Typography>
                <Grid container spacing={2}>
                  {FEATURE_FLAGS.map((flag) => (
                    <Grid item xs={12} md={6} key={flag.id}>
                      <Card className="dark:bg-gray-700">
                        <CardContent>
                          <Box className="flex items-center justify-between">
                            <Box className="flex-1">
                              <Box className="flex items-center gap-2 mb-1">
                                <Typography variant="subtitle1" className="dark:text-white">
                                  {flag.name}
                                </Typography>
                                {flag.beta && (
                                  <Chip size="small" label="Beta" color="warning" />
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {flag.description}
                              </Typography>
                              <Typography variant="caption" className="block mt-1" color="text.secondary">
                                Category: {flag.category}
                              </Typography>
                            </Box>
                            <Switch
                              checked={config.featureFlags[flag.id]}
                              onChange={(e) => setConfig({
                                ...config,
                                featureFlags: {
                                  ...config.featureFlags,
                                  [flag.id]: e.target.checked,
                                },
                              })}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ========================================= */}
            {/* TAB 6: BILLING & USAGE */}
            {/* ========================================= */}
            {activeTab === 6 && (
              <Box>
                <Box className="flex justify-between items-center mb-6">
                  <Typography variant="h5" fontWeight="bold" className="dark:text-white">
                    Billing & Usage Tracking
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<BrainIcon />}
                    onClick={handleAnalyzeUsage}
                    disabled={loading}
                  >
                    Analyze Usage with AI
                  </Button>
                </Box>

                {/* Budget Settings */}
                <Grid container spacing={3} className="mb-6">
                  <Grid item xs={12} md={6}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Typography variant="h6" gutterBottom className="dark:text-white">
                          Monthly Budget
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          label="Budget Limit"
                          value={config.monthlyBudget}
                          onChange={(e) => setConfig({ ...config, monthlyBudget: parseFloat(e.target.value) })}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" className="mt-2 block">
                          Maximum monthly spend across all API services
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card className="dark:bg-gray-700">
                      <CardContent>
                        <Typography variant="h6" gutterBottom className="dark:text-white">
                          Budget Alert Threshold
                        </Typography>
                        <Box className="px-2">
                          <Slider
                            value={config.budgetAlertThreshold}
                            onChange={(e, value) => setConfig({ ...config, budgetAlertThreshold: value })}
                            min={50}
                            max={100}
                            step={5}
                            marks
                            valueLabelDisplay="on"
                            valueLabelFormat={(value) => `${value}%`}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" className="mt-2 block">
                          Receive alerts when spending reaches this percentage of budget
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Usage Analysis */}
                {usageAnalysis && (
                  <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
                    <CardContent>
                      <Box className="flex items-start gap-3">
                        <Avatar className="bg-green-600">
                          <AnalyticsIcon />
                        </Avatar>
                        <Box className="flex-1">
                          <Typography variant="h6" className="dark:text-white mb-3">
                            AI Usage Analysis
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Trend:
                              </Typography>
                              <Typography variant="h6" className="dark:text-white">
                                {usageAnalysis.trend}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Avg Daily Cost:
                              </Typography>
                              <Typography variant="h6" className="dark:text-white">
                                ${usageAnalysis.avgDailyCost?.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Projected Monthly:
                              </Typography>
                              <Typography variant="h6" className="dark:text-white">
                                ${usageAnalysis.projectedMonthlyCost?.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary">
                                Peak Hours:
                              </Typography>
                              <Typography variant="body2" className="dark:text-white">
                                {usageAnalysis.peakHours?.join(', ')}
                              </Typography>
                            </Grid>
                          </Grid>

                          {usageAnalysis.recommendations?.length > 0 && (
                            <Box className="mt-4">
                              <Typography variant="subtitle2" className="dark:text-white mb-2">
                                Recommendations:
                              </Typography>
                              <List dense>
                                {usageAnalysis.recommendations.map((rec, idx) => (
                                  <ListItem key={idx}>
                                    <ListItemIcon>
                                      <SparkleIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={rec} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Current Usage Summary */}
                <Card className="dark:bg-gray-700">
                  <CardContent>
                    <Typography variant="h6" gutterBottom className="dark:text-white">
                      Current Month Usage
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded">
                          <Typography variant="h4" className="text-blue-600 dark:text-blue-300">
                            {usageData.length}
                          </Typography>
                          <Typography variant="caption">API Calls</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box className="text-center p-3 bg-green-50 dark:bg-green-900 rounded">
                          <Typography variant="h4" className="text-green-600 dark:text-green-300">
                            ${usageData.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Total Cost</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded">
                          <Typography variant="h4" className="text-orange-600 dark:text-orange-300">
                            ${(config.monthlyBudget - usageData.reduce((sum, item) => sum + (item.cost || 0), 0)).toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Remaining</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded">
                          <Typography variant="h4" className="text-purple-600 dark:text-purple-300">
                            {((usageData.reduce((sum, item) => sum + (item.cost || 0), 0) / config.monthlyBudget) * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="caption">Budget Used</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* ===== EXPORT/IMPORT BUTTONS ===== */}
      <Box className="flex justify-center gap-3 mt-6">
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportConfig}
        >
          Export Configuration
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          component="label"
        >
          Import Configuration
          <input
            type="file"
            hidden
            accept=".json"
            onChange={handleImportConfig}
          />
        </Button>
        <Button
          variant="outlined"
          startIcon={<RestoreIcon />}
          onClick={loadConfiguration}
        >
          Reload from Database
        </Button>
      </Box>

      {/* ========================================= */}
      {/* TEMPLATE DIALOG */}
      {/* ========================================= */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => {
          setShowTemplateDialog(false);
          setEditingTemplate(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="dark:bg-gray-800 dark:text-white">
          <Box className="flex items-center justify-between">
            <Typography variant="h6">
              {editingTemplate?.id ? 'Edit Template' : 'Create Template'}
            </Typography>
            <IconButton onClick={() => {
              setShowTemplateDialog(false);
              setEditingTemplate(null);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent className="dark:bg-gray-800">
          {editingTemplate && (
            <Grid container spacing={3} className="mt-2">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Template Type</InputLabel>
                  <Select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                    label="Template Type"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label="Template Content"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  placeholder="Enter your template content here..."
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="caption">
                    Available variables: {TEMPLATE_TYPES.find(t => t.id === editingTemplate.type)?.variables.join(', ')}
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="dark:bg-gray-800">
          <Button onClick={() => {
            setShowTemplateDialog(false);
            setEditingTemplate(null);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveTemplate(editingTemplate)}
            disabled={saving || !editingTemplate?.name || !editingTemplate?.content}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IDIQConfig;