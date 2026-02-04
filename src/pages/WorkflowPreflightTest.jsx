// =============================================================================
// Path: src/pages/WorkflowPreflightTest.jsx
// =============================================================================
// SPEEDYCRM WORKFLOW PRE-FLIGHT TESTING DASHBOARD
// Purpose: Verify all workflow components are connected before live testing
// Author: Christopher Lahage, Speedy Credit Repair Inc.
// © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Database,
  Server,
  Mail,
  CreditCard,
  FileText,
  User,
  Shield,
  Zap,
  ExternalLink,
  Copy,
  Eye,
  Clock,
  ArrowRight,
  Activity,
  Settings,
  Terminal,
  Link as LinkIcon,
  ExpandMore,
  Rocket,
  Target,
  CheckSquare,
  Square,
  HelpCircle,
  Info,
} from 'lucide-react';

// =============================================================================
// ===== FIREBASE IMPORTS =====
// =============================================================================
import { db, auth } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';

// =============================================================================
// ===== WORKFLOW STAGES CONFIGURATION =====
// =============================================================================
const WORKFLOW_STAGES = [
  {
    id: 'infrastructure',
    name: 'Infrastructure Checks',
    description: 'Verify Firebase, Cloud Functions, and external services',
    icon: Server,
    checks: [
      {
        id: 'firebase_connected',
        name: 'Firebase Connection',
        description: 'Verify Firestore database is accessible',
        type: 'auto',
      },
      {
        id: 'cloud_functions',
        name: 'Cloud Functions',
        description: 'Verify onContactUpdated function is deployed',
        type: 'manual',
        instruction: 'Check Firebase Console → Functions for "onContactUpdated" status',
      },
      {
        id: 'webhook_active',
        name: 'Webhook Endpoint',
        description: 'Verify webhook can receive requests',
        type: 'auto',
      },
      {
        id: 'email_configured',
        name: 'Email Service',
        description: 'Verify email credentials are configured',
        type: 'manual',
        instruction: 'Check Firebase Console → Functions → Secret Manager for email credentials',
      },
    ],
  },
  {
    id: 'lead_capture',
    name: 'Stage 1: Lead Capture',
    description: 'Contact creation and initial data capture',
    icon: User,
    checks: [
      {
        id: 'can_create_contact',
        name: 'Create Test Contact',
        description: 'Create a new contact for workflow testing',
        type: 'action',
      },
      {
        id: 'contact_has_roles',
        name: 'Roles Array',
        description: 'Contact has roles: ["contact", "lead"]',
        type: 'verify',
        field: 'roles',
      },
      {
        id: 'pipeline_stage_new',
        name: 'Pipeline Stage',
        description: 'Contact is in "new_lead" stage',
        type: 'verify',
        field: 'pipelineStage',
      },
    ],
  },
  {
    id: 'idiq_enrollment',
    name: 'Stage 2: IDIQ Enrollment',
    description: 'Credit report enrollment and retrieval',
    icon: CreditCard,
    checks: [
      {
        id: 'enrollment_page_loads',
        name: 'Enrollment Page',
        description: 'CompleteEnrollmentFlow.jsx loads correctly',
        type: 'link',
        url: '/complete-enrollment',
      },
      {
        id: 'idiq_enrollment_complete',
        name: 'IDIQ Enrollment',
        description: 'idiqEnrollmentComplete: true',
        type: 'verify',
        field: 'idiqEnrollmentComplete',
      },
      {
        id: 'roles_prospect',
        name: 'Prospect Role',
        description: 'roles includes "prospect"',
        type: 'verify',
        field: 'roles',
        contains: 'prospect',
      },
    ],
  },
  {
    id: 'plan_selection',
    name: 'Stage 3: Plan Selection',
    description: 'Service plan selection',
    icon: Target,
    checks: [
      {
        id: 'plan_page_loads',
        name: 'Plan Selection Page',
        description: 'ClientPlanSelection.jsx loads correctly',
        type: 'link',
        url: '/plan-selection',
      },
      {
        id: 'plan_selected',
        name: 'Plan Selected',
        description: 'selectedPlan object exists',
        type: 'verify',
        field: 'selectedPlan',
      },
    ],
  },
  {
    id: 'contract_signing',
    name: 'Stage 4: Contract Signing',
    description: 'Contract review and signature',
    icon: FileText,
    checks: [
      {
        id: 'contract_page_loads',
        name: 'Contract Page',
        description: 'ContractSigningPortal.jsx loads correctly',
        type: 'link',
        url: '/contract',
      },
      {
        id: 'contract_signed',
        name: 'Contract Signed',
        description: 'contractSigned: true (TRIGGERS EMAIL)',
        type: 'verify',
        field: 'contractSigned',
        critical: true,
      },
      {
        id: 'signature_stored',
        name: 'Signature URL',
        description: 'contractSignatureUrl exists',
        type: 'verify',
        field: 'contractSignatureUrl',
      },
    ],
  },
  {
    id: 'document_upload',
    name: 'Stage 5: Document Upload',
    description: 'ID and proof of address upload',
    icon: FileText,
    checks: [
      {
        id: 'doc_page_loads',
        name: 'Document Upload Page',
        description: 'DocumentUploadPortal.jsx loads correctly',
        type: 'link',
        url: '/portal/documents',
      },
      {
        id: 'photo_id_uploaded',
        name: 'Photo ID',
        description: 'photoIdUrl exists',
        type: 'verify',
        field: 'photoIdUrl',
      },
      {
        id: 'id_received',
        name: 'ID Received Flag',
        description: 'documents.idReceived: true',
        type: 'verify',
        field: 'documents.idReceived',
      },
    ],
  },
  {
    id: 'ach_authorization',
    name: 'Stage 6: ACH Authorization',
    description: 'Payment authorization and client conversion',
    icon: CreditCard,
    checks: [
      {
        id: 'ach_page_loads',
        name: 'ACH Page',
        description: 'ACHAuthorization.jsx loads correctly',
        type: 'link',
        url: '/ach-authorization',
      },
      {
        id: 'ach_authorized',
        name: 'ACH Authorized',
        description: 'achAuthorized: true (TRIGGERS WELCOME EMAIL)',
        type: 'verify',
        field: 'achAuthorized',
        critical: true,
      },
      {
        id: 'status_client',
        name: 'Client Status',
        description: 'status: "client"',
        type: 'verify',
        field: 'status',
        expectedValue: 'client',
      },
      {
        id: 'roles_client',
        name: 'Client Role',
        description: 'roles includes "client"',
        type: 'verify',
        field: 'roles',
        contains: 'client',
      },
    ],
  },
  {
    id: 'client_activated',
    name: 'Stage 7: Client Activated',
    description: 'Full client access and service start',
    icon: CheckCircle,
    checks: [
      {
        id: 'portal_accessible',
        name: 'Client Portal',
        description: 'Client can access full portal',
        type: 'link',
        url: '/portal',
      },
      {
        id: 'client_since',
        name: 'Client Since',
        description: 'clientSince timestamp exists',
        type: 'verify',
        field: 'clientSince',
      },
    ],
  },
];

