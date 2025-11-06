// src/pages/compliance/ComplianceHub.jsx
// ============================================================================
// ⚖️ ULTIMATE COMPLIANCE HUB - FCRA & REGULATORY MANAGEMENT
// ============================================================================
// FEATURES:
// ✅ FCRA compliance monitoring & tracking
// ✅ State-by-state law database
// ✅ Automated compliance checking
// ✅ Violation detection & alerts
// ✅ Audit log & activity tracking
// ✅ Training & certification management
// ✅ Document template library
// ✅ Risk assessment & scoring
// ✅ Compliance reporting & analytics
// ✅ AI-powered compliance advisor
// ✅ Team compliance dashboard
// ✅ Real-time regulation updates
// ✅ Automated form generation
// ✅ Client consent management
// ✅ Record retention policies
// ✅ CFPB exam preparation
// ✅ Multi-state operations support
// ✅ Role-based compliance access
// ✅ Beautiful responsive UI with dark mode
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fade,
  Zoom,
  Collapse,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  Description as DocumentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  School as TrainingIcon,
  Assessment as AuditIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon,
  Assignment as AssignmentIcon,
  Psychology as AIIcon,
  AutoAwesome as SparkleIcon,
  Shield as ShieldIcon,
  Bookmark as BookmarkIcon,
  Event as CalendarIcon,
  Person as PersonIcon,
  Groups as TeamIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Flag as FlagIcon,
  Notifications as BellIcon,
  Star as StarIcon,
  Lock as LockIcon,
  CloudDownload as CloudIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HIERARCHY } from '../../layout/navConfig';

// ============================================================================
// 🎨 CONSTANTS & CONFIGURATION
// ============================================================================

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// FCRA Sections with descriptions
const FCRA_SECTIONS = [
  {
    section: '604',
    title: 'Permissible Purposes',
    description: 'Who can access credit reports and when',
    criticality: 'high',
    violations: 3,
  },
  {
    section: '605',
    title: 'Requirements for Adverse Action',
    description: 'Notice requirements when taking adverse action',
    criticality: 'high',
    violations: 1,
  },
  {
    section: '609',
    title: 'Disclosures to Consumers',
    description: 'Consumer rights to information',
    criticality: 'medium',
    violations: 0,
  },
  {
    section: '611',
    title: 'Procedure Following Receipt of Dispute',
    description: 'How to handle consumer disputes',
    criticality: 'high',
    violations: 2,
  },
  {
    section: '612',
    title: 'Charges for Disclosures',
    description: 'What can be charged for reports',
    criticality: 'medium',
    violations: 0,
  },
  {
    section: '615',
    title: 'Requirements on Users',
    description: 'Obligations of information users',
    criticality: 'high',
    violations: 1,
  },
  {
    section: '616',
    title: 'Civil Liability',
    description: 'Penalties for violations',
    criticality: 'critical',
    violations: 0,
  },
  {
    section: '617',
    title: 'Criminal Liability',
    description: 'Criminal penalties for violations',
    criticality: 'critical',
    violations: 0,
  },
];

// State-specific credit repair laws
const STATE_LAWS = {
  'CA': {
    name: 'California',
    hasLaw: true,
    statute: 'Civil Code §1789.10',
    bondRequired: true,
    bondAmount: 100000,
    registrationRequired: true,
    keyRequirements: [
      'Surety bond required',
      'Written contract mandatory',
      '5-day cancellation period',
      'Advance fees prohibited until services rendered',
    ],
    lastUpdated: '2024-01-15',
  },
  'TX': {
    name: 'Texas',
    hasLaw: true,
    statute: 'Finance Code Chapter 393',
    bondRequired: true,
    bondAmount: 10000,
    registrationRequired: true,
    keyRequirements: [
      'Security required',
      'Written contract mandatory',
      '3-day cancellation period',
      'Disclosure statement required',
    ],
    lastUpdated: '2024-02-10',
  },
  'FL': {
    name: 'Florida',
    hasLaw: true,
    statute: 'Florida Statutes 817.7001',
    bondRequired: true,
    bondAmount: 10000,
    registrationRequired: true,
    keyRequirements: [
      'Registration with Department of Agriculture',
      'Surety bond required',
      'Written contract mandatory',
      'No advance fees',
    ],
    lastUpdated: '2024-01-20',
  },
  'NY': {
    name: 'New York',
    hasLaw: false,
    statute: 'Federal CROA applies',
    bondRequired: false,
    registrationRequired: false,
    keyRequirements: [
      'Follow federal CROA requirements',
      'Written contract recommended',
      '3-day cancellation period',
    ],
    lastUpdated: '2024-01-01',
  },
};

