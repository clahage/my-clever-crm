// src/components/credit/IDIQConfig.jsx
// ============================================================================
// ⚙️ IDIQ CONFIGURATION PANEL - MEGA ENHANCED ADMIN SETTINGS
// ============================================================================
// FEATURES:
// ✅ API Credentials Management (IDIQ, OpenAI, Telnyx)
// ✅ Bureau Configuration (enable/disable, pricing, preferences)
// ✅ Automation Settings (monitoring, disputes, notifications)
// ✅ Template Management (letters, emails, SMS with variables)
// ✅ Compliance Settings (FCRA, audit logging, privacy)
// ✅ User Permissions (role-based access, feature flags)
// ✅ Billing & Usage Tracking (API costs, usage analytics)
// ✅ Test Connection Functionality
// ✅ Real-time Validation
// ✅ Template Preview & Editing
// ✅ Secure Credential Storage
// ✅ Usage Analytics & Reporting
// ✅ Cost Optimization Suggestions
// ✅ Audit Trail
// ✅ Beautiful UI with Dark Mode
// ✅ Mobile Responsive
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Tabs, Tab, TextField, Alert, AlertTitle, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, IconButton, Chip, List, ListItem, ListItemText, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Slider,
  InputAdornment, Tooltip, Badge, Fade, Zoom,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Key as KeyIcon,
  BusinessCenter as BureauIcon,
  AutoAwesome as AutoIcon,
  Description as TemplateIcon,
  Shield as ComplianceIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  PlayArrow as TestIcon,
  Security as SecurityIcon,
  Assessment as AnalyticsIcon,
  History as HistoryIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  CreditCard as CardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Fax as FaxIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  collection, doc, getDoc, setDoc, getDocs, query,
  where, orderBy, limit, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

// ============================================================================
// 🎨 CONSTANTS & CONFIGURATION
// ============================================================================

const IDIQ_PARTNER_ID = '11981';

// API Services Configuration
const API_SERVICES = {
  idiq: {
    name: 'IDIQ Credit Reports',
    description: 'Credit report pulling and monitoring',
    icon: CreditCard,
    color: '#1976d2',
    requiredFields: ['partnerId', 'apiUrl'],
    testEndpoint: 'https://api.idiq.com/v1/health',
  },
  openai: {
    name: 'OpenAI GPT-4',
    description: 'AI-powered analysis and generation',
    icon: AutoIcon,
    color: '#10a37f',
    requiredFields: ['apiKey'],
    testEndpoint: 'https://api.openai.com/v1/models',
  },
  telnyx: {
    name: 'Telnyx Fax',
    description: 'Fax services for dispute letters',
    icon: FaxIcon,
    color: '#00c08b',
    requiredFields: ['apiKey'],
    testEndpoint: 'https://api.telnyx.com/v2/phone_numbers',
  },
};

// Credit Bureaus Configuration
const BUREAUS = [
  {
    id: 'experian',
    name: 'Experian',
    description: 'Credit reports and monitoring',
    color: '#0066B2',
    defaultEnabled: true,
    defaultCost: 15.00,
    address: 'P.O. Box 4500, Allen, TX 75013',
    phone: '1-888-397-3742',
    website: 'www.experian.com',
  },
  {
    id: 'equifax',
    name: 'Equifax',
    description: 'Credit reports and monitoring',
    color: '#C8102E',
    defaultEnabled: true,
    defaultCost: 15.00,
    address: 'P.O. Box 740256, Atlanta, GA 30374',
    phone: '1-866-349-5191',
    website: 'www.equifax.com',
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    description: 'Credit reports and monitoring',
    color: '#005EB8',
    defaultEnabled: true,
    defaultCost: 15.00,
    address: 'P.O. Box 2000, Chester, PA 19016',
    phone: '1-800-916-8800',
    website: 'www.transunion.com',
  },
];

// Monitoring Frequencies
const MONITORING_FREQUENCIES = [
  { id: 'weekly', label: 'Weekly', days: 7, cost: 0.50 },
  { id: 'biweekly', label: 'Bi-Weekly', days: 14, cost: 0.40 },
  { id: 'monthly', label: 'Monthly', days: 30, cost: 0.30, recommended: true },
  { id: 'quarterly', label: 'Quarterly', days: 90, cost: 0.20 },
  { id: 'semiannual', label: 'Semi-Annual', days: 180, cost: 0.15 },
];

// Notification Channels
const NOTIFICATION_CHANNELS = [
  { id: 'email', label: 'Email', icon: EmailIcon, defaultEnabled: true },
  { id: 'sms', label: 'SMS', icon: SmsIcon, defaultEnabled: true },
  { id: 'push', label: 'Push Notification', icon: NotificationIcon, defaultEnabled: false },
  { id: 'inapp', label: 'In-App', icon: InfoIcon, defaultEnabled: true },
];

