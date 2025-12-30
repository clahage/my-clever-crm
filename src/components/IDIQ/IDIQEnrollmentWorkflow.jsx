// ============================================================================
// IDIQEnrollmentWorkflow.jsx - Complete Enrollment to Service Plan Flow
// ============================================================================
// Path: src/components/idiq/IDIQEnrollmentWorkflow.jsx
//
// PURPOSE: Orchestrates the complete IDIQ enrollment workflow
// 1. Accepts enrollment form data
// 2. Processes contact (create/update with duplicate detection)
// 3. Stores IDIQ enrollment record
// 4. Retrieves/stores credit report
// 5. AI analysis and service plan recommendation
// 6. Plan selection
//
// USES: idiqContactManager.js for all contact operations
//
// © 1995-2025 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { 
  CheckCircle, 
  AlertCircle, 
  UserPlus, 
  FileText, 
  TrendingUp,
  Users,
} from 'lucide-react';

// Import our contact manager
import { 
  processEnrollment,
  checkForDuplicates 
} from '@/services/idiqContactManager';

// Firebase
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

// ============================================================================
// WORKFLOW STEPS
// ============================================================================
const STEPS = [
  'Contact Processing',
  'IDIQ Enrollment',
  'Credit Report',
  'AI Analysis',
  'Plan Selection',
];