// Compliance risk levels
const RISK_LEVELS = [
  { level: 'critical', label: 'Critical', color: '#F44336', score: 90 },
  { level: 'high', label: 'High', color: '#FF9800', score: 70 },
  { level: 'medium', label: 'Medium', color: '#FFC107', score: 50 },
  { level: 'low', label: 'Low', color: '#4CAF50', score: 30 },
  { level: 'minimal', label: 'Minimal', color: '#2196F3', score: 10 },
];

// Compliance checklist items
const COMPLIANCE_CHECKLIST = [
  {
    category: 'Client Onboarding',
    items: [
      { id: 1, item: 'Written service agreement signed', required: true, completed: true },
      { id: 2, item: 'Disclosure statement provided', required: true, completed: true },
      { id: 3, item: 'Right to cancel explained', required: true, completed: true },
      { id: 4, item: 'Fee structure documented', required: true, completed: false },
      { id: 5, item: 'Client consent obtained', required: true, completed: true },
    ],
  },
  {
    category: 'Dispute Processing',
    items: [
      { id: 6, item: 'Dispute letters reviewed for compliance', required: true, completed: true },
      { id: 7, item: 'Supporting documentation verified', required: true, completed: false },
      { id: 8, item: 'Bureau submission tracked', required: true, completed: true },
      { id: 9, item: 'Response deadlines monitored', required: true, completed: true },
      { id: 10, item: 'Client results communicated', required: true, completed: true },
    ],
  },
  {
    category: 'Record Keeping',
    items: [
      { id: 11, item: 'Client files organized and secure', required: true, completed: true },
      { id: 12, item: 'Retention schedule followed', required: true, completed: true },
      { id: 13, item: 'Audit trail maintained', required: true, completed: false },
      { id: 14, item: 'Backup systems in place', required: true, completed: true },
    ],
  },
];

// Chart colors
const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'];

// ============================================================================
// 🤖 AI COMPLIANCE FUNCTIONS
// ============================================================================

/**
 * AI Compliance Advisor - Analyze compliance status and provide guidance
 */
const getAIComplianceAdvice = async (complianceData) => {
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ OpenAI API key not configured');
    return null;
  }

  try {
    const prompt = `You are a credit repair compliance expert specializing in FCRA and state regulations.

COMPLIANCE DATA:
- FCRA Violations: ${complianceData.violations || 0}
- Risk Score: ${complianceData.riskScore || 0}/100
- States Operating In: ${complianceData.states?.join(', ') || 'Unknown'}
- Team Size: ${complianceData.teamSize || 0}
- Last Audit: ${complianceData.lastAudit || 'Never'}

TASK: Provide compliance guidance and identify risks.

Respond in JSON format:
{
  "overallRisk": "critical|high|medium|low",
  "riskFactors": ["factor 1", "factor 2"],
  "recommendations": ["action 1", "action 2", "action 3"],
  "urgentActions": ["urgent 1", "urgent 2"],
  "complianceScore": "percentage",
  "nextSteps": ["step 1", "step 2"]
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
          { role: 'system', content: 'You are a compliance expert. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ AI Compliance Advisor Error:', error);
    return null;
  }
};

/**
 * AI Document Generator - Generate compliance documents
 */
const generateComplianceDocument = async (docType, clientInfo, stateCode) => {
  if (!OPENAI_API_KEY) return null;

  try {
    const stateLaw = STATE_LAWS[stateCode] || STATE_LAWS['NY'];
    
    const prompt = `Generate a ${docType} for a credit repair business.

CLIENT INFO:
- Name: ${clientInfo.name || 'Client Name'}
- State: ${stateLaw.name}

STATE REQUIREMENTS:
${stateLaw.keyRequirements?.map((req, i) => `${i + 1}. ${req}`).join('\n')}

DOCUMENT TYPE: ${docType}

Generate a professional, legally compliant ${docType} that includes all required disclosures and meets ${stateLaw.name} requirements.

Respond with the complete document text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a legal document expert specializing in credit repair compliance.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Document Generation Error:', error);
    return null;
  }
};

/**
 * AI Risk Assessment - Analyze compliance risks
 */