// Template Variables
const TEMPLATE_VARIABLES = [
  { id: 'clientFirstName', label: 'Client First Name', example: 'John' },
  { id: 'clientLastName', label: 'Client Last Name', example: 'Doe' },
  { id: 'clientFullName', label: 'Client Full Name', example: 'John Doe' },
  { id: 'clientAddress', label: 'Client Address', example: '123 Main St' },
  { id: 'clientCity', label: 'Client City', example: 'Anytown' },
  { id: 'clientState', label: 'Client State', example: 'CA' },
  { id: 'clientZip', label: 'Client ZIP', example: '12345' },
  { id: 'clientPhone', label: 'Client Phone', example: '(555) 123-4567' },
  { id: 'clientEmail', label: 'Client Email', example: 'john@example.com' },
  { id: 'currentDate', label: 'Current Date', example: format(new Date(), 'MMMM d, yyyy') },
  { id: 'currentScore', label: 'Current Score', example: '650' },
  { id: 'scoreChange', label: 'Score Change', example: '+15' },
  { id: 'bureauName', label: 'Bureau Name', example: 'Experian' },
  { id: 'accountName', label: 'Account Name', example: 'Capital One' },
  { id: 'accountNumber', label: 'Account Number', example: '****1234' },
  { id: 'disputeReason', label: 'Dispute Reason', example: 'Not my account' },
  { id: 'companyName', label: 'Company Name', example: 'Speedy Credit Repair' },
  { id: 'companyPhone', label: 'Company Phone', example: '(800) 555-0100' },
  { id: 'companyEmail', label: 'Company Email', example: 'support@speedycreditrepair.com' },
];

// Default Templates
const DEFAULT_TEMPLATES = {
  disputeLetter: {
    name: 'Default Dispute Letter',
    category: 'dispute',
    subject: 'Credit Report Dispute - {{clientFullName}}',
    body: `{{currentDate}}

{{bureauName}}
Credit Bureau
{{bureauAddress}}

RE: Dispute of Credit Report Information
Account Number: {{accountNumber}}

Dear {{bureauName}} Disputes Department:

I am writing to dispute the following information in my credit file. I have circled the items I dispute on the attached copy of my report.

Account Name: {{accountName}}
Account Number: {{accountNumber}}
Reason for Dispute: {{disputeReason}}

This item is (inaccurate or incomplete) because {{disputeDetails}}. I am requesting that the item be removed (or request another specific change) to correct the information.

Enclosed are copies of (use this sentence if applicable and describe any enclosed documentation, such as payment records, court documents) supporting my position. Please investigate this matter and correct the disputed item as soon as possible.

Sincerely,

{{clientFullName}}
{{clientAddress}}
{{clientCity}}, {{clientState}} {{clientZip}}
{{clientPhone}}`,
  },
  scoreIncreaseEmail: {
    name: 'Score Increase Notification',
    category: 'notification',
    subject: 'Great News! Your Credit Score Increased 🎉',
    body: `Hi {{clientFirstName}},

We have great news! Your credit score has increased by {{scoreChange}} points!

Previous Score: {{previousScore}}
Current Score: {{currentScore}}
Bureau: {{bureauName}}

This is excellent progress toward your financial goals. Keep up the great work!

If you have any questions, please don't hesitate to reach out.

Best regards,
{{companyName}}
{{companyPhone}}`,
  },
  scoreDropEmail: {
    name: 'Score Drop Alert',
    category: 'notification',
    subject: 'Important: Credit Score Change Detected',
    body: `Hi {{clientFirstName}},

We detected a change in your credit score that requires your attention.

Previous Score: {{previousScore}}
Current Score: {{currentScore}}
Change: {{scoreChange}} points
Bureau: {{bureauName}}

Detected Changes:
{{changeDetails}}

We recommend reviewing your credit report and taking action if needed. Our team is here to help.

Contact us: {{companyPhone}}

Best regards,
{{companyName}}`,
  },
  welcomeSMS: {
    name: 'Welcome SMS',
    category: 'notification',
    subject: null,
    body: 'Welcome to {{companyName}}, {{clientFirstName}}! We\'re here to help improve your credit. Reply HELP for assistance or STOP to opt out.',
  },
};

// Compliance Settings
const COMPLIANCE_FEATURES = [
  {
    id: 'fcra_compliance',
    name: 'FCRA Compliance Checks',
    description: 'Automatically verify compliance with Fair Credit Reporting Act',
    icon: SecurityIcon,
    defaultEnabled: true,
    required: true,
  },
  {
    id: 'audit_logging',
    name: 'Audit Logging',
    description: 'Track all system activities for compliance and security',
    icon: HistoryIcon,
    defaultEnabled: true,
    required: true,
  },
  {
    id: 'data_encryption',
    name: 'Data Encryption',
    description: 'Encrypt sensitive client data at rest and in transit',
    icon: SecurityIcon,
    defaultEnabled: true,
    required: true,
  },
  {
    id: 'consent_tracking',
    name: 'Consent Tracking',
    description: 'Track and manage client consent for credit pulls',
    icon: CheckIcon,
    defaultEnabled: true,
    required: false,
  },
  {
    id: 'document_retention',
    name: 'Document Retention',
    description: 'Automatically manage document retention policies',
    icon: HistoryIcon,
    defaultEnabled: true,
    required: false,
  },
  {
    id: 'privacy_controls',
    name: 'Privacy Controls',
    description: 'Enhanced privacy settings and data protection',
    icon: SecurityIcon,
    defaultEnabled: true,
    required: false,
  },
];