// =============================================================================
// ===== IDIQ TEST DATA =====
// =============================================================================
const IDIQ_TEST_DATA = [
  {
    name: 'HOT CHILI',
    firstName: 'HOT',
    lastName: 'CHILI',
    street: '3325 ARMORY RD',
    city: 'CASTLE HAYNE',
    state: 'NC',
    zip: '28430',
    ssn: '666525461',
    dob: '01/01/1984',
    cardType: 'Visa',
    cardNumber: '4196361146706934',
    cvv: '331',
  },
  {
    name: 'ED HEAT',
    firstName: 'ED',
    lastName: 'HEAT',
    street: '4163 WHITE OAK DR',
    city: 'MISSOURI CITY',
    state: 'MO',
    zip: '64072',
    ssn: '666254741',
    dob: '01/01/1984',
    cardType: 'Visa',
    cardNumber: '4009348888881881',
    cvv: '331',
  },
  {
    name: 'REAPER JOHN',
    firstName: 'REAPER',
    lastName: 'JOHN',
    street: '805 WALNUT STREET',
    city: 'JACKSON',
    state: 'MS',
    zip: '39202',
    ssn: '666254146',
    dob: '01/01/1984',
    cardType: 'Visa',
    cardNumber: '4009348888881881',
    cvv: '321',
  },
];

