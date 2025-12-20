// ═══════════════════════════════════════════════════════════════════════════
// SPEEDYCRM - IDIQ SANDBOX TESTING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
// Path: /src/components/testing/IDIQSandboxTester.jsx
// Purpose: Test IDIQ enrollment integration with official test profiles
// 
// IDIQ Official Test Credentials (SANDBOX):
// - Partner ID: 1234
// - Partner Secret: 1ncDv2uKNDn3EKIM+ruRZZZ+3jI=
// - Offer Code: 4315004O
// - Plan Code: PLAN6X
// - Base URL: https://api-stage.identityiq.com/member-service
// - Dashboard: https://gcpstage.identityiq.com
//
// IMPORTANT: Uses IDIQ's recommended test profile (HOT CHILI) which passes KBA
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  AlertCircle,
  Shield,
  ExternalLink
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ OFFICIAL TEST PROFILES
// ═══════════════════════════════════════════════════════════════════════════
// Source: IDIQ Test Case CSV and Documentation
// These profiles are specifically designed to pass IDIQ's KBA questions
// ═══════════════════════════════════════════════════════════════════════════

const TEST_PROFILES = {
  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE 1: IDIQ's OFFICIAL RECOMMENDED TEST PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  // This is IDIQ's recommended test identity that passes KBA
  // ═══════════════════════════════════════════════════════════════════════════
  hotChili: {
    name: '🌶️ HOT CHILI (IDIQ Official - Passes KBA)',
    description: 'IDIQ official test profile - guaranteed to pass KBA questions',
    data: {
      firstName: 'HOT',
      lastName: 'CHILI',
      email: 'hot.chili@speedycreditrepair.com',
      birthDate: '01/01/1984', // MM/DD/YYYY format
      ssn: '666525461',
      street: '3325 ARMORY RD',
      city: 'CASTLE HAYNE',
      state: 'NC',
      zip: '28430'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE 2: CLEAN CREDIT PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  cleanCredit: {
    name: '✨ Clean Credit Profile',
    description: 'Standard test profile with clean credit history',
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith.test@speedycreditrepair.com',
      birthDate: '06/15/1985', // MM/DD/YYYY format
      ssn: '123456789',
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE 3: COMPLEX CREDIT PROFILE
  // ═══════════════════════════════════════════════════════════════════════════
  complexCredit: {
    name: '📊 Complex Credit Profile',
    description: 'Profile with multiple credit accounts and history',
    data: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson.test@speedycreditrepair.com',
      birthDate: '03/22/1978', // MM/DD/YYYY format
      ssn: '987654321',
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE 4: RECENT BANKRUPTCY
  // ═══════════════════════════════════════════════════════════════════════════
  bankruptcy: {
    name: '⚠️ Recent Bankruptcy Profile',
    description: 'Test profile with bankruptcy in credit history',
    data: {
      firstName: 'Michael',
      lastName: 'Williams',
      email: 'michael.williams.test@speedycreditrepair.com',
      birthDate: '11/08/1990', // MM/DD/YYYY format
      ssn: '555667788',
      street: '789 Elm Street',
      city: 'Chicago',
      state: 'IL',
      zip: '60601'
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE 5: YOUNG PROFILE (LIMITED HISTORY)
  // ═══════════════════════════════════════════════════════════════════════════
  youngProfile: {
    name: '🆕 Young Profile (Limited History)',
    description: 'Recently turned 18, limited credit history',
    data: {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis.test@speedycreditrepair.com',
      birthDate: '01/15/2006', // MM/DD/YYYY format
      ssn: '111223344',
      street: '321 Pine Road',
      city: 'Miami',
      state: 'FL',
      zip: '33101'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ SANDBOX TESTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const IDIQSandboxTester = () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const [selectedProfile, setSelectedProfile] = useState('hotChili');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGING HELPER
  // ═══════════════════════════════════════════════════════════════════════════

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      type, // 'info', 'success', 'error', 'warning'
      message
    };
    setLogs(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RUN ENROLLMENT TEST
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRunTest = async () => {
    setTesting(true);
    setResult(null);
    setError(null);
    setLogs([]);

    try {
      const profile = TEST_PROFILES[selectedProfile];
      addLog('info', `Selected profile: ${profile.name}`);

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 1: PREPARE CONTACT DATA
      // ═══════════════════════════════════════════════════════════════════════

      const contactData = {
        ...profile.data,
        contactId: `test_${Date.now()}`,
        source: 'sandbox_test',
        testProfile: true
      };

      addLog('info', 'Contact data prepared:');
      console.log('📋 Test Contact Data:', JSON.stringify(contactData, null, 2));

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 2: CALL CLOUD FUNCTION
      // ═══════════════════════════════════════════════════════════════════════

      addLog('info', 'Starting IDIQ enrollment...');
      addLog('info', 'Calling enrollIDIQ Cloud Function...');

      const enrollIDIQ = httpsCallable(functions, 'enrollIDIQ');
      
      const response = await enrollIDIQ({ contactData });

      // ═══════════════════════════════════════════════════════════════════════
      // STEP 3: PROCESS RESPONSE
      // ═══════════════════════════════════════════════════════════════════════

      if (response.data.success) {
        addLog('success', '✅ Enrollment completed successfully!');
        addLog('success', `Enrollment ID: ${response.data.enrollmentId}`);
        addLog('success', `Environment: ${response.data.environment}`);
        addLog('success', `Dashboard URL generated`);
        
        setResult(response.data);
      } else {
        throw new Error(response.data.message || 'Enrollment failed');
      }

    } catch (err) {
      console.error('Test execution error:', err);
      addLog('error', `❌ Error: ${err.message}`);
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR LOGS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleClearLogs = () => {
    setLogs([]);
    setResult(null);
    setError(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GET LOG ICON
  // ═══════════════════════════════════════════════════════════════════════════

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4caf50" />;
      case 'error':
        return <XCircle size={20} color="#f44336" />;
      case 'warning':
        return <AlertCircle size={20} color="#ff9800" />;
      default:
        return <Clock size={20} color="#2196f3" />;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ p: 3 }}>
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Shield size={32} />
          <Typography variant="h4" fontWeight="bold">
            IDIQ Sandbox Testing
          </Typography>
          <Chip 
            label="SANDBOX ONLY" 
            color="warning" 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Test IDIQ enrollment integration with official test profiles. 
          All enrollments use Partner ID 1234 (SANDBOX).
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: PROFILE SELECTION & TESTING */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Test Profile
              </Typography>

              {/* PROFILE SELECTOR */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Test Profile</InputLabel>
                <Select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  disabled={testing}
                  label="Test Profile"
                >
                  {Object.entries(TEST_PROFILES).map(([key, profile]) => (
                    <MenuItem key={key} value={key}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* SELECTED PROFILE INFO */}
              {selectedProfile && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {TEST_PROFILES[selectedProfile].description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <User size={16} />
                      <Typography variant="body2">
                        {TEST_PROFILES[selectedProfile].data.firstName} {TEST_PROFILES[selectedProfile].data.lastName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={16} />
                      <Typography variant="body2">
                        {TEST_PROFILES[selectedProfile].data.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} />
                      <Typography variant="body2">
                        DOB: {TEST_PROFILES[selectedProfile].data.birthDate}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={16} />
                      <Typography variant="body2">
                        {TEST_PROFILES[selectedProfile].data.street}, {TEST_PROFILES[selectedProfile].data.city}, {TEST_PROFILES[selectedProfile].data.state} {TEST_PROFILES[selectedProfile].data.zip}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard size={16} />
                      <Typography variant="body2">
                        SSN: ***-**-{TEST_PROFILES[selectedProfile].data.ssn.slice(-4)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* ACTION BUTTONS */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleRunTest}
                  disabled={testing}
                  startIcon={testing ? <CircularProgress size={20} /> : <PlayCircle />}
                  size="large"
                >
                  {testing ? 'Testing...' : 'Run Test'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleClearLogs}
                  disabled={testing}
                >
                  Clear
                </Button>
              </Box>

              {/* SUCCESS RESULT */}
              {result && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    ✅ Enrollment Successful!
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Enrollment ID: {result.enrollmentId}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Environment: {result.environment}
                  </Typography>
                  {result.dashboardUrl && (
                    <Button
                      size="small"
                      startIcon={<ExternalLink size={16} />}
                      onClick={() => window.open(result.dashboardUrl, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      Open Dashboard
                    </Button>
                  )}
                </Alert>
              )}

              {/* ERROR RESULT */}
              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    ❌ Enrollment Failed
                  </Typography>
                  <Typography variant="body2">
                    {error}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: EXECUTION LOGS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Execution Logs
              </Typography>

              {logs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Clock size={48} style={{ opacity: 0.3 }} />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    No logs yet. Run a test to see execution details.
                  </Typography>
                </Box>
              ) : (
                <Paper 
                  sx={{ 
                    p: 2, 
                    maxHeight: '500px', 
                    overflow: 'auto',
                    bgcolor: 'background.default'
                  }}
                >
                  <List dense>
                    {logs.map((log) => (
                      <ListItem key={log.id} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {getLogIcon(log.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" component="span">
                              <Typography 
                                component="span" 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ mr: 1 }}
                              >
                                [{log.timestamp}]
                              </Typography>
                              {log.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* IDIQ CONFIGURATION INFO */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <Card sx={{ mt: 3, bgcolor: 'info.main', color: 'info.contrastText' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            📋 IDIQ Sandbox Configuration
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Partner ID</Typography>
              <Typography variant="body2" fontWeight="bold">1234</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Offer Code</Typography>
              <Typography variant="body2" fontWeight="bold">4315004O</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Plan Code</Typography>
              <Typography variant="body2" fontWeight="bold">PLAN6X</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Environment</Typography>
              <Typography variant="body2" fontWeight="bold">SANDBOX</Typography>
            </Grid>
          </Grid>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
            Base URL: https://api-stage.identityiq.com/member-service
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
            Dashboard: https://gcpstage.identityiq.com
          </Typography>
        </CardContent>
      </Card>

      {/* COPYRIGHT */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', mt: 4, textAlign: 'center' }}
      >
        © 1995-{new Date().getFullYear()} Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
      </Typography>
    </Box>
  );
};

export default IDIQSandboxTester;

// ═══════════════════════════════════════════════════════════════════════════
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ═══════════════════════════════════════════════════════════════════════════