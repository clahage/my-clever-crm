// ============================================================================
// TestIDIQWorkflow.jsx - Test Page for IDIQ Enrollment Workflow
// ============================================================================
// Path: src/pages/TestIDIQWorkflow.jsx
//
// PURPOSE: Test the complete IDIQ enrollment workflow
// - Test contact creation
// - Test duplicate detection
// - Test AI recommendations
// - Test plan selection
//
// USAGE: Navigate to /test-idiq-workflow
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import { FileText, RefreshCw } from 'lucide-react';
import CompleteEnrollmentFlow from '@/components/idiq/CompleteEnrollmentFlow';

// ============================================================================
// SAMPLE TEST DATA
// ============================================================================
const SAMPLE_DATA = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '555-123-4567',
  street: '123 Main Street',
  street2: 'Apt 4B',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90210',
  ssn: '123-45-6789',
  dateOfBirth: '1980-01-01',
  employer: 'Acme Corporation',
  income: '75000',
};

const SAMPLE_CREDIT_REPORT = {
  equifaxScore: 650,
  experianScore: 645,
  transunionScore: 655,
  negativeItemsCount: 5,
  utilization: 85,
  accountsTotal: 12,
  accountsOpen: 8,
  accountsClosed: 4,
  delinquentAccounts: 3,
  publicRecords: 1,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const TestIDIQWorkflow = () => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════
  
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [testData, setTestData] = useState(SAMPLE_DATA);
  const [includeCreditReport, setIncludeCreditReport] = useState(true);
  const [workflowResult, setWorkflowResult] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handleStartWorkflow = () => {
    setShowWorkflow(true);
    setWorkflowResult(null);
  };

  const handleReset = () => {
    setShowWorkflow(false);
    setWorkflowResult(null);
  };

  const handleWorkflowComplete = (result) => {
    console.log('✅ Workflow Complete!', result);
    setWorkflowResult(result);
  };

  const handleFieldChange = (field, value) => {
    setTestData({
      ...testData,
      [field]: value,
    });
  };

  const randomizeEmail = () => {
    const random = Math.floor(Math.random() * 10000);
    setTestData({
      ...testData,
      email: `test${random}@example.com`,
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: FORM EDITOR
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderFormEditor = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FileText size={28} />
          <Typography variant="h5">
            IDIQ Workflow Test
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Testing Instructions:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Edit the test data below (or use defaults)
            <br />
            2. Click "Start Workflow" to test
            <br />
            3. First run: Creates new contact
            <br />
            4. Second run with same email: Shows duplicate dialog
            <br />
            5. Check Firestore "contacts" collection to verify data
          </Typography>
        </Alert>

        <Divider sx={{ mb: 3 }} />

        {/* Personal Information */}
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={testData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={testData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={testData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              helperText="Change this to test duplicate detection"
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={randomizeEmail}>
                    Randomize
                  </Button>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={testData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              value={testData.dateOfBirth}
              onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
              helperText="YYYY-MM-DD"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SSN"
              value={testData.ssn}
              onChange={(e) => handleFieldChange('ssn', e.target.value)}
              helperText="Full SSN (only last 4 will be stored)"
            />
          </Grid>
        </Grid>

        {/* Address */}
        <Typography variant="h6" gutterBottom>
          Address
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Street Address"
              value={testData.street}
              onChange={(e) => handleFieldChange('street', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Apt/Unit"
              value={testData.street2}
              onChange={(e) => handleFieldChange('street2', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="City"
              value={testData.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="State"
              value={testData.state}
              onChange={(e) => handleFieldChange('state', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={testData.zip}
              onChange={(e) => handleFieldChange('zip', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Employment */}
        <Typography variant="h6" gutterBottom>
          Employment (Optional)
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Employer"
              value={testData.employer}
              onChange={(e) => handleFieldChange('employer', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Annual Income"
              value={testData.income}
              onChange={(e) => handleFieldChange('income', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Credit Report Option */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant={includeCreditReport ? 'contained' : 'outlined'}
            onClick={() => setIncludeCreditReport(!includeCreditReport)}
          >
            {includeCreditReport ? '✓ Include Credit Report (Full Workflow)' : 'Include Credit Report'}
          </Button>
          {includeCreditReport && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Will test full workflow with AI recommendation
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleStartWorkflow}
            startIcon={<FileText size={20} />}
          >
            Start Workflow Test
          </Button>
        </Box>

        {/* Tips */}
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Test Scenarios:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>New Contact:</strong> Use unique email
            <br />
            • <strong>Duplicate Detection:</strong> Run twice with same email
            <br />
            • <strong>Phone Duplicate:</strong> Change email but keep same phone
            <br />
            • <strong>No Credit Report:</strong> Uncheck credit report option
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: WORKFLOW RESULT
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderResult = () => {
    if (!workflowResult) return null;

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ✅ Workflow Completed Successfully!
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Contact ID:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {workflowResult.contactId}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Contact Type:
              </Typography>
              <Chip 
                label={workflowResult.isNewContact ? 'New Contact' : 'Updated Existing'}
                color={workflowResult.isNewContact ? 'success' : 'info'}
                size="small"
              />
            </Grid>
            
            {workflowResult.selectedPlan && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Selected Plan:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {workflowResult.selectedPlan}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip label="Qualified" color="success" size="small" />
                </Grid>
              </>
            )}
            
            {workflowResult.creditReportId && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Credit Report ID:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {workflowResult.creditReportId}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Check Firebase Console → Firestore → "contacts" collection to see the saved data.
              The contact should have:
            </Typography>
            <Typography variant="body2" component="div">
              • All personal information
              <br />
              • Address details
              <br />
              • Only last 4 of SSN (6789)
              <br />
              • Email normalized to lowercase
              <br />
              • Phone formatted with +1
              <br />
              • Status: "qualified" (if plan selected)
            </Typography>
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={20} />}
              onClick={handleReset}
            >
              Test Again
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        IDIQ Enrollment Workflow - Test Page
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Test the complete enrollment workflow including contact creation, duplicate detection, and AI recommendations.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {!showWorkflow ? (
        <>
          {renderFormEditor()}
          {renderResult()}
        </>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mb: 3 }}
            startIcon={<RefreshCw size={20} />}
          >
            Back to Form
          </Button>

          <CompleteEnrollmentFlow
            enrollmentData={testData}
            creditReportData={includeCreditReport ? SAMPLE_CREDIT_REPORT : null}
            onComplete={handleWorkflowComplete}
          />
        </>
      )}
    </Container>
  );
};

export default TestIDIQWorkflow;