// =============================================================================
// ===== MAIN COMPONENT =====
// =============================================================================
const WorkflowPreflightTest = () => {
  // ===== STATE =====
  const [activeStage, setActiveStage] = useState(0);
  const [testContactId, setTestContactId] = useState('');
  const [contactData, setContactData] = useState(null);
  const [checkResults, setCheckResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expanded, setExpanded] = useState('infrastructure');
  const [testDataDialogOpen, setTestDataDialogOpen] = useState(false);
  const [selectedTestData, setSelectedTestData] = useState(null);
  const [realtimeListener, setRealtimeListener] = useState(null);

  // ===== FIREBASE CONNECTION TEST =====
  const testFirebaseConnection = useCallback(async () => {
    try {
      const testRef = doc(db, '_system', 'connectionTest');
      await setDoc(testRef, {
        timestamp: serverTimestamp(),
        test: true,
      });
      await deleteDoc(testRef);
      return { success: true, message: 'Firebase connected successfully' };
    } catch (err) {
      console.error('Firebase connection test failed:', err);
      return { success: false, message: err.message };
    }
  }, []);

  // ===== WEBHOOK TEST =====
  const testWebhook = useCallback(async () => {
    try {
      const response = await fetch(
        'https://speedycrm-webhook-305382808826.us-central1.run.app/webhook?apiKey=scr-webhook-2025-secure-key-abc123',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, source: 'preflight_check', timestamp: new Date().toISOString() }),
        }
      );
      
      if (response.ok) {
        return { success: true, message: `Webhook responded: ${response.status}` };
      } else {
        return { success: false, message: `Webhook error: ${response.status}` };
      }
    } catch (err) {
      // CORS might block this, which is actually OK for security
      return { 
        success: null, 
        message: 'Cannot test directly (CORS). Check Firebase Functions logs for webhook activity.' 
      };
    }
  }, []);

  // ===== CREATE TEST CONTACT =====
  const createTestContact = useCallback(async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const testEmail = `preflight-test-${timestamp}@speedycrm-test.com`;
      
      const contactRef = doc(collection(db, 'contacts'));
      const newContact = {
        firstName: 'Preflight',
        lastName: 'Test',
        email: testEmail,
        phone: '555-0199',
        roles: ['contact', 'lead'],
        status: 'lead',
        pipelineStage: 'new_lead',
        source: 'preflight_test',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        testContact: true, // Flag for easy cleanup
      };
      
      await setDoc(contactRef, newContact);
      setTestContactId(contactRef.id);
      setContactData({ id: contactRef.id, ...newContact });
      setSuccess(`Test contact created: ${contactRef.id}`);
      
      // Update check result
      setCheckResults(prev => ({
        ...prev,
        can_create_contact: { success: true, message: 'Contact created successfully' },
      }));
      
      return { success: true, contactId: contactRef.id };
    } catch (err) {
      console.error('Failed to create test contact:', err);
      setError(`Failed to create contact: ${err.message}`);
      setCheckResults(prev => ({
        ...prev,
        can_create_contact: { success: false, message: err.message },
      }));
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== LOAD EXISTING CONTACT =====
  const loadContact = useCallback(async (contactId) => {
    if (!contactId) return;
    
    setLoading(true);
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactSnap = await getDoc(contactRef);
      
      if (contactSnap.exists()) {
        setContactData({ id: contactSnap.id, ...contactSnap.data() });
        setSuccess(`Contact loaded: ${contactId}`);
        return { success: true, data: contactSnap.data() };
      } else {
        setError('Contact not found');
        return { success: false, message: 'Contact not found' };
      }
    } catch (err) {
      console.error('Failed to load contact:', err);
      setError(`Failed to load contact: ${err.message}`);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== SETUP REALTIME LISTENER =====
  useEffect(() => {
    if (!testContactId) return;
    
    const contactRef = doc(db, 'contacts', testContactId);
    const unsubscribe = onSnapshot(contactRef, (doc) => {
      if (doc.exists()) {
        setContactData({ id: doc.id, ...doc.data() });
        // Auto-verify checks when data changes
        verifyAllChecks({ id: doc.id, ...doc.data() });
      }
    }, (err) => {
      console.error('Realtime listener error:', err);
    });
    
    setRealtimeListener(() => unsubscribe);
    
    return () => unsubscribe();
  }, [testContactId]);

  // ===== VERIFY FIELD CHECK =====
  const verifyFieldCheck = useCallback((check, data) => {
    if (!data) return { success: null, message: 'No contact data' };
    
    const fieldPath = check.field.split('.');
    let value = data;
    
    for (const key of fieldPath) {
      value = value?.[key];
    }
    
    if (check.contains) {
      // Check if array contains value
      const contains = Array.isArray(value) && value.includes(check.contains);
      return {
        success: contains,
        message: contains ? `Contains "${check.contains}"` : `Missing "${check.contains}"`,
        value: value,
      };
    }
    
    if (check.expectedValue !== undefined) {
      // Check for specific value
      const matches = value === check.expectedValue;
      return {
        success: matches,
        message: matches ? `Value: "${value}"` : `Expected "${check.expectedValue}", got "${value}"`,
        value: value,
      };
    }
    
    // Check if field exists and is truthy
    const exists = value !== undefined && value !== null && value !== false && value !== '';
    return {
      success: exists,
      message: exists ? `Value: ${JSON.stringify(value).slice(0, 50)}` : 'Field not set',
      value: value,
    };
  }, []);

  // ===== VERIFY ALL CHECKS =====
  const verifyAllChecks = useCallback((data) => {
    const results = {};
    
    WORKFLOW_STAGES.forEach(stage => {
      stage.checks.forEach(check => {
        if (check.type === 'verify') {
          results[check.id] = verifyFieldCheck(check, data);
        }
      });
    });
    
    setCheckResults(prev => ({ ...prev, ...results }));
  }, [verifyFieldCheck]);

  // ===== RUN INFRASTRUCTURE TESTS =====
  const runInfrastructureTests = useCallback(async () => {
    setLoading(true);
    
    // Test Firebase
    const firebaseResult = await testFirebaseConnection();
    setCheckResults(prev => ({ ...prev, firebase_connected: firebaseResult }));
    
    // Test Webhook
    const webhookResult = await testWebhook();
    setCheckResults(prev => ({ ...prev, webhook_active: webhookResult }));
    
    setLoading(false);
  }, [testFirebaseConnection, testWebhook]);

  // ===== COPY TO CLIPBOARD =====
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setSuccess(`Copied: ${text}`);
  }, []);

  // ===== GET STATUS ICON =====
  const getStatusIcon = (result) => {
    if (!result) return <Square size={20} color="#9e9e9e" />;
    if (result.success === true) return <CheckCircle size={20} color="#4caf50" />;
    if (result.success === false) return <XCircle size={20} color="#f44336" />;
    return <AlertTriangle size={20} color="#ff9800" />;
  };

  // ===== GET STATUS COLOR =====
  const getStatusColor = (result) => {
    if (!result) return 'default';
    if (result.success === true) return 'success';
    if (result.success === false) return 'error';
    return 'warning';
  };

  // ===== CALCULATE STAGE PROGRESS =====
  const calculateStageProgress = (stage) => {
    const checks = stage.checks;
    const completed = checks.filter(c => checkResults[c.id]?.success === true).length;
    return (completed / checks.length) * 100;
  };

  // ===== RENDER CHECK ITEM =====
  const renderCheckItem = (check, stageId) => {
    const result = checkResults[check.id];
    
    return (
      <ListItem key={check.id} sx={{ pl: 4 }}>
        <ListItemIcon>
          {getStatusIcon(result)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={check.critical ? 600 : 400}>
                {check.name}
              </Typography>
              {check.critical && (
                <Chip label="TRIGGER" size="small" color="warning" />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="caption" color="text.secondary">
                {check.description}
              </Typography>
              {result?.message && (
                <Typography variant="caption" display="block" color={getStatusColor(result)}>
                  {result.message}
                </Typography>
              )}
              {check.instruction && (
                <Typography variant="caption" display="block" color="info.main">
                  ℹ️ {check.instruction}
                </Typography>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          {check.type === 'action' && (
            <Button
              size="small"
              variant="outlined"
              onClick={createTestContact}
              disabled={loading || !!testContactId}
              startIcon={<Play size={16} />}
            >
              Create
            </Button>
          )}
          {check.type === 'link' && (
            <Tooltip title={`Open: ${check.url}?contactId=${testContactId || '[ID]'}`}>
              <IconButton
                size="small"
                onClick={() => window.open(`${check.url}?contactId=${testContactId}`, '_blank')}
                disabled={!testContactId}
              >
                <ExternalLink size={16} />
              </IconButton>
            </Tooltip>
          )}
          {check.type === 'manual' && (
            <Chip
              label="Manual"
              size="small"
              variant="outlined"
              onClick={() => setCheckResults(prev => ({
                ...prev,
                [check.id]: { success: true, message: 'Manually verified' }
              }))}
            />
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  // ===== RENDER =====
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* ===== HEADER ===== */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
          <Rocket size={40} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Workflow Pre-Flight Checklist
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Verify all workflow components are connected before live testing
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ===== ALERTS ===== */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* ===== TEST CONTACT SETUP ===== */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Database size={20} />
          Test Contact Setup
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact ID"
              placeholder="Enter existing contact ID or create new"
              value={testContactId}
              onChange={(e) => setTestContactId(e.target.value)}
              InputProps={{
                endAdornment: testContactId && (
                  <IconButton size="small" onClick={() => copyToClipboard(testContactId)}>
                    <Copy size={16} />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={createTestContact}
                disabled={loading || !!testContactId}
                startIcon={<User size={18} />}
              >
                Create Test Contact
              </Button>
              <Button
                variant="outlined"
                onClick={() => loadContact(testContactId)}
                disabled={loading || !testContactId}
                startIcon={<Eye size={18} />}
              >
                Load Contact
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setTestDataDialogOpen(true)}
                startIcon={<CreditCard size={18} />}
              >
                IDIQ Test Data
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* ===== CONTACT DATA PREVIEW ===== */}
        {contactData && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Contact Data:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} md={3}>
                <Chip
                  label={`Status: ${contactData.status || 'N/A'}`}
                  color={contactData.status === 'client' ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Chip
                  label={`Roles: ${contactData.roles?.join(', ') || 'N/A'}`}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Chip
                  label={`Contract: ${contactData.contractSigned ? '✅' : '❌'}`}
                  color={contactData.contractSigned ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Chip
                  label={`ACH: ${contactData.achAuthorized ? '✅' : '❌'}`}
                  color={contactData.achAuthorized ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* ===== WORKFLOW STAGES ===== */}
      {WORKFLOW_STAGES.map((stage, index) => {
        const StageIcon = stage.icon;
        const progress = calculateStageProgress(stage);
        
        return (
          <Accordion
            key={stage.id}
            expanded={expanded === stage.id}
            onChange={(e, isExpanded) => setExpanded(isExpanded ? stage.id : false)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <StageIcon size={24} color={progress === 100 ? '#4caf50' : '#9e9e9e'} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {stage.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stage.description}
                  </Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={progress === 100 ? 'success' : 'primary'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {stage.id === 'infrastructure' && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={runInfrastructureTests}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} /> : <Play size={18} />}
                  >
                    Run Infrastructure Tests
                  </Button>
                </Box>
              )}
              <List dense>
                {stage.checks.map(check => renderCheckItem(check, stage.id))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* ===== QUICK LINKS ===== */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon size={20} />
          Quick Links
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Firebase Console', url: 'https://console.firebase.google.com/project/my-clever-crm' },
            { label: 'Functions Logs', url: 'https://console.firebase.google.com/project/my-clever-crm/functions/logs' },
            { label: 'Firestore', url: 'https://console.firebase.google.com/project/my-clever-crm/firestore' },
            { label: 'IDIQ Stage Portal', url: 'https://gcpstage.identityiq.com/' },
            { label: 'Production CRM', url: 'https://myclevercrm.com' },
          ].map(link => (
            <Grid item key={link.label}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open(link.url, '_blank')}
                endIcon={<ExternalLink size={14} />}
              >
                {link.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ===== IDIQ TEST DATA DIALOG ===== */}
      <Dialog
        open={testDataDialogOpen}
        onClose={() => setTestDataDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard size={24} />
            IDIQ Stage Test Data
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Use this test data for IDIQ STAGE environment only. Do NOT use in production.
          </Alert>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>SSN</TableCell>
                  <TableCell>DOB</TableCell>
                  <TableCell>Card</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {IDIQ_TEST_DATA.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>
                      {data.street}, {data.city}, {data.state} {data.zip}
                    </TableCell>
                    <TableCell>{data.ssn}</TableCell>
                    <TableCell>{data.dob}</TableCell>
                    <TableCell>{data.cardNumber.slice(-4)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedTestData(data);
                          copyToClipboard(JSON.stringify(data, null, 2));
                        }}
                      >
                        Copy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {selectedTestData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Test Data:
              </Typography>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(selectedTestData, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDataDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ===== FOOTER ===== */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default WorkflowPreflightTest;