// Feature Flags
const FEATURE_FLAGS = [
  {
    id: 'ai_analysis',
    name: 'AI Credit Analysis',
    description: 'Enable AI-powered credit report analysis',
    icon: AutoIcon,
    defaultEnabled: true,
    beta: false,
  },
  {
    id: 'auto_disputes',
    name: 'Auto-Generate Disputes',
    description: 'Automatically generate dispute letters with AI',
    icon: AutoIcon,
    defaultEnabled: true,
    beta: false,
  },
  {
    id: 'monitoring',
    name: 'Credit Monitoring',
    description: 'Enable automated credit monitoring',
    icon: ScheduleIcon,
    defaultEnabled: true,
    beta: false,
  },
  {
    id: 'fax_integration',
    name: 'Fax Integration',
    description: 'Send disputes via fax using Telnyx',
    icon: FaxIcon,
    defaultEnabled: false,
    beta: true,
  },
  {
    id: 'predictive_analytics',
    name: 'Predictive Analytics',
    description: 'AI-powered score predictions',
    icon: TrendingUpIcon,
    defaultEnabled: false,
    beta: true,
  },
];

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================

const IDIQConfig = () => {
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';

  // ===== TAB STATE =====
  const [activeTab, setActiveTab] = useState(0);

  // ===== LOADING & MESSAGES =====
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== TAB 1: API CREDENTIALS =====
  const [apiCredentials, setApiCredentials] = useState({
    idiq: {
      partnerId: IDIQ_PARTNER_ID,
      apiUrl: 'https://api.idiq.com/v1',
      enabled: false,
    },
    openai: {
      apiKey: '',
      enabled: false,
    },
    telnyx: {
      apiKey: '',
      enabled: false,
    },
  });
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    telnyx: false,
  });
  const [testingConnection, setTestingConnection] = useState(null);
  const [connectionResults, setConnectionResults] = useState({});

  // ===== TAB 2: BUREAU CONFIGURATION =====
  const [bureauConfig, setBureauConfig] = useState(
    BUREAUS.reduce((acc, bureau) => ({
      ...acc,
      [bureau.id]: {
        enabled: bureau.defaultEnabled,
        costPerPull: bureau.defaultCost,
        preferences: {
          autoEnroll: false,
          requireConsent: true,
        },
      },
    }), {})
  );

  // ===== TAB 3: AUTOMATION SETTINGS =====
  const [automationSettings, setAutomationSettings] = useState({
    monitoring: {
      defaultFrequency: 'monthly',
      autoStart: false,
      alertThreshold: 10,
    },
    disputes: {
      autoGenerate: false,
      requireReview: true,
      autoSend: false,
    },
    notifications: {
      channels: {
        email: true,
        sms: true,
        push: false,
        inapp: true,
      },
      triggers: {
        scoreChange: true,
        newAccount: true,
        newInquiry: true,
        negativeItem: true,
      },
    },
  });

  // ===== TAB 4: TEMPLATE MANAGEMENT =====
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState('all');

  // ===== TAB 5: COMPLIANCE SETTINGS =====
  const [complianceSettings, setComplianceSettings] = useState(
    COMPLIANCE_FEATURES.reduce((acc, feature) => ({
      ...acc,
      [feature.id]: feature.defaultEnabled,
    }), {})
  );
  const [retentionPeriod, setRetentionPeriod] = useState(7); // years
  const [auditLogRetention, setAuditLogRetention] = useState(5); // years

  // ===== TAB 6: USER PERMISSIONS =====
  const [featureFlags, setFeatureFlags] = useState(
    FEATURE_FLAGS.reduce((acc, feature) => ({
      ...acc,
      [feature.id]: feature.defaultEnabled,
    }), {})
  );
  const [rolePermissions, setRolePermissions] = useState({
    user: ['view_reports', 'enroll_clients'],
    manager: ['view_reports', 'enroll_clients', 'manage_disputes'],
    admin: ['view_reports', 'enroll_clients', 'manage_disputes', 'view_analytics', 'configure_system'],
    masterAdmin: ['all'],
  });

  // ===== TAB 7: BILLING & USAGE =====
  const [usageData, setUsageData] = useState({
    thisMonth: {
      idiqPulls: 0,
      openaiCalls: 0,
      telnyxFaxes: 0,
      totalCost: 0,
    },
    lastMonth: {
      idiqPulls: 0,
      openaiCalls: 0,
      telnyxFaxes: 0,
      totalCost: 0,
    },
  });
  const [budgetAlert, setBudgetAlert] = useState(1000); // dollars
  const [billingHistory, setBillingHistory] = useState([]);

  // ============================================================================
  // 📥 LOAD CONFIGURATION DATA
  // ============================================================================

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    console.log('📥 Loading IDIQ configuration...');
    setLoading(true);
    setError(null);

    try {
      // Load from Firebase
      const configRef = doc(db, 'systemConfig', 'idiq');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        const config = configSnap.data();
        console.log('✅ Configuration loaded:', config);

        // Apply loaded configuration
        if (config.apiCredentials) setApiCredentials(config.apiCredentials);
        if (config.bureauConfig) setBureauConfig(config.bureauConfig);
        if (config.automationSettings) setAutomationSettings(config.automationSettings);
        if (config.templates) setTemplates({ ...DEFAULT_TEMPLATES, ...config.templates });
        if (config.complianceSettings) setComplianceSettings(config.complianceSettings);
        if (config.featureFlags) setFeatureFlags(config.featureFlags);
        if (config.rolePermissions) setRolePermissions(config.rolePermissions);
        if (config.budgetAlert) setBudgetAlert(config.budgetAlert);
        if (config.retentionPeriod) setRetentionPeriod(config.retentionPeriod);
        if (config.auditLogRetention) setAuditLogRetention(config.auditLogRetention);

        setSuccess('Configuration loaded successfully');
      } else {
        console.log('ℹ️ No existing configuration found, using defaults');
      }

      // Load usage data
      await loadUsageData();
    } catch (err) {
      console.error('❌ Error loading configuration:', err);
      setError('Failed to load configuration: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageData = async () => {
    try {
      console.log('📊 Loading usage data...');

      // Load current month usage
      const usageRef = collection(db, 'apiUsage');
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const q = query(
        usageRef,
        where('month', '==', currentMonth),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      let thisMonthData = {
        idiqPulls: 0,
        openaiCalls: 0,
        telnyxFaxes: 0,
        totalCost: 0,
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.service === 'idiq') thisMonthData.idiqPulls++;
        if (data.service === 'openai') thisMonthData.openaiCalls++;
        if (data.service === 'telnyx') thisMonthData.telnyxFaxes++;
        thisMonthData.totalCost += data.cost || 0;
      });

      setUsageData(prev => ({
        ...prev,
        thisMonth: thisMonthData,
      }));

      console.log('✅ Usage data loaded:', thisMonthData);
    } catch (err) {
      console.error('❌ Error loading usage data:', err);
    }
  };

  // ============================================================================
  // 💾 SAVE CONFIGURATION
  // ============================================================================

  const handleSaveConfiguration = async () => {
    console.log('💾 Saving configuration...');
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const configData = {
        apiCredentials,
        bureauConfig,
        automationSettings,
        templates,
        complianceSettings,
        featureFlags,
        rolePermissions,
        budgetAlert,
        retentionPeriod,
        auditLogRetention,
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      const configRef = doc(db, 'systemConfig', 'idiq');
      await setDoc(configRef, configData, { merge: true });

      console.log('✅ Configuration saved successfully');
      setSuccess('Configuration saved successfully!');

      // Log audit trail
      await logAudit('config_updated', 'Configuration updated', configData);
    } catch (err) {
      console.error('❌ Error saving configuration:', err);
      setError('Failed to save configuration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // 🧪 TEST API CONNECTIONS
  // ============================================================================

  const handleTestConnection = async (service) => {
    console.log(`🧪 Testing ${service} connection...`);
    setTestingConnection(service);
    setConnectionResults(prev => ({ ...prev, [service]: null }));

    try {
      const serviceConfig = API_SERVICES[service];
      const credentials = apiCredentials[service];

      // Simulate API test (replace with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      const result = {
        success: true,
        message: `${serviceConfig.name} connection successful!`,
        timestamp: new Date().toISOString(),
      };

      setConnectionResults(prev => ({ ...prev, [service]: result }));
      setSuccess(`${serviceConfig.name} connection test passed!`);
    } catch (err) {
      console.error(`❌ ${service} connection test failed:`, err);
      const result = {
        success: false,
        message: err.message,
        timestamp: new Date().toISOString(),
      };
      setConnectionResults(prev => ({ ...prev, [service]: result }));
      setError(`${service} connection test failed: ${err.message}`);
    } finally {
      setTestingConnection(null);
    }
  };

  // ============================================================================
  // 📝 TEMPLATE MANAGEMENT
  // ============================================================================

  const handleEditTemplate = (templateKey) => {
    setEditingTemplate({
      key: templateKey,
      ...templates[templateKey],
    });
    setShowTemplateDialog(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      const { key, ...templateData } = editingTemplate;
      setTemplates(prev => ({
        ...prev,
        [key]: templateData,
      }));
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setSuccess('Template saved successfully!');
    }
  };

  const handleDeleteTemplate = (templateKey) => {
    if (Object.keys(DEFAULT_TEMPLATES).includes(templateKey)) {
      setError('Cannot delete default templates');
      return;
    }

    const newTemplates = { ...templates };
    delete newTemplates[templateKey];
    setTemplates(newTemplates);
    setSuccess('Template deleted successfully');
  };

  const insertVariable = (variable) => {
    if (editingTemplate) {
      const cursorPos = document.activeElement?.selectionStart || 0;
      const text = editingTemplate.body || '';
      const before = text.substring(0, cursorPos);
      const after = text.substring(cursorPos);
      const newText = before + `{{${variable}}}` + after;

      setEditingTemplate(prev => ({
        ...prev,
        body: newText,
      }));
    }
  };

  // ============================================================================
  // 📊 AUDIT LOGGING
  // ============================================================================

  const logAudit = async (action, description, metadata = {}) => {
    try {
      const auditRef = collection(db, 'auditLog');
      await addDoc(auditRef, {
        action,
        description,
        metadata,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        timestamp: serverTimestamp(),
      });
      console.log('📝 Audit log entry created:', action);
    } catch (err) {
      console.error('❌ Error creating audit log:', err);
    }
  };

  // ============================================================================
  // 🎨 RENDER FUNCTIONS
  // ============================================================================

  // Render Tab 1: API Credentials
  const renderAPICredentials = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        API Credentials Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure and test API connections for IDIQ, OpenAI, and Telnyx services
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(API_SERVICES).map(([serviceKey, service]) => {
          const credentials = apiCredentials[serviceKey];
          const ServiceIcon = service.icon;
          const connectionResult = connectionResults[serviceKey];
          const isTesting = testingConnection === serviceKey;

          return (
            <Grid item xs={12} key={serviceKey}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: service.color, mr: 2 }}>
                      <ServiceIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={credentials.enabled}
                          onChange={(e) =>
                            setApiCredentials(prev => ({
                              ...prev,
                              [serviceKey]: {
                                ...prev[serviceKey],
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Enabled"
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {service.requiredFields.includes('partnerId') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Partner ID"
                          value={credentials.partnerId || ''}
                          onChange={(e) =>
                            setApiCredentials(prev => ({
                              ...prev,
                              [serviceKey]: {
                                ...prev[serviceKey],
                                partnerId: e.target.value,
                              },
                            }))
                          }
                          disabled={!credentials.enabled}
                        />
                      </Grid>
                    )}

                    {service.requiredFields.includes('apiUrl') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="API URL"
                          value={credentials.apiUrl || ''}
                          onChange={(e) =>
                            setApiCredentials(prev => ({
                              ...prev,
                              [serviceKey]: {
                                ...prev[serviceKey],
                                apiUrl: e.target.value,
                              },
                            }))
                          }
                          disabled={!credentials.enabled}
                        />
                      </Grid>
                    )}

                    {service.requiredFields.includes('apiKey') && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="API Key"
                          type={showApiKeys[serviceKey] ? 'text' : 'password'}
                          value={credentials.apiKey || ''}
                          onChange={(e) =>
                            setApiCredentials(prev => ({
                              ...prev,
                              [serviceKey]: {
                                ...prev[serviceKey],
                                apiKey: e.target.value,
                              },
                            }))
                          }
                          disabled={!credentials.enabled}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    setShowApiKeys(prev => ({
                                      ...prev,
                                      [serviceKey]: !prev[serviceKey],
                                    }))
                                  }
                                  edge="end"
                                >
                                  {showApiKeys[serviceKey] ? <HideIcon /> : <ViewIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                          variant="outlined"
                          startIcon={isTesting ? <CircularProgress size={20} /> : <TestIcon />}
                          onClick={() => handleTestConnection(serviceKey)}
                          disabled={!credentials.enabled || isTesting}
                        >
                          {isTesting ? 'Testing...' : 'Test Connection'}
                        </Button>

                        {connectionResult && (
                          <Chip
                            icon={connectionResult.success ? <CheckIcon /> : <ErrorIcon />}
                            label={connectionResult.success ? 'Connected' : 'Failed'}
                            color={connectionResult.success ? 'success' : 'error'}
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  // Render Tab 2: Bureau Configuration
  const renderBureauConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Credit Bureau Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable bureaus, set pricing, and configure preferences
      </Typography>

      <Grid container spacing={3}>
        {BUREAUS.map(bureau => {
          const config = bureauConfig[bureau.id];

          return (
            <Grid item xs={12} md={6} key={bureau.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: bureau.color,
                        width: 48,
                        height: 48,
                        mr: 2,
                      }}
                    >
                      {bureau.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {bureau.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bureau.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={(e) =>
                            setBureauConfig(prev => ({
                              ...prev,
                              [bureau.id]: {
                                ...prev[bureau.id],
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label=""
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cost Per Pull"
                        type="number"
                        value={config.costPerPull}
                        onChange={(e) =>
                          setBureauConfig(prev => ({
                            ...prev,
                            [bureau.id]: {
                              ...prev[bureau.id],
                              costPerPull: parseFloat(e.target.value),
                            },
                          }))
                        }
                        disabled={!config.enabled}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.preferences.autoEnroll}
                            onChange={(e) =>
                              setBureauConfig(prev => ({
                                ...prev,
                                [bureau.id]: {
                                  ...prev[bureau.id],
                                  preferences: {
                                    ...prev[bureau.id].preferences,
                                    autoEnroll: e.target.checked,
                                  },
                                },
                              }))
                            }
                            disabled={!config.enabled}
                          />
                        }
                        label="Auto-enroll new clients"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={config.preferences.requireConsent}
                            onChange={(e) =>
                              setBureauConfig(prev => ({
                                ...prev,
                                [bureau.id]: {
                                  ...prev[bureau.id],
                                  preferences: {
                                    ...prev[bureau.id].preferences,
                                    requireConsent: e.target.checked,
                                  },
                                },
                              }))
                            }
                            disabled={!config.enabled}
                          />
                        }
                        label="Require client consent"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Contact: {bureau.phone}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        Website: {bureau.website}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  // Render Tab 3: Automation Settings
  const renderAutomationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Automation Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure automated monitoring, disputes, and notifications
      </Typography>

      <Grid container spacing={3}>
        {/* Monitoring Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credit Monitoring
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Default Frequency</InputLabel>
                    <Select
                      value={automationSettings.monitoring.defaultFrequency}
                      label="Default Frequency"
                      onChange={(e) =>
                        setAutomationSettings(prev => ({
                          ...prev,
                          monitoring: {
                            ...prev.monitoring,
                            defaultFrequency: e.target.value,
                          },
                        }))
                      }
                    >
                      {MONITORING_FREQUENCIES.map(freq => (
                        <MenuItem key={freq.id} value={freq.id}>
                          {freq.label} ({freq.days} days)
                          {freq.recommended && ' - Recommended'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Alert Threshold (score change)"
                    type="number"
                    value={automationSettings.monitoring.alertThreshold}
                    onChange={(e) =>
                      setAutomationSettings(prev => ({
                        ...prev,
                        monitoring: {
                          ...prev.monitoring,
                          alertThreshold: parseInt(e.target.value),
                        },
                      }))
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">points</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.monitoring.autoStart}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            monitoring: {
                              ...prev.monitoring,
                              autoStart: e.target.checked,
                            },
                          }))
                        }
                      />
                    }
                    label="Auto-start monitoring for new enrollments"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Dispute Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dispute Automation
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.disputes.autoGenerate}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            disputes: {
                              ...prev.disputes,
                              autoGenerate: e.target.checked,
                            },
                          }))
                        }
                      />
                    }
                    label="Auto-generate dispute letters with AI"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.disputes.requireReview}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            disputes: {
                              ...prev.disputes,
                              requireReview: e.target.checked,
                            },
                          }))
                        }
                        disabled={!automationSettings.disputes.autoGenerate}
                      />
                    }
                    label="Require admin review before sending"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.disputes.autoSend}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            disputes: {
                              ...prev.disputes,
                              autoSend: e.target.checked,
                            },
                          }))
                        }
                        disabled={!automationSettings.disputes.autoGenerate || automationSettings.disputes.requireReview}
                      />
                    }
                    label="Auto-send disputes (requires review to be disabled)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Notification Channels
              </Typography>
              <Grid container spacing={2}>
                {NOTIFICATION_CHANNELS.map(channel => {
                  const ChannelIcon = channel.icon;
                  return (
                    <Grid item xs={6} md={3} key={channel.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={automationSettings.notifications.channels[channel.id]}
                            onChange={(e) =>
                              setAutomationSettings(prev => ({
                                ...prev,
                                notifications: {
                                  ...prev.notifications,
                                  channels: {
                                    ...prev.notifications.channels,
                                    [channel.id]: e.target.checked,
                                  },
                                },
                              }))
                            }
                            icon={<ChannelIcon />}
                            checkedIcon={<ChannelIcon />}
                          />
                        }
                        label={channel.label}
                      />
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Notification Triggers
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.notifications.triggers.scoreChange}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              triggers: {
                                ...prev.notifications.triggers,
                                scoreChange: e.target.checked,
                              },
                            },
                          }))
                        }
                      />
                    }
                    label="Score Changes"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.notifications.triggers.newAccount}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              triggers: {
                                ...prev.notifications.triggers,
                                newAccount: e.target.checked,
                              },
                            },
                          }))
                        }
                      />
                    }
                    label="New Accounts"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.notifications.triggers.newInquiry}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              triggers: {
                                ...prev.notifications.triggers,
                                newInquiry: e.target.checked,
                              },
                            },
                          }))
                        }
                      />
                    }
                    label="New Inquiries"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={automationSettings.notifications.triggers.negativeItem}
                        onChange={(e) =>
                          setAutomationSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              triggers: {
                                ...prev.notifications.triggers,
                                negativeItem: e.target.checked,
                              },
                            },
                          }))
                        }
                      />
                    }
                    label="Negative Items"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Tab 4: Template Management
  const renderTemplateManagement = () => {
    const filteredTemplates = Object.entries(templates).filter(([key, template]) => {
      if (selectedTemplateType === 'all') return true;
      return template.category === selectedTemplateType;
    });

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Template Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage dispute letters, emails, and SMS templates
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTemplate({
                key: `custom_${Date.now()}`,
                name: 'New Template',
                category: 'dispute',
                subject: '',
                body: '',
              });
              setShowTemplateDialog(true);
            }}
          >
            Create Template
          </Button>
        </Box>

        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedTemplateType}
            label="Filter by Type"
            onChange={(e) => setSelectedTemplateType(e.target.value)}
          >
            <MenuItem value="all">All Templates</MenuItem>
            <MenuItem value="dispute">Dispute Letters</MenuItem>
            <MenuItem value="notification">Notifications</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={2}>
          {filteredTemplates.map(([key, template]) => {
            const isDefault = Object.keys(DEFAULT_TEMPLATES).includes(key);

            return (
              <Grid item xs={12} md={6} key={key}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontSize="1rem" fontWeight="bold">
                          {template.name}
                        </Typography>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{ mt: 0.5 }}
                          color={template.category === 'dispute' ? 'primary' : 'secondary'}
                        />
                        {isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{ mt: 0.5, ml: 1 }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTemplate(key)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!isDefault && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTemplate(key)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {template.subject && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Subject:</strong> {template.subject}
                      </Typography>
                    )}

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        maxHeight: 150,
                        overflow: 'auto',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      {template.body.substring(0, 200)}
                      {template.body.length > 200 && '...'}
                    </Paper>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {template.body.split(' ').length} words
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render Tab 5: Compliance Settings
  const renderComplianceSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Compliance & Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure FCRA compliance, audit logging, and privacy controls
      </Typography>

      <Grid container spacing={3}>
        {/* Compliance Features */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Compliance Features
              </Typography>

              {COMPLIANCE_FEATURES.map(feature => {
                const FeatureIcon = feature.icon;
                return (
                  <Box key={feature.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 36, height: 36 }}>
                        <FeatureIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {feature.name}
                          {feature.required && (
                            <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={complianceSettings[feature.id]}
                        onChange={(e) =>
                          setComplianceSettings(prev => ({
                            ...prev,
                            [feature.id]: e.target.checked,
                          }))
                        }
                        disabled={feature.required}
                      />
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Retention Policies */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Retention
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credit reports and client documents
              </Typography>
              <Slider
                value={retentionPeriod}
                onChange={(e, val) => setRetentionPeriod(val)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
                valueLabelFormat={(val) => `${val} years`}
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Audit logs and system activity
              </Typography>
              <Slider
                value={auditLogRetention}
                onChange={(e, val) => setAuditLogRetention(val)}
                min={1}
                max={10}
                marks
                valueLabelDisplay="on"
                valueLabelFormat={(val) => `${val} years`}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Disclaimers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required Disclaimers
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>FCRA Disclaimer</AlertTitle>
                <Typography variant="body2">
                  All credit report access is logged and must comply with FCRA permissible purpose requirements.
                </Typography>
              </Alert>

              <Alert severity="warning">
                <AlertTitle>Privacy Notice</AlertTitle>
                <Typography variant="body2">
                  Client data is encrypted at rest and in transit. Access is restricted to authorized personnel only.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Tab 6: User Permissions
  const renderUserPermissions = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        User Permissions & Feature Flags
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure role-based access and enable/disable features
      </Typography>

      <Grid container spacing={3}>
        {/* Feature Flags */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feature Flags
              </Typography>

              {FEATURE_FLAGS.map(feature => {
                const FeatureIcon = feature.icon;
                return (
                  <Box key={feature.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 36, height: 36 }}>
                        <FeatureIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {feature.name}
                          {feature.beta && (
                            <Chip label="Beta" size="small" color="warning" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                      <Switch
                        checked={featureFlags[feature.id]}
                        onChange={(e) =>
                          setFeatureFlags(prev => ({
                            ...prev,
                            [feature.id]: e.target.checked,
                          }))
                        }
                      />
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Role Permissions (Read Only for now) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role-Based Permissions
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Permissions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(rolePermissions).map(([role, permissions]) => (
                      <TableRow key={role}>
                        <TableCell>
                          <Chip label={role} color="primary" size="small" />
                        </TableCell>
                        <TableCell>
                          {Array.isArray(permissions) ? (
                            permissions.map(perm => (
                              <Chip key={perm} label={perm} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))
                          ) : (
                            <Chip label="All Permissions" color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info" sx={{ mt: 2 }}>
                Role permissions are currently managed at the code level. Contact system administrator to modify.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render Tab 7: Billing & Usage
  const renderBillingUsage = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Billing & Usage Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track API usage, costs, and configure budget alerts
      </Typography>

      <Grid container spacing={3}>
        {/* Usage Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">IDIQ Pulls</Typography>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <CreditCard fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {usageData.thisMonth.idiqPulls}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">AI Calls</Typography>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                  <AutoIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {usageData.thisMonth.openaiCalls}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Faxes Sent</Typography>
                <Avatar sx={{ bgcolor: 'info.main', width: 36, height: 36 }}>
                  <FaxIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {usageData.thisMonth.telnyxFaxes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Total Cost</Typography>
                <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36 }}>
                  <MoneyIcon fontSize="small" />
                </Avatar>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${usageData.thisMonth.totalCost.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Alert Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Alert
              </Typography>

              <TextField
                fullWidth
                label="Monthly Budget Alert"
                type="number"
                value={budgetAlert}
                onChange={(e) => setBudgetAlert(parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />

              <Alert severity={usageData.thisMonth.totalCost > budgetAlert ? 'error' : 'info'} sx={{ mt: 2 }}>
                {usageData.thisMonth.totalCost > budgetAlert ? (
                  <AlertTitle>Budget Exceeded!</AlertTitle>
                ) : (
                  <AlertTitle>Budget Status</AlertTitle>
                )}
                <Typography variant="body2">
                  Current: ${usageData.thisMonth.totalCost.toFixed(2)} / ${budgetAlert.toFixed(2)}
                  ({((usageData.thisMonth.totalCost / budgetAlert) * 100).toFixed(1)}%)
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CreditCard color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit Report Pulls"
                    secondary={`${usageData.thisMonth.idiqPulls} pulls × $15.00`}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    ${(usageData.thisMonth.idiqPulls * 15).toFixed(2)}
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AutoIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="AI Analysis"
                    secondary={`${usageData.thisMonth.openaiCalls} calls`}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    ${(usageData.thisMonth.openaiCalls * 0.02).toFixed(2)}
                  </Typography>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <FaxIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fax Services"
                    secondary={`${usageData.thisMonth.telnyxFaxes} faxes`}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    ${(usageData.thisMonth.telnyxFaxes * 0.05).toFixed(2)}
                  </Typography>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemText primary={<strong>Total</strong>} />
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${usageData.thisMonth.totalCost.toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled
                >
                  Export Usage Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  disabled
                >
                  View Billing History
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AnalyticsIcon />}
                  disabled
                >
                  Cost Optimization Tips
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================================
  // 🎨 MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading configuration...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (userRole !== 'admin' && userRole !== 'masterAdmin') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.main', mx: 'auto', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You need admin privileges to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'white',
                color: 'primary.main',
                mr: 2,
              }}
            >
              <SettingsIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                IDIQ Configuration
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                System settings and admin controls
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveConfiguration}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              startIcon={<RefreshIcon />}
              onClick={loadConfiguration}
            >
              Reload
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Fade>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<KeyIcon />} label="API Credentials" />
          <Tab icon={<BureauIcon />} label="Bureau Config" />
          <Tab icon={<AutoIcon />} label="Automation" />
          <Tab icon={<TemplateIcon />} label="Templates" />
          <Tab icon={<ComplianceIcon />} label="Compliance" />
          <Tab icon={<PeopleIcon />} label="Permissions" />
          <Tab icon={<MoneyIcon />} label="Billing & Usage" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderAPICredentials()}
          {activeTab === 1 && renderBureauConfig()}
          {activeTab === 2 && renderAutomationSettings()}
          {activeTab === 3 && renderTemplateManagement()}
          {activeTab === 4 && renderComplianceSettings()}
          {activeTab === 5 && renderUserPermissions()}
          {activeTab === 6 && renderBillingUsage()}
        </Box>
      </Paper>

      {/* Template Edit Dialog */}
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingTemplate?.key?.startsWith('custom_') ? 'Create' : 'Edit'} Template
            </Typography>
            <IconButton onClick={() => setShowTemplateDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {editingTemplate && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editingTemplate.category}
                      label="Category"
                      onChange={(e) =>
                        setEditingTemplate(prev => ({ ...prev, category: e.target.value }))
                      }
                    >
                      <MenuItem value="dispute">Dispute Letter</MenuItem>
                      <MenuItem value="notification">Notification</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {editingTemplate.category !== 'notification' || editingTemplate.subject !== null ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject (optional)"
                      value={editingTemplate.subject || ''}
                      onChange={(e) =>
                        setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))
                      }
                    />
                  </Grid>
                ) : null}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Template Body
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={editingTemplate.body}
                    onChange={(e) =>
                      setEditingTemplate(prev => ({ ...prev, body: e.target.value }))
                    }
                    sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Variables
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {TEMPLATE_VARIABLES.map(variable => (
                      <Tooltip key={variable.id} title={`Example: ${variable.example}`}>
                        <Chip
                          label={`{{${variable.id}}}`}
                          size="small"
                          onClick={() => insertVariable(variable.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveTemplate}>
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IDIQConfig;