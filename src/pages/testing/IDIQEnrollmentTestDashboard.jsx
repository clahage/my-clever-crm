// =====================================================================================
// Path: /src/pages/testing/IDIQEnrollmentTestDashboard.jsx
// IDIQ Enrollment Testing & Diagnostics Dashboard
// Purpose: Comprehensive testing tool to diagnose IDIQ enrollment flow issues
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// =====================================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Play,
  RefreshCw,
  Copy,
  ChevronDown,
  Bug,
  Activity,
  Database,
  Zap,
  FileText,
  Search,
  Settings
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';

// =====================================================================================
// COMPONENT: IDIQEnrollmentTestDashboard
// =====================================================================================

const IDIQEnrollmentTestDashboard = () => {
  // ===== STATE MANAGEMENT =====
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [apiResponses, setApiResponses] = useState({});
  const [diagnostics, setDiagnostics] = useState({});

  // ===== TEST CONTACT DATA (Christopher's Test Contact) =====
  const testContactData = {
    contactId: '9gEcV4aJIQHeByvnmhct',
    firstName: 'Christopher',
    lastName: 'Lahage',
    email: 'Chris@speedycreditrepair.com',
    phone: '(714) 493-6666',
    ssn: '549292528',
    dateOfBirth: '1962-01-23',
    address: {
      street: '6891 Steeplechase Circle',
      city: 'Huntington Beach',
      state: 'CA',
      zip: '92648'
    }
  };

  // ===== TEST STEPS =====
  const testSteps = [
    {
      label: 'Load Contact Data',
      description: 'Verify contact exists in Firestore with all required fields',
      icon: Database,
      color: '#3b82f6'
    },
    {
      label: 'Check Existing Enrollment',
      description: 'Look for any existing IDIQ enrollments',
      icon: Search,
      color: '#8b5cf6'
    },
    {
      label: 'Partner Token Test',
      description: 'Call IDIQ API to get partner token',
      icon: Zap,
      color: '#10b981'
    },
    {
      label: 'Member Token Test',
      description: 'Try to get member token (may fail if not enrolled)',
      icon: Activity,
      color: '#f59e0b'
    },
    {
      label: 'Enrollment API Test',
      description: 'Call enrollment API to create/update membership',
      icon: FileText,
      color: '#06b6d4'
    },
    {
      label: 'Member Token Retry',
      description: 'Retry getting member token after enrollment',
      icon: RefreshCw,
      color: '#ec4899'
    },
    {
      label: 'Widget Fallback Test',
      description: 'Test if widget fallback response is triggered',
      icon: Settings,
      color: '#6366f1'
    }
  ];

  // =====================================================================================
  // EFFECT: Load Contacts on Mount
  // =====================================================================================

  useEffect(() => {
    loadContacts();
  }, []);

  // =====================================================================================
  // FUNCTION: Load Contacts from Firestore
  // =====================================================================================

  const loadContacts = async () => {
    try {
      addLog('info', 'Loading contacts from Firestore...');
      
      const contactsRef = collection(db, 'contacts');
      const q = query(
        contactsRef,
        where('roles', 'array-contains', 'lead'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const contactsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setContacts(contactsList);
      addLog('success', `Loaded ${contactsList.length} contacts`);
      
      // Auto-select Christopher's test contact if it exists
      const testContact = contactsList.find(c => c.id === testContactData.contactId);
      if (testContact) {
        setSelectedContact(testContact);
        addLog('success', `Auto-selected test contact: ${testContact.firstName} ${testContact.lastName}`);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      addLog('error', `Failed to load contacts: ${error.message}`);
    }
  };

  // =====================================================================================
  // FUNCTION: Add Log Entry
  // =====================================================================================

  const addLog = (type, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type, // success, error, info, warning
      message,
      data
    };
    
    console.log(`[${type.toUpperCase()}] ${message}`, data || '');
    setLogs(prev => [logEntry, ...prev]);
  };

  // =====================================================================================
  // FUNCTION: Run Individual Test Step
  // =====================================================================================

  const runTestStep = async (stepIndex) => {
    if (!selectedContact) {
      addLog('error', 'No contact selected for testing');
      return;
    }

    setLoading(true);
    setActiveStep(stepIndex);
    
    try {
      switch (stepIndex) {
        case 0:
          await testLoadContactData();
          break;
        case 1:
          await testCheckExistingEnrollment();
          break;
        case 2:
          await testPartnerToken();
          break;
        case 3:
          await testMemberToken();
          break;
        case 4:
          await testEnrollment();
          break;
        case 5:
          await testMemberTokenRetry();
          break;
        case 6:
          await testWidgetFallback();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Test step ${stepIndex} failed:`, error);
      addLog('error', `Step ${stepIndex} failed: ${error.message}`, error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================================
  // TEST STEP 1: Load Contact Data
  // =====================================================================================

  const testLoadContactData = async () => {
    addLog('info', 'Testing contact data retrieval...');
    
    try {
      const contactRef = doc(db, 'contacts', selectedContact.id);
      const contactSnap = await getDoc(contactRef);
      
      if (!contactSnap.exists()) {
        addLog('error', 'Contact not found in Firestore');
        updateTestResult(0, 'failed', 'Contact not found');
        return;
      }
      
      const contactData = contactSnap.data();
      addLog('success', 'Contact loaded successfully', contactData);
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'emails', 'ssn', 'dateOfBirth'];
      const missingFields = requiredFields.filter(field => !contactData[field]);
      
      if (missingFields.length > 0) {
        addLog('warning', `Missing required fields: ${missingFields.join(', ')}`, missingFields);
        updateTestResult(0, 'warning', `Missing fields: ${missingFields.join(', ')}`);
      } else {
        addLog('success', 'All required fields present');
        updateTestResult(0, 'passed', 'Contact data valid');
      }
      
      // Store for display
      setDiagnostics(prev => ({
        ...prev,
        contactData: contactData
      }));
      
    } catch (error) {
      addLog('error', 'Failed to load contact data', error);
      updateTestResult(0, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 2: Check Existing Enrollment
  // =====================================================================================

  const testCheckExistingEnrollment = async () => {
    addLog('info', 'Checking for existing IDIQ enrollments...');
    
    try {
      const enrollmentsRef = collection(db, 'idiqEnrollments');
      const q = query(
        enrollmentsRef,
        where('contactId', '==', selectedContact.id),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (enrollments.length === 0) {
        addLog('info', 'No existing enrollments found');
        updateTestResult(1, 'passed', 'No existing enrollments');
      } else {
        addLog('warning', `Found ${enrollments.length} existing enrollments`, enrollments);
        updateTestResult(1, 'warning', `${enrollments.length} existing enrollments found`);
      }
      
      setDiagnostics(prev => ({
        ...prev,
        existingEnrollments: enrollments
      }));
      
    } catch (error) {
      addLog('error', 'Failed to check enrollments', error);
      updateTestResult(1, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 3: Partner Token Test
  // =====================================================================================

  const testPartnerToken = async () => {
    addLog('info', 'Testing partner token retrieval...');
    
    try {
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService({
        action: 'getPartnerToken'
      });
      
      if (response.data.success && response.data.token) {
        addLog('success', 'Partner token obtained successfully', {
          tokenLength: response.data.token.length,
          expiresAt: response.data.expiresAt
        });
        updateTestResult(2, 'passed', 'Partner token obtained');
        
        setApiResponses(prev => ({
          ...prev,
          partnerToken: response.data
        }));
      } else {
        addLog('error', 'Failed to get partner token', response.data);
        updateTestResult(2, 'failed', 'No token received');
      }
      
    } catch (error) {
      addLog('error', 'Partner token API call failed', error);
      updateTestResult(2, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 4: Member Token Test (Before Enrollment)
  // =====================================================================================

  const testMemberToken = async () => {
    addLog('info', 'Testing member token retrieval (before enrollment)...');
    
    try {
      const email = selectedContact.emails?.[0]?.address || selectedContact.email;
      
      if (!email) {
        addLog('error', 'No email found for contact');
        updateTestResult(3, 'failed', 'No email available');
        return;
      }
      
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService({
        action: 'getMemberToken',
        email: email.toLowerCase() // Force lowercase
      });
      
      if (response.data.success && response.data.token) {
        addLog('success', 'Member token obtained (member already enrolled)', {
          tokenLength: response.data.token.length,
          email: email
        });
        updateTestResult(3, 'passed', 'Member already enrolled');
        
        setApiResponses(prev => ({
          ...prev,
          memberTokenBefore: response.data
        }));
      } else if (response.data.error && response.data.error.includes('404')) {
        addLog('info', 'Member not found (404) - this is expected for new enrollments', response.data);
        updateTestResult(3, 'info', 'Member not found (expected)');
        
        setApiResponses(prev => ({
          ...prev,
          memberTokenBefore: { status: 404, message: 'Member not found' }
        }));
      } else {
        addLog('warning', 'Unexpected member token response', response.data);
        updateTestResult(3, 'warning', 'Unexpected response');
      }
      
    } catch (error) {
      addLog('error', 'Member token API call failed', error);
      updateTestResult(3, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 5: Enrollment API Test
  // =====================================================================================

  const testEnrollment = async () => {
    addLog('info', 'Testing enrollment API call...');
    
    try {
      const email = selectedContact.emails?.[0]?.address || selectedContact.email;
      const phone = selectedContact.phones?.[0]?.number || selectedContact.phone;
      const address = selectedContact.addresses?.[0] || selectedContact.address;
      
      const enrollmentPayload = {
        action: 'enroll',
        contactId: selectedContact.id,
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        email: email?.toLowerCase(), // Force lowercase
        phone: phone,
        ssn: selectedContact.ssn,
        dateOfBirth: selectedContact.dateOfBirth,
        address: {
          street: address?.street || address?.address1 || '',
          city: address?.city || '',
          state: address?.state || '',
          zip: address?.zip || address?.zipCode || ''
        }
      };
      
      addLog('info', 'Sending enrollment request', enrollmentPayload);
      
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService(enrollmentPayload);
      
      addLog('info', 'Enrollment API response received', response.data);
      
      if (response.data.success) {
        addLog('success', 'Enrollment successful', {
          memberId: response.data.memberId,
          membershipId: response.data.membershipId
        });
        updateTestResult(4, 'passed', 'Enrollment successful');
        
        setApiResponses(prev => ({
          ...prev,
          enrollment: response.data
        }));
        
        setEnrollmentData(response.data);
      } else {
        addLog('error', 'Enrollment failed', response.data);
        updateTestResult(4, 'failed', response.data.error || 'Enrollment failed');
      }
      
    } catch (error) {
      addLog('error', 'Enrollment API call failed', error);
      updateTestResult(4, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 6: Member Token Retry (After Enrollment)
  // =====================================================================================

  const testMemberTokenRetry = async () => {
    addLog('info', 'Testing member token retrieval AFTER enrollment...');
    
    try {
      const email = selectedContact.emails?.[0]?.address || selectedContact.email;
      
      if (!email) {
        addLog('error', 'No email found for contact');
        updateTestResult(5, 'failed', 'No email available');
        return;
      }
      
      // Wait 2 seconds before retry (simulating propagation time)
      addLog('info', 'Waiting 2 seconds for IDIQ to propagate enrollment...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService({
        action: 'getMemberToken',
        email: email.toLowerCase() // Force lowercase
      });
      
      if (response.data.success && response.data.token) {
        addLog('success', 'Member token obtained after enrollment!', {
          tokenLength: response.data.token.length,
          email: email
        });
        updateTestResult(5, 'passed', 'Member token obtained');
        
        setApiResponses(prev => ({
          ...prev,
          memberTokenAfter: response.data
        }));
      } else if (response.data.error && response.data.error.includes('404')) {
        addLog('error', 'Member STILL not found after enrollment! This is the bug.', response.data);
        updateTestResult(5, 'failed', 'Member not found after enrollment (BUG)');
        
        setApiResponses(prev => ({
          ...prev,
          memberTokenAfter: { status: 404, message: 'Member not found (BUG!)' }
        }));
      } else {
        addLog('warning', 'Unexpected member token response', response.data);
        updateTestResult(5, 'warning', 'Unexpected response');
      }
      
    } catch (error) {
      addLog('error', 'Member token retry API call failed', error);
      updateTestResult(5, 'failed', error.message);
    }
  };

  // =====================================================================================
  // TEST STEP 7: Widget Fallback Test
  // =====================================================================================

  const testWidgetFallback = async () => {
    addLog('info', 'Testing widget fallback logic...');
    
    try {
      // This would test the pullReport action which should trigger widget fallback
      const email = selectedContact.emails?.[0]?.address || selectedContact.email;
      
      const idiqService = httpsCallable(functions, 'idiqService');
      const response = await idiqService({
        action: 'pullReport',
        contactId: selectedContact.id,
        email: email?.toLowerCase(),
        firstName: selectedContact.firstName,
        lastName: selectedContact.lastName,
        ssn: selectedContact.ssn,
        dateOfBirth: selectedContact.dateOfBirth
      });
      
      addLog('info', 'Pull report response received', response.data);
      
      if (response.data.useWidget === true) {
        addLog('success', 'Widget fallback triggered as expected!', response.data);
        updateTestResult(6, 'passed', 'Widget fallback working');
        
        setApiResponses(prev => ({
          ...prev,
          widgetFallback: response.data
        }));
      } else if (response.data.success) {
        addLog('info', 'Regular flow succeeded (no widget fallback needed)', response.data);
        updateTestResult(6, 'passed', 'Regular flow working');
      } else {
        addLog('error', 'Pull report failed without widget fallback', response.data);
        updateTestResult(6, 'failed', response.data.error || 'Failed');
      }
      
    } catch (error) {
      addLog('error', 'Widget fallback test failed', error);
      updateTestResult(6, 'failed', error.message);
    }
  };

  // =====================================================================================
  // FUNCTION: Update Test Result
  // =====================================================================================

  const updateTestResult = (stepIndex, status, message) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[stepIndex] = {
        step: testSteps[stepIndex].label,
        status, // passed, failed, warning, info
        message,
        timestamp: new Date().toISOString()
      };
      return newResults;
    });
  };

  // =====================================================================================
  // FUNCTION: Run All Tests
  // =====================================================================================

  const runAllTests = async () => {
    if (!selectedContact) {
      addLog('error', 'Please select a contact first');
      return;
    }
    
    addLog('info', '=== STARTING COMPLETE TEST SUITE ===');
    setTestResults([]);
    
    for (let i = 0; i < testSteps.length; i++) {
      await runTestStep(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    addLog('success', '=== TEST SUITE COMPLETE ===');
  };

  // =====================================================================================
  // FUNCTION: Copy Logs to Clipboard
  // =====================================================================================

  const copyLogsToClipboard = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}${log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logsText);
    addLog('success', 'Logs copied to clipboard');
  };

  // =====================================================================================
  // FUNCTION: Get Status Icon
  // =====================================================================================

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={20} color="#10b981" />;
      case 'failed':
        return <XCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'info':
        return <Clock size={20} color="#3b82f6" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  // =====================================================================================
  // FUNCTION: Get Status Color
  // =====================================================================================

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  // =====================================================================================
  // RENDER: Main Component
  // =====================================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Bug size={32} color="#3b82f6" />
          <Typography variant="h4" fontWeight="bold">
            IDIQ Enrollment Testing & Diagnostics
          </Typography>
        </Box>
        <Typography color="text.secondary">
          Comprehensive testing suite to diagnose IDIQ enrollment flow issues
        </Typography>
      </Box>

      {/* ===== CONTACT SELECTOR ===== */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            1. Select Test Contact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                select
                fullWidth
                label="Select Contact"
                value={selectedContact?.id || ''}
                onChange={(e) => {
                  const contact = contacts.find(c => c.id === e.target.value);
                  setSelectedContact(contact);
                  addLog('info', `Selected contact: ${contact?.firstName} ${contact?.lastName}`);
                }}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select a contact --</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} - {contact.emails?.[0]?.address || contact.email || 'No email'}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={loadContacts}
                startIcon={<RefreshCw size={16} />}
                sx={{ height: '56px' }}
              >
                Reload Contacts
              </Button>
            </Grid>
          </Grid>
          
          {selectedContact && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Selected Contact</AlertTitle>
              <strong>{selectedContact.firstName} {selectedContact.lastName}</strong>
              <br />
              Email: {selectedContact.emails?.[0]?.address || selectedContact.email || 'N/A'}
              <br />
              Phone: {selectedContact.phones?.[0]?.number || selectedContact.phone || 'N/A'}
              <br />
              SSN: {selectedContact.ssn ? '***-**-' + selectedContact.ssn.slice(-4) : 'N/A'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ===== QUICK ACTIONS ===== */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            2. Run Tests
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={runAllTests}
              disabled={!selectedContact || loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Play size={16} />}
              sx={{ bgcolor: '#3b82f6' }}
            >
              Run All Tests
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setTestResults([]);
                setLogs([]);
                setApiResponses({});
                setDiagnostics({});
                addLog('info', 'Dashboard reset');
              }}
              startIcon={<RefreshCw size={16} />}
            >
              Reset Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={copyLogsToClipboard}
              disabled={logs.length === 0}
              startIcon={<Copy size={16} />}
            >
              Copy Logs
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ===== TEST STEPS STEPPER ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                3. Test Steps
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {testSteps.map((step, index) => {
                  const result = testResults[index];
                  const StepIcon = step.icon;
                  
                  return (
                    <Step key={index} expanded>
                      <StepLabel
                        icon={<StepIcon size={20} color={step.color} />}
                        optional={
                          result && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              {getStatusIcon(result.status)}
                              <Typography variant="caption" color={getStatusColor(result.status)}>
                                {result.message}
                              </Typography>
                            </Box>
                          )
                        }
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => runTestStep(index)}
                          disabled={!selectedContact || loading}
                          startIcon={loading && activeStep === index ? <CircularProgress size={12} /> : <Play size={12} />}
                        >
                          Run This Step
                        </Button>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== TEST RESULTS & DIAGNOSTICS ===== */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                4. Test Results Summary
              </Typography>
              {testResults.length === 0 ? (
                <Alert severity="info">No tests run yet. Click "Run All Tests" to begin.</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Step</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result.step}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(result.status)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color={getStatusColor(result.status)}>
                              {result.message}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* ===== API RESPONSES ===== */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                5. API Responses
              </Typography>
              {Object.keys(apiResponses).length === 0 ? (
                <Alert severity="info">No API responses yet</Alert>
              ) : (
                Object.entries(apiResponses).map(([key, value]) => (
                  <Accordion key={key}>
                    <AccordionSummary expandIcon={<ChevronDown size={20} />}>
                      <Typography variant="body2" fontWeight="medium">
                        {key}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb' }}>
                        <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== LIVE LOGS ===== */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              6. Live Logs ({logs.length})
            </Typography>
            <Tooltip title="Copy logs to clipboard">
              <IconButton onClick={copyLogsToClipboard} size="small">
                <Copy size={16} />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Paper
            variant="outlined"
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              bgcolor: '#1e293b',
              color: '#e2e8f0',
              p: 2
            }}
          >
            {logs.length === 0 ? (
              <Typography color="inherit" variant="body2">
                No logs yet. Run tests to see live debugging output.
              </Typography>
            ) : (
              <List dense>
                {logs.map((log, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {log.type === 'success' && <CheckCircle size={16} color="#10b981" />}
                      {log.type === 'error' && <XCircle size={16} color="#ef4444" />}
                      {log.type === 'warning' && <AlertCircle size={16} color="#f59e0b" />}
                      {log.type === 'info' && <Activity size={16} color="#3b82f6" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="inherit" component="span">
                          [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                        </Typography>
                      }
                      secondary={
                        log.data && (
                          <Typography variant="caption" color="inherit" component="pre" sx={{ mt: 0.5, opacity: 0.7 }}>
                            {JSON.stringify(log.data, null, 2)}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* ===== FOOTER ===== */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
        </Typography>
      </Box>
    </Box>
  );
};

export default IDIQEnrollmentTestDashboard;