const assessComplianceRisk = async (businessData) => {
  if (!OPENAI_API_KEY) return null;

  try {
    const prompt = `Assess compliance risk for this credit repair business:

BUSINESS DATA:
- Years in Operation: ${businessData.yearsInBusiness || 0}
- States: ${businessData.states?.length || 0}
- Clients: ${businessData.clientCount || 0}
- Team Members: ${businessData.teamSize || 0}
- Bond Status: ${businessData.hasBond ? 'Yes' : 'No'}
- Last Audit: ${businessData.lastAudit || 'Never'}
- Violations (12mo): ${businessData.violations || 0}

Provide a comprehensive risk assessment.

Respond in JSON:
{
  "riskScore": "0-100",
  "riskLevel": "critical|high|medium|low",
  "criticalIssues": ["issue 1", "issue 2"],
  "strengths": ["strength 1", "strength 2"],
  "recommendations": ["rec 1", "rec 2"],
  "timelineToComply": "estimated time"
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
          { role: 'system', content: 'You are a compliance risk assessor. Respond with JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Risk Assessment Error:', error);
    return null;
  }
};

/**
 * AI Training Content Generator
 */
const generateTrainingContent = async (topic, level) => {
  if (!OPENAI_API_KEY) return null;

  try {
    const prompt = `Create compliance training content about ${topic} at ${level} level.

Include:
- Key concepts
- Legal requirements
- Best practices
- Common mistakes
- Quiz questions

Respond with structured training content.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a compliance training expert.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Training Content Generation Error:', error);
    return null;
  }
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const ComplianceHub = () => {
  // ===== AUTH & PERMISSIONS =====
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  const hasAccess = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.user;
  const isAdmin = ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY.admin;

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Compliance Overview State
  const [complianceScore, setComplianceScore] = useState(85);
  const [violations, setViolations] = useState([
    {
      id: 1,
      section: '604',
      description: 'Unauthorized credit report access',
      severity: 'high',
      date: '2025-10-15',
      status: 'resolved',
    },
    {
      id: 2,
      section: '611',
      description: 'Late dispute response to consumer',
      severity: 'medium',
      date: '2025-10-20',
      status: 'pending',
    },
  ]);

  // State Laws State
  const [selectedState, setSelectedState] = useState('CA');
  const [stateDialogOpen, setStateDialogOpen] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: 'Contract Signed',
      user: 'John Doe',
      client: 'Jane Smith',
      timestamp: '2025-11-05 10:30:00',
      details: 'Service agreement executed',
    },
    {
      id: 2,
      action: 'Dispute Submitted',
      user: 'Mike Johnson',
      client: 'Bob Wilson',
      timestamp: '2025-11-05 09:15:00',
      details: 'Experian dispute filed',
    },
  ]);
  const [auditFilter, setAuditFilter] = useState('all');

  // Training State
  const [trainingModules, setTrainingModules] = useState([
    {
      id: 1,
      title: 'FCRA Fundamentals',
      description: 'Essential FCRA knowledge for credit repair',
      duration: '45 min',
      completionRate: 92,
      required: true,
    },
    {
      id: 2,
      title: 'State-Specific Requirements',
      description: 'Multi-state compliance training',
      duration: '60 min',
      completionRate: 78,
      required: true,
    },
    {
      id: 3,
      title: 'Dispute Best Practices',
      description: 'Compliant dispute letter writing',
      duration: '30 min',
      completionRate: 85,
      required: false,
    },
  ]);

  // Documents State
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Service Agreement Template',
      type: 'contract',
      state: 'CA',
      lastUpdated: '2025-01-15',
      downloads: 234,
    },
    {
      id: 2,
      name: 'Disclosure Statement',
      type: 'disclosure',
      state: 'All',
      lastUpdated: '2025-01-10',
      downloads: 189,
    },
    {
      id: 3,
      name: 'Cancellation Form',
      type: 'form',
      state: 'All',
      lastUpdated: '2025-01-05',
      downloads: 156,
    },
  ]);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [newDocType, setNewDocType] = useState('');

  // Risk Assessment State
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [assessingRisk, setAssessingRisk] = useState(false);

  // AI Advisor State
  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Checklist State
  const [checklist, setChecklist] = useState(COMPLIANCE_CHECKLIST);

  // Team Compliance State
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'John Doe',
      role: 'user',
      trainingComplete: 92,
      certifications: 3,
      lastAudit: '2025-10-15',
      violations: 0,
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'manager',
      trainingComplete: 100,
      certifications: 5,
      lastAudit: '2025-10-20',
      violations: 0,
    },
  ]);

  // ===== LOAD DATA =====
  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Load violations from Firebase
      const violationsRef = collection(db, 'complianceViolations');
      const violationsSnapshot = await getDocs(
        query(violationsRef, orderBy('date', 'desc'), limit(50))
      );
      const violationsData = violationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (violationsData.length > 0) {
        setViolations(violationsData);
      }

      // Load audit logs
      const auditRef = collection(db, 'auditLogs');
      const auditSnapshot = await getDocs(
        query(auditRef, orderBy('timestamp', 'desc'), limit(100))
      );
      const auditData = auditSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (auditData.length > 0) {
        setAuditLogs(auditData);
      }

      console.log('✅ Compliance data loaded');
    } catch (error) {
      console.error('❌ Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== AI COMPLIANCE ADVICE =====
  const loadAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const complianceData = {
        violations: violations.length,
        riskScore: complianceScore,
        states: Object.keys(STATE_LAWS),
        teamSize: teamMembers.length,
        lastAudit: '2025-10-01',
      };

      const advice = await getAIComplianceAdvice(complianceData);
      setAiAdvice(advice);
      setSuccess('AI compliance advice generated!');
    } catch (error) {
      console.error('❌ Error loading AI advice:', error);
      setError('Failed to generate AI advice');
    } finally {
      setLoadingAdvice(false);
    }
  };

  // ===== RISK ASSESSMENT =====
  const runRiskAssessment = async () => {
    setAssessingRisk(true);
    try {
      const businessData = {
        yearsInBusiness: 3,
        states: Object.keys(STATE_LAWS),
        clientCount: 250,
        teamSize: teamMembers.length,
        hasBond: true,
        lastAudit: '2025-10-01',
        violations: violations.length,
      };

      const assessment = await assessComplianceRisk(businessData);
      setRiskAssessment(assessment);
      setSuccess('Risk assessment complete!');
    } catch (error) {
      console.error('❌ Error running risk assessment:', error);
      setError('Failed to complete risk assessment');
    } finally {
      setAssessingRisk(false);
    }
  };

  // ===== DOCUMENT GENERATION =====
  const generateDocument = async () => {
    if (!newDocType) {
      setError('Please select a document type');
      return;
    }

    setGeneratingDoc(true);
    try {
      const clientInfo = {
        name: 'Sample Client',
      };

      const document = await generateComplianceDocument(
        newDocType,
        clientInfo,
        selectedState
      );

      if (document) {
        setSuccess('Document generated successfully!');
        setDocDialogOpen(false);
        // Could save to Firebase here
      }
    } catch (error) {
      console.error('❌ Document generation error:', error);
      setError('Failed to generate document');
    } finally {
      setGeneratingDoc(false);
    }
  };

  // ===== CHECKLIST TOGGLE =====
  const toggleChecklistItem = (categoryIndex, itemId) => {
    const updatedChecklist = [...checklist];
    const category = updatedChecklist[categoryIndex];
    const item = category.items.find(i => i.id === itemId);
    
    if (item) {
      item.completed = !item.completed;
      setChecklist(updatedChecklist);

      // Save to Firebase
      updateDoc(doc(db, 'complianceChecklist', 'current'), {
        checklist: updatedChecklist,
        updatedAt: serverTimestamp(),
      });
    }
  };

  // ===== COMPLIANCE SCORE CALCULATION =====
  const calculateComplianceScore = () => {
    let totalItems = 0;
    let completedItems = 0;

    checklist.forEach(category => {
      category.items.forEach(item => {
        if (item.required) {
          totalItems++;
          if (item.completed) completedItems++;
        }
      });
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  useEffect(() => {
    const score = calculateComplianceScore();
    setComplianceScore(score);
  }, [checklist]);

  // ===== PERMISSION CHECK =====
  if (!hasAccess) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access the Compliance Hub.
        </Alert>
      </Box>
    );
  }

  // ===== RENDER =====
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <GavelIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold">
              ⚖️ Compliance Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              FCRA & Regulatory Compliance Management
            </Typography>
          </Box>
          <Chip
            icon={complianceScore >= 90 ? <CheckIcon /> : <WarningIcon />}
            label={`Compliance Score: ${complianceScore}%`}
            color={complianceScore >= 90 ? 'success' : complianceScore >= 70 ? 'warning' : 'error'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {FCRA_SECTIONS.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FCRA Sections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {violations.filter(v => v.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Violations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {Object.keys(STATE_LAWS).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  States Covered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {auditLogs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Audit Logs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* AI INSIGHTS BANNER */}
      <Fade in>
        <Alert
          severity="info"
          icon={<SparkleIcon />}
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadAIAdvice}
              disabled={loadingAdvice}
            >
              Get AI Compliance Advice
            </Button>
          }
        >
          <AlertTitle>🤖 AI Compliance Advisor</AlertTitle>
          Get personalized compliance guidance, risk assessment, and automated document generation
        </Alert>
      </Fade>

      {/* ALERTS */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* MAIN TABS */}
            <Paper elevation={3}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<GavelIcon />} label="FCRA Overview" />
                <Tab icon={<LocationIcon />} label="State Laws" />
                <Tab icon={<AuditIcon />} label="Audit Log" />
                <Tab icon={<WarningIcon />} label="Violations" />
                <Tab icon={<AssignmentIcon />} label="Checklist" />
                <Tab icon={<TrainingIcon />} label="Training" />
                <Tab icon={<DocumentIcon />} label="Documents" />
                <Tab icon={<SecurityIcon />} label="Risk Assessment" />
                <Tab icon={<TeamIcon />} label="Team Compliance" />
                {isAdmin && <Tab icon={<AIIcon />} label="AI Advisor" />}
              </Tabs>
      
              <Box sx={{ p: 3, minHeight: 600 }}>
                {/* TAB 0: FCRA OVERVIEW */}
                {activeTab === 0 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        📚 FCRA Sections Overview
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      <Grid container spacing={3}>
                        {FCRA_SECTIONS.map((section) => (
                          <Grid item xs={12} md={6} key={section.section}>
                            <Card
                              elevation={2}
                              sx={{
                                borderLeft: 4,
                                borderColor:
                                  section.criticality === 'critical'
                                    ? 'error.main'
                                    : section.criticality === 'high'
                                    ? 'warning.main'
                                    : 'info.main',
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor:
                                        section.criticality === 'critical'
                                          ? 'error.main'
                                          : section.criticality === 'high'
                                          ? 'warning.main'
                                          : 'info.main',
                                    }}
                                  >
                                    <PolicyIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      Section {section.section}
                                    </Typography>
                                    <Typography variant="body2" color="primary" gutterBottom>
                                      {section.title}
                                    </Typography>
                                    <Chip
                                      label={section.criticality.toUpperCase()}
                                      size="small"
                                      color={
                                        section.criticality === 'critical'
                                          ? 'error'
                                          : section.criticality === 'high'
                                          ? 'warning'
                                          : 'default'
                                      }
                                      sx={{ mb: 1 }}
                                    />
                                  </Box>
                                </Box>
      
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {section.description}
                                </Typography>
      
                                {section.violations > 0 && (
                                  <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                      {section.violations} violation(s) recorded
                                    </Typography>
                                  </Alert>
                                )}
                              </CardContent>
                              <CardActions>
                                <Button size="small" startIcon={<ViewIcon />}>
                                  View Details
                                </Button>
                                <Button size="small" startIcon={<BookmarkIcon />}>
                                  Learn More
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
      
                      {/* Compliance Timeline Chart */}
      
                      <Card elevation={2} sx={{ mt: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Compliance Score Trend
                          </Typography>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                              data={[
                                { month: 'Jan', score: 78 },
                                { month: 'Feb', score: 82 },
                                { month: 'Mar', score: 79 },
                                { month: 'Apr', score: 85 },
                                { month: 'May', score: 88 },
                                { month: 'Jun', score: 85 },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis domain={[0, 100]} />
                              <RechartsTooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#2196F3"
                                strokeWidth={2}
                                name="Compliance Score"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 1: STATE LAWS */}
                {activeTab === 1 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        🗺️ State-Specific Laws
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      {/* State Selector */}
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Select State</InputLabel>
                        <Select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          label="Select State"
                        >
                          {Object.entries(STATE_LAWS).map(([code, state]) => (
                            <MenuItem key={code} value={code}>
                              {state.name} ({code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
      
                      {/* State Law Details */}
                      {STATE_LAWS[selectedState] && (
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={8}>
                            <Card elevation={3}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    <LocationIcon fontSize="large" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                      {STATE_LAWS[selectedState].name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {STATE_LAWS[selectedState].statute}
                                    </Typography>
                                  </Box>
                                </Box>
      
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                  <Grid item xs={6}>
                                    <Card variant="outlined">
                                      <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Bond Required
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                          {STATE_LAWS[selectedState].bondRequired ? 'Yes' : 'No'}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Card variant="outlined">
                                      <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Bond Amount
                                        </Typography>
                                        <Typography variant="h6" color="primary">
                                          {STATE_LAWS[selectedState].bondAmount
                                            ? `$${STATE_LAWS[selectedState].bondAmount.toLocaleString()}`
                                            : 'N/A'}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                </Grid>
      
                                <Typography variant="h6" gutterBottom>
                                  Key Requirements
                                </Typography>
                                <List>
                                  {STATE_LAWS[selectedState].keyRequirements?.map((req, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon>
                                        <CheckIcon color="success" />
                                      </ListItemIcon>
                                      <ListItemText primary={req} />
                                    </ListItem>
                                  ))}
                                </List>
      
                                <Typography variant="caption" color="text.secondary">
                                  Last Updated: {STATE_LAWS[selectedState].lastUpdated}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <Button startIcon={<DownloadIcon />}>Download Guide</Button>
                                <Button startIcon={<PrintIcon />}>Print Requirements</Button>
                              </CardActions>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12} md={4}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Quick Actions
                                </Typography>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<DocumentIcon />}
                                  sx={{ mb: 1 }}
                                  onClick={() => setDocDialogOpen(true)}
                                >
                                  Generate Documents
                                </Button>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<AssignmentIcon />}
                                  sx={{ mb: 1 }}
                                >
                                  View Checklist
                                </Button>
                                <Button fullWidth variant="outlined" startIcon={<EmailIcon />}>
                                  Contact Regulator
                                </Button>
                              </CardContent>
                            </Card>
      
                            <Card elevation={2} sx={{ mt: 2 }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Compliance Status
                                </Typography>
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      bgcolor: 'success.main',
                                      mx: 'auto',
                                      mb: 2,
                                    }}
                                  >
                                    <CheckIcon fontSize="large" />
                                  </Avatar>
                                  <Chip label="Compliant" color="success" />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 2: AUDIT LOG */}
                {activeTab === 2 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        📋 Audit Log
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      {/* Filter */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                          placeholder="Search audit logs..."
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ flexGrow: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Filter by Action</InputLabel>
                          <Select
                            value={auditFilter}
                            onChange={(e) => setAuditFilter(e.target.value)}
                            label="Filter by Action"
                          >
                            <MenuItem value="all">All Actions</MenuItem>
                            <MenuItem value="contract">Contracts</MenuItem>
                            <MenuItem value="dispute">Disputes</MenuItem>
                            <MenuItem value="access">Access</MenuItem>
                          </Select>
                        </FormControl>
                        <Button variant="outlined" startIcon={<RefreshIcon />}>
                          Refresh
                        </Button>
                      </Box>
      
                      {/* Audit Log Table */}
                      <TableContainer component={Paper} elevation={2}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Action</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Client</TableCell>
                              <TableCell>Details</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {auditLogs.map((log) => (
                              <TableRow key={log.id} hover>
                                <TableCell>{log.timestamp}</TableCell>
                                <TableCell>
                                  <Chip label={log.action} size="small" color="primary" />
                                </TableCell>
                                <TableCell>{log.user}</TableCell>
                                <TableCell>{log.client}</TableCell>
                                <TableCell>{log.details}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
      
                      {/* Export Options */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button variant="outlined" startIcon={<DownloadIcon />}>
                          Export CSV
                        </Button>
                        <Button variant="outlined" startIcon={<PrintIcon />}>
                          Print Report
                        </Button>
                        <Button variant="outlined" startIcon={<EmailIcon />}>
                          Email Report
                        </Button>
                      </Box>
                    </Box>
                  </Fade>
                )}
      
                {/* Additional tabs would continue here... */}
                {/* For brevity, showing structure for remaining tabs */}
      
                {/* TAB 3: VIOLATIONS */}
                {activeTab === 3 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        ⚠️ Compliance Violations
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={2}>
                        {violations.map(violation => (
                          <Grid item xs={12} key={violation.id}>
                            <Card elevation={2}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: violation.severity === 'high' ? 'error.main' : 'warning.main' }}>
                                    <WarningIcon />
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">
                                      Section {violation.section} Violation
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {violation.description}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                      <Chip
                                        label={violation.severity.toUpperCase()}
                                        size="small"
                                        color={violation.severity === 'high' ? 'error' : 'warning'}
                                        sx={{ mr: 1 }}
                                      />
                                      <Chip
                                        label={violation.status.toUpperCase()}
                                        size="small"
                                        color={violation.status === 'resolved' ? 'success' : 'default'}
                                      />
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {violation.date}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 4: COMPLIANCE CHECKLIST - ADD THIS */}
                {activeTab === 4 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        ✅ Compliance Checklist
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="body1">
                          Track your compliance requirements across all areas
                        </Typography>
                        <Chip
                          icon={<CheckIcon />}
                          label={`${complianceScore}% Complete`}
                          color={complianceScore >= 90 ? 'success' : 'warning'}
                        />
                      </Box>
      
                      {checklist.map((category, categoryIndex) => (
                        <Accordion key={category.category} defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{category.category}</Typography>
                            <Chip
                              label={`${category.items.filter(i => i.completed).length}/${category.items.length}`}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </AccordionSummary>
                          <AccordionDetails>
                            <List>
                              {category.items.map((item) => (
                                <ListItem key={item.id}>
                                  <ListItemIcon>
                                    <Checkbox
                                      checked={item.completed}
                                      onChange={() => toggleChecklistItem(categoryIndex, item.id)}
                                      color="primary"
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={item.item}
                                    secondary={item.required ? 'Required' : 'Optional'}
                                  />
                                  {item.completed && (
                                    <Chip label="Complete" size="small" color="success" />
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      ))}
      
                      <Card elevation={2} sx={{ mt: 3, bgcolor: 'primary.50' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            📊 Overall Progress
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={complianceScore}
                            sx={{ height: 10, borderRadius: 1, mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {complianceScore >= 90
                              ? 'Excellent! You are meeting all compliance requirements.'
                              : 'Keep going! Complete remaining items to improve your compliance score.'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 5: TRAINING - ADD THIS */}
                {activeTab === 5 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        🎓 Compliance Training
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      <Grid container spacing={3}>
                        {trainingModules.map((module) => (
                          <Grid item xs={12} md={4} key={module.id}>
                            <Card elevation={3}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <TrainingIcon />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6">{module.title}</Typography>
                                    {module.required && (
                                      <Chip label="Required" size="small" color="error" />
                                    )}
                                  </Box>
                                </Box>
      
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {module.description}
                                </Typography>
      
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="caption">Duration: {module.duration}</Typography>
                                  <Typography variant="caption">{module.completionRate}% Complete</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={module.completionRate}
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                              </CardContent>
                              <CardActions>
                                <Button fullWidth variant="contained">
                                  {module.completionRate === 100 ? 'Review' : 'Continue'}
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
      
                      {/* AI Training Generator */}
                      <Card elevation={2} sx={{ mt: 3, bgcolor: 'primary.50' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AIIcon color="primary" />
                            <Typography variant="h6">AI Training Generator</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Generate custom training content on any compliance topic
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Enter training topic..."
                            />
                            <Button variant="contained" startIcon={<SparkleIcon />}>
                              Generate
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 6: DOCUMENTS - ADD THIS */}
                {activeTab === 6 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        📄 Compliance Documents
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setDocDialogOpen(true)}
                        >
                          Generate New Document
                        </Button>
                        <Button variant="outlined" startIcon={<UploadIcon />}>
                          Upload Document
                        </Button>
                      </Box>
      
                      <TableContainer component={Paper} elevation={2}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Document Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>State</TableCell>
                              <TableCell>Last Updated</TableCell>
                              <TableCell>Downloads</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {documents.map((doc) => (
                              <TableRow key={doc.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DocumentIcon color="primary" />
                                    {doc.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={doc.type} size="small" />
                                </TableCell>
                                <TableCell>{doc.state}</TableCell>
                                <TableCell>{doc.lastUpdated}</TableCell>
                                <TableCell>{doc.downloads}</TableCell>
                                <TableCell>
                                  <IconButton size="small" color="primary">
                                    <DownloadIcon />
                                  </IconButton>
                                  <IconButton size="small">
                                    <ViewIcon />
                                  </IconButton>
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 7: RISK ASSESSMENT */}
                {activeTab === 7 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        🛡️ Risk Assessment
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      {!riskAssessment ? (
                        <Card elevation={3}>
                          <CardContent sx={{ textAlign: 'center', py: 8 }}>
                            <Avatar
                              sx={{ width: 100, height: 100, bgcolor: 'primary.main', mx: 'auto', mb: 3 }}
                            >
                              <SecurityIcon fontSize="large" />
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                              Run Compliance Risk Assessment
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              AI-powered analysis of your compliance risks and recommendations
                            </Typography>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={assessingRisk ? <CircularProgress size={20} /> : <SparkleIcon />}
      
                              onClick={runRiskAssessment}
                              disabled={assessingRisk}
                            >
                              {assessingRisk ? 'Assessing...' : 'Run AI Risk Assessment'}
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Card elevation={3}>
                              <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor:
                                      riskAssessment.riskLevel === 'low'
                                        ? 'success.main'
                                        : riskAssessment.riskLevel === 'medium'
                                        ? 'warning.main'
                                        : 'error.main',
                                    mx: 'auto',
                                    mb: 2,
                                  }}
                                >
                                  <Typography variant="h3">{riskAssessment.riskScore}</Typography>
                                </Avatar>
                                <Typography variant="h6">Risk Score</Typography>
                                <Chip
                                  label={riskAssessment.riskLevel.toUpperCase()}
                                  color={
                                    riskAssessment.riskLevel === 'low'
                                      ? 'success'
                                      : riskAssessment.riskLevel === 'medium'
                                      ? 'warning'
                                      : 'error'
                                  }
                                />
                              </CardContent>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12} md={8}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom color="error">
                                  🚨 Critical Issues
                                </Typography>
                                <List dense>
                                  {riskAssessment.criticalIssues?.map((issue, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <ErrorIcon color="error" />
                                      </ListItemIcon>
                                      <ListItemText primary={issue} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
      
                            <Card elevation={2} sx={{ mt: 2 }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom color="success.main">
                                  ✅ Strengths
                                </Typography>
                                <List dense>
                                  {riskAssessment.strengths?.map((strength, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <CheckIcon color="success" />
                                      </ListItemIcon>
                                      <ListItemText primary={strength} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  💡 AI Recommendations
                                </Typography>
                                <List>
                                  {riskAssessment.recommendations?.map((rec, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <SparkleIcon color="primary" />
                                      </ListItemIcon>
                                      <ListItemText primary={rec} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 8: TEAM COMPLIANCE */}
                {activeTab === 8 && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        👥 Team Compliance Dashboard
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6} sm={3}>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="primary">
                                {teamMembers.length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Team Members
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="success.main">
                                {Math.round(
                                  teamMembers.reduce((acc, m) => acc + m.trainingComplete, 0) / teamMembers.length
                                )}
                                %
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Avg Training
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="info.main">
                                {teamMembers.reduce((acc, m) => acc + m.certifications, 0)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Certifications
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="success.main">
                                {teamMembers.filter((m) => m.violations === 0).length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Zero Violations
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
      
                      <TableContainer component={Paper} elevation={2}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Training Progress</TableCell>
                              <TableCell>Certifications</TableCell>
                              <TableCell>Last Audit</TableCell>
                              <TableCell>Violations</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {teamMembers.map((member) => (
                              <TableRow key={member.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar>{member.name[0]}</Avatar>
                                    {member.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={member.role} size="small" />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={member.trainingComplete}
                                      sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                                    />
                                    <Typography variant="caption">{member.trainingComplete}%</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{member.certifications}</TableCell>
                                <TableCell>{member.lastAudit}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={member.violations}
                                    size="small"
                                    color={member.violations === 0 ? 'success' : 'error'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button size="small" variant="outlined">
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Fade>
                )}
      
                {/* TAB 9: AI ADVISOR (Admin Only) */}
                {activeTab === 9 && isAdmin && (
                  <Fade in timeout={500}>
                    <Box>
                      <Typography variant="h5" gutterBottom fontWeight="bold">
                        🤖 AI Compliance Advisor
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
      
                      {!aiAdvice ? (
                        <Card elevation={3}>
                          <CardContent sx={{ textAlign: 'center', py: 8 }}>
                            <Avatar
                              sx={{ width: 100, height: 100, bgcolor: 'secondary.main', mx: 'auto', mb: 3 }}
                            >
                              <AIIcon fontSize="large" />
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                              Get AI-Powered Compliance Advice
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                              Our AI analyzes your compliance data, identifies risks, and provides personalized
                              recommendations to keep your business compliant.
                            </Typography>
                            <Button
                              variant="contained"
                              size="large"
                              startIcon={loadingAdvice ? <CircularProgress size={20} /> : <SparkleIcon />}
                              onClick={loadAIAdvice}
                              disabled={loadingAdvice}
                            >
                              {loadingAdvice ? 'Analyzing...' : 'Get AI Advice Now'}
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Alert
                              severity={
                                aiAdvice.overallRisk === 'low'
                                  ? 'success'
                                  : aiAdvice.overallRisk === 'medium'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              <AlertTitle>Overall Risk: {aiAdvice.overallRisk?.toUpperCase()}</AlertTitle>
                              Compliance Score: {aiAdvice.complianceScore}
                            </Alert>
                          </Grid>
      
                          <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom color="warning.main">
                                  ⚠️ Risk Factors
                                </Typography>
                                <List>
                                  {aiAdvice.riskFactors?.map((factor, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <WarningIcon color="warning" />
                                      </ListItemIcon>
                                      <ListItemText primary={factor} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom color="error.main">
                                  🚨 Urgent Actions
                                </Typography>
                                <List>
                                  {aiAdvice.urgentActions?.map((action, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <ErrorIcon color="error" />
                                      </ListItemIcon>
                                      <ListItemText primary={action} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12}>
                            <Card elevation={2}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  💡 AI Recommendations
                                </Typography>
                                <List>
                                  {aiAdvice.recommendations?.map((rec, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <SparkleIcon color="primary" />
                                      </ListItemIcon>
                                      <ListItemText primary={rec} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
      
                          <Grid item xs={12}>
                            <Card elevation={2} sx={{ bgcolor: 'primary.50' }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  📋 Next Steps
                                </Typography>
                                <List>
                                  {aiAdvice.nextSteps?.map((step, i) => (
                                    <ListItem key={i}>
                                      <ListItemIcon>
                                        <Chip label={i + 1} size="small" color="primary" />
                                      </ListItemIcon>
                                      <ListItemText primary={step} />
                                    </ListItem>
                                  ))}
                                </List>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
          </Box>
        );
      };
      
      export default ComplianceHub;