// ============================================================================
// SERVICE PLANS
// ============================================================================
const SERVICE_PLANS = {
  'Starter': {
    price: 39,
    name: 'DIY Starter',
    description: 'Perfect for good credit (670+) needing minor improvements',
    color: '#10b981',
    features: [
      'Self-guided credit repair tools',
      'Educational resources and guides',
      'Monthly credit monitoring',
      'Dispute letter templates',
      'Online support portal',
    ],
  },
  'Professional': {
    price: 149,
    name: 'Professional',
    description: 'Ideal for fair credit (580-669) needing expert assistance',
    color: '#3b82f6',
    features: [
      'Expert credit analysis',
      'Personalized dispute strategy',
      'Direct bureau communication',
      'Monthly progress reports',
      'Credit building guidance',
      'Dedicated support team',
    ],
  },
  'VIP': {
    price: 249,
    name: 'VIP Fast Track',
    description: 'Best for poor credit (<580) requiring aggressive repair',
    color: '#8b5cf6',
    features: [
      'Dedicated credit specialist',
      'Aggressive dispute strategy',
      'Priority bureau processing',
      'Bi-weekly status updates',
      'Credit builder loans assistance',
      'Goodwill letter campaigns',
      'Fastest results guaranteed',
    ],
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const IDIQEnrollmentWorkflow = ({ 
  enrollmentData, 
  creditReportData = null,
  onComplete 
}) => {
  // ══════════════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════════════
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Contact data
  const [contactId, setContactId] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [isNewContact, setIsNewContact] = useState(true);
  
  // Duplicate handling
  const [duplicateFound, setDuplicateFound] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  // IDIQ data
  const [idiqEnrollmentId, setIdiqEnrollmentId] = useState(null);
  const [creditReportId, setCreditReportId] = useState(null);
  
  // AI recommendation
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // ══════════════════════════════════════════════════════════════════════
  // AUTO-START WORKFLOW
  // ══════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    if (enrollmentData) {
      startWorkflow();
    }
  }, [enrollmentData]);

  // ══════════════════════════════════════════════════════════════════════
  // MAIN WORKFLOW
  // ══════════════════════════════════════════════════════════════════════
  
  const startWorkflow = async () => {
    setLoading(true);
    setError(null);
    setActiveStep(0);
    
    try {
      // ────────────────────────────────────────────────────────────────
      // STEP 1: Process Contact (Create or Update)
      // ────────────────────────────────────────────────────────────────
      console.log('🚀 Step 1: Processing contact...');
      
      const result = await processEnrollment(enrollmentData, {
        forceCreate: false, // Will check for duplicates first
      });
      
      if (!result.success) {
        if (result.isDuplicate) {
          // Duplicate found - show dialog for user decision
          console.log('⚠️ Duplicate contact found');
          setDuplicateFound(true);
          setDuplicateInfo(result.duplicateCheck);
          setShowDuplicateDialog(true);
          setLoading(false);
          return; // Wait for user decision
        } else {
          throw new Error(result.error || result.message);
        }
      }
      
      // Contact created/updated successfully
      setContactId(result.contactId);
      setContactData(result.parsedData);
      setIsNewContact(result.isNew);
      
      console.log('✅ Contact processed:', result.contactId);
      
      // ────────────────────────────────────────────────────────────────
      // STEP 2: Store IDIQ Enrollment Record
      // ────────────────────────────────────────────────────────────────
      setActiveStep(1);
      console.log('📋 Step 2: Storing IDIQ enrollment...');
      
      const enrollmentRef = await addDoc(collection(db, 'idiqEnrollments'), {
        contactId: result.contactId,
        email: result.parsedData.email,
        firstName: result.parsedData.firstName,
        lastName: result.parsedData.lastName,
        dateOfBirth: result.parsedData.dateOfBirth,
        phone: result.parsedData.phone,
        address: {
          street: result.parsedData.street,
          street2: result.parsedData.street2,
          city: result.parsedData.city,
          state: result.parsedData.state,
          zip: result.parsedData.zip,
        },
        status: 'enrolled',
        enrolledAt: serverTimestamp(),
        source: 'website_enrollment',
      });
      
      setIdiqEnrollmentId(enrollmentRef.id);
      console.log('✅ IDIQ enrollment stored:', enrollmentRef.id);
      
      // ────────────────────────────────────────────────────────────────
      // STEP 3: Store Credit Report (if available)
      // ────────────────────────────────────────────────────────────────
      if (creditReportData) {
        setActiveStep(2);
        console.log('📊 Step 3: Storing credit report...');
        
        const reportResult = await storeCreditReport(
          result.contactId,
          result.parsedData.email,
          creditReportData
        );
        
        setCreditReportId(reportResult.reportId);
        console.log('✅ Credit report stored:', reportResult.reportId);
        
        // ────────────────────────────────────────────────────────────────
        // STEP 4: AI Analysis & Recommendation
        // ────────────────────────────────────────────────────────────────
        setActiveStep(3);
        console.log('🤖 Step 4: Running AI analysis...');
        
        const recommendation = await getAIRecommendation(
          creditReportData,
          result.contactId
        );
        
        setAiRecommendation(recommendation);
        console.log('✅ AI recommendation:', recommendation.plan);
        
        // ────────────────────────────────────────────────────────────────
        // STEP 5: Show Plan Selection
        // ────────────────────────────────────────────────────────────────
        setActiveStep(4);
        
      } else {
        // No credit report yet - workflow paused
        console.log('⏸️ No credit report available - workflow paused');
        setActiveStep(2);
      }
      
    } catch (err) {
      console.error('❌ Workflow error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // DUPLICATE DECISION HANDLER
  // ══════════════════════════════════════════════════════════════════════
  
  const handleDuplicateDecision = async (updateExisting) => {
    setShowDuplicateDialog(false);
    setLoading(true);
    
    try {
      let result;
      
      if (updateExisting) {
        // Update the existing contact
        const existingId = duplicateInfo.matches[0].id;
        console.log('📝 Updating existing contact:', existingId);
        
        result = await processEnrollment(enrollmentData, {
          updateExisting: true,
        });
        
      } else {
        // Force create new contact despite duplicate
        console.log('📝 Creating new contact (forced)');
        
        result = await processEnrollment(enrollmentData, {
          forceCreate: true,
        });
      }
      
      if (!result.success) {
        throw new Error(result.error || result.message);
      }
      
      setContactId(result.contactId);
      setContactData(result.parsedData);
      setIsNewContact(result.isNew);
      
      // Continue workflow from Step 2
      await continueWorkflowFromStep2(result);
      
    } catch (err) {
      console.error('❌ Duplicate handling error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // CONTINUE WORKFLOW FROM STEP 2
  // ══════════════════════════════════════════════════════════════════════
  
  const continueWorkflowFromStep2 = async (contactResult) => {
    try {
      setActiveStep(1);
      
      // Store IDIQ enrollment
      const enrollmentRef = await addDoc(collection(db, 'idiqEnrollments'), {
        contactId: contactResult.contactId,
        email: contactResult.parsedData.email,
        firstName: contactResult.parsedData.firstName,
        lastName: contactResult.parsedData.lastName,
        dateOfBirth: contactResult.parsedData.dateOfBirth,
        phone: contactResult.parsedData.phone,
        address: {
          street: contactResult.parsedData.street,
          city: contactResult.parsedData.city,
          state: contactResult.parsedData.state,
          zip: contactResult.parsedData.zip,
        },
        status: 'enrolled',
        enrolledAt: serverTimestamp(),
        source: 'website_enrollment',
      });
      
      setIdiqEnrollmentId(enrollmentRef.id);
      
      // If credit report available, continue
      if (creditReportData) {
        setActiveStep(2);
        
        const reportResult = await storeCreditReport(
          contactResult.contactId,
          contactResult.parsedData.email,
          creditReportData
        );
        
        setCreditReportId(reportResult.reportId);
        
        setActiveStep(3);
        
        const recommendation = await getAIRecommendation(
          creditReportData,
          contactResult.contactId
        );
        
        setAiRecommendation(recommendation);
        setActiveStep(4);
      }
      
    } catch (err) {
      throw err;
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // STORE CREDIT REPORT
  // ══════════════════════════════════════════════════════════════════════
  
  const storeCreditReport = async (contactId, email, reportData) => {
    try {
      const idiqService = httpsCallable(functions, 'idiqService');
      
      const result = await idiqService({
        action: 'storeReport',
        email: email,
        contactId: contactId,
        reportData: reportData,
      });
      
      if (!result.data.success) {
        throw new Error(result.data.error || 'Failed to store credit report');
      }
      
      return {
        reportId: result.data.reportId,
      };
      
    } catch (error) {
      console.error('❌ Credit report storage error:', error);
      throw new Error('Failed to store credit report');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // GET AI RECOMMENDATION
  // ══════════════════════════════════════════════════════════════════════
  
  const getAIRecommendation = async (reportData, contactId) => {
    try {
      // Extract scores
      const scores = {
        equifax: reportData.equifaxScore || 0,
        experian: reportData.experianScore || 0,
        transunion: reportData.transunionScore || 0,
      };
      
      const averageScore = Math.round(
        (scores.equifax + scores.experian + scores.transunion) / 3
      );
      
      const negativeItems = reportData.negativeItemsCount || 0;
      const utilization = reportData.utilization || 0;
      
      // Call AI Cloud Function
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
      
      const result = await aiContentGenerator({
        type: 'recommendServicePlan',
        creditScore: averageScore,
        negativeItems: negativeItems,
        utilization: utilization,
        contactId: contactId,
      });
      
      if (!result.data.success) {
        throw new Error(result.data.error || 'AI analysis failed');
      }
      
      const recommendation = JSON.parse(result.data.content);
      
      return {
        scores: scores,
        averageScore: averageScore,
        negativeItems: negativeItems,
        utilization: utilization,
        plan: recommendation.plan,
        confidence: recommendation.confidence,
        reason: recommendation.reason,
        expectedResults: recommendation.expectedResults,
      };
      
    } catch (error) {
      console.error('❌ AI recommendation error:', error);
      throw new Error('Failed to get AI recommendation');
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // HANDLE PLAN SELECTION
  // ══════════════════════════════════════════════════════════════════════
  
  const handlePlanSelection = async (planName) => {
    try {
      setLoading(true);
      
      // Update contact with selected plan
      await updateDoc(doc(db, 'contacts', contactId), {
        selectedPlan: planName,
        selectedPlanAt: serverTimestamp(),
        status: 'qualified', // Upgrade from prospect to qualified
      });
      
      setSelectedPlan(planName);
      
      console.log('✅ Plan selected:', planName);
      
      // Trigger completion callback
      if (onComplete) {
        onComplete({
          contactId,
          isNewContact,
          selectedPlan: planName,
          creditReportId,
          idiqEnrollmentId,
          aiRecommendation,
        });
      }
      
    } catch (err) {
      console.error('❌ Plan selection error:', err);
      setError('Failed to save plan selection');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: DUPLICATE DIALOG
  // ══════════════════════════════════════════════════════════════════════
  
  const renderDuplicateDialog = () => {
    if (!duplicateInfo || duplicateInfo.matches.length === 0) return null;
    
    const match = duplicateInfo.matches[0];
    
    return (
      <Dialog open={showDuplicateDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertCircle size={24} color="#f59e0b" />
            <Typography variant="h6">
              Existing Contact Found
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            We found an existing contact with matching{' '}
            <strong>{duplicateInfo.matchType}</strong> (confidence: {duplicateInfo.confidence})
          </Alert>
          
          <Grid container spacing={3}>
            {/* Existing Contact */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Existing Contact
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  <strong>Name:</strong> {match.firstName} {match.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {match.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {match.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {match.status}
                </Typography>
                {match.idiq?.enrolled && (
                  <Chip 
                    label="Previously Enrolled" 
                    size="small" 
                    color="info"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </Grid>
            
            {/* New Submission */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" color="secondary" gutterBottom>
                  New Submission
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  <strong>Name:</strong> {enrollmentData.firstName} {enrollmentData.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {enrollmentData.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {enrollmentData.phone}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => handleDuplicateDecision(false)}
            variant="outlined"
          >
            Create New Contact Anyway
          </Button>
          <Button 
            onClick={() => handleDuplicateDecision(true)}
            variant="contained"
          >
            Update Existing Contact
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: AI RECOMMENDATION
  // ══════════════════════════════════════════════════════════════════════
  
  const renderRecommendation = () => {
    if (!aiRecommendation) return null;
    
    const recommendedPlan = SERVICE_PLANS[aiRecommendation.plan];
    if (!recommendedPlan) return null;
    
    return (
      <Box>
        {/* Credit Scores */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Credit Score Analysis
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary">
                    Equifax
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {aiRecommendation.scores.equifax}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary">
                    Experian
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {aiRecommendation.scores.experian}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="caption" color="text.secondary">
                    TransUnion
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {aiRecommendation.scores.transunion}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Average Score
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {aiRecommendation.averageScore}
              </Typography>
            </Box>
            
            <Alert severity="info">
              {aiRecommendation.reason}
            </Alert>
          </CardContent>
        </Card>

        {/* Recommended Plan */}
        <Card 
          sx={{ 
            mb: 3,
            border: 3,
            borderColor: recommendedPlan.color,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label="AI Recommended" 
                color="primary"
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp size={28} color={recommendedPlan.color} />
              <Typography variant="h4" fontWeight="bold">
                {recommendedPlan.name}
              </Typography>
              <Typography variant="h3" color="primary" sx={{ ml: 'auto' }}>
                ${recommendedPlan.price}
                <Typography component="span" variant="body1" color="text.secondary">
                  /month
                </Typography>
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {recommendedPlan.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              What You Get:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              {recommendedPlan.features.map((feature, i) => (
                <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5 }}>
                  {feature}
                </Typography>
              ))}
            </Box>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>Expected Results:</strong> {aiRecommendation.expectedResults}
            </Alert>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handlePlanSelection(aiRecommendation.plan)}
              sx={{ bgcolor: recommendedPlan.color }}
            >
              Select {recommendedPlan.name}
            </Button>
          </CardContent>
        </Card>

        {/* Alternative Plans */}
        <Typography variant="h6" gutterBottom>
          Or Choose a Different Plan:
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(SERVICE_PLANS)
            .filter(([name]) => name !== aiRecommendation.plan)
            .map(([name, plan]) => (
              <Grid item xs={12} sm={6} key={name}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${plan.price}/mo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {plan.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handlePlanSelection(name)}
                    >
                      Select This Plan
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════
  
  return (
    <Box>
      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={56} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Processing Your Application
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeStep === 0 && 'Verifying contact information...'}
                {activeStep === 1 && 'Enrolling with credit bureau...'}
                {activeStep === 2 && 'Retrieving your credit report...'}
                {activeStep === 3 && 'Analyzing your credit profile...'}
                {activeStep === 4 && 'Preparing recommendations...'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Success: Show Recommendation */}
      {!loading && activeStep === 4 && !selectedPlan && renderRecommendation()}

      {/* Plan Selected - Confirmation */}
      {selectedPlan && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle size={64} color="#10b981" style={{ marginBottom: 16 }} />
              <Typography variant="h5" gutterBottom>
                Enrollment Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You've selected the <strong>{SERVICE_PLANS[selectedPlan].name}</strong> plan.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our team will contact you shortly to complete the process.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Dialog */}
      {renderDuplicateDialog()}
    </Box>
  );
};

export default IDIQEnrollmentWorkflow;