// Path: src/components/onboarding/PostSigningSetup.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * POST-SIGNING SETUP - IDIQ UPGRADE & DOCUMENT UPLOAD
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Shown AFTER contract signing to:
 * 1. Prompt paid IDIQ subscription (required for service)
 * 2. Encourage identity document upload (optional but recommended)
 * 
 * @version 1.0.0
 * @date February 2026
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Stack, Avatar, Chip, Alert, AlertTitle, Divider,
  List, ListItem, ListItemIcon, ListItemText, Stepper, Step,
  StepLabel, StepContent, LinearProgress, Collapse,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Shield, CreditCard, CheckCircle, Upload, FileText,
  ArrowRight, AlertTriangle, Lock, Sparkles, Eye,
  Phone, Mail, DollarSign, TrendingUp, Clock, Award,
  Heart, UserCheck, AlertCircle, X, ExternalLink,
  Car, Home, Briefcase, Gift, Zap
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// ═══════════════════════════════════════════════════════════════════════════
// IDIQ BENEFITS DATA
// ═══════════════════════════════════════════════════════════════════════════

const IDIQ_BENEFITS = [
  {
    icon: <Eye size={20} />,
    title: '3-Bureau Credit Monitoring',
    description: 'Real-time monitoring of all three credit bureaus'
  },
  {
    icon: <Shield size={20} />,
    title: '$25,000 Identity Theft Insurance',
    description: 'Coverage for out-of-pocket costs if you become a victim (upgradeable to $1,000,000)'
  },
  {
    icon: <AlertCircle size={20} />,
    title: 'Real-Time Alerts',
    description: 'Instant notifications for any changes to your credit'
  },
  {
    icon: <Lock size={20} />,
    title: 'Fraud Protection',
    description: 'Protection from unauthorized inquiries and identity theft attempts'
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Score Tracking',
    description: 'Watch your credit improve with detailed score history'
  },
  {
    icon: <FileText size={20} />,
    title: 'Unlimited Report Access',
    description: 'Pull your full credit reports anytime'
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPES = [
  {
    id: 'id',
    label: "Driver's License or State ID",
    description: 'Front and back of your government-issued ID',
    icon: <UserCheck size={20} />,
    required: false
  },
  {
    id: 'address',
    label: 'Proof of Address',
    description: 'Utility bill, bank statement, or lease agreement (within 60 days)',
    icon: <Home size={20} />,
    required: false
  },
  {
    id: 'ssn',
    label: 'Social Security Card',
    description: 'Copy of your Social Security card',
    icon: <Lock size={20} />,
    required: false
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// FILE DROPZONE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FileDropzone = ({ documentType, onUpload, uploadedFile }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(documentType.id, acceptedFiles[0]);
    }
  }, [documentType.id, onUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });
  
  return (
    <Card 
      variant="outlined"
      sx={{ 
        borderStyle: isDragActive ? 'dashed' : 'solid',
        borderColor: uploadedFile ? 'success.main' : isDragActive ? 'primary.main' : 'divider',
        bgcolor: uploadedFile ? 'success.50' : isDragActive ? 'primary.50' : 'transparent'
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: uploadedFile ? 'success.main' : 'grey.200' }}>
            {uploadedFile ? <CheckCircle size={20} /> : documentType.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {documentType.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {documentType.description}
            </Typography>
            
            {uploadedFile ? (
              <Chip 
                label={uploadedFile.name} 
                color="success" 
                size="small" 
                onDelete={() => onUpload(documentType.id, null)}
                sx={{ mt: 1 }}
              />
            ) : (
              <Box 
                {...getRootProps()} 
                sx={{ 
                  mt: 1, 
                  p: 2, 
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50'
                  }
                }}
              >
                <input {...getInputProps()} />
                <Upload size={24} style={{ opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PostSigningSetup = ({
  clientName = 'Client',
  selectedPlan = {},
  onIDIQSetupComplete,
  onDocumentsComplete,
  onSkipDocuments,
  onComplete
}) => {
  // ═════════════════════════════════════════════════════════════════════════
  // STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  const [activeStep, setActiveStep] = useState(0);
  const [idiqComplete, setIdiqComplete] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  
  // ═════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleIDIQSetup = () => {
    // This would redirect to IDIQ signup or open a modal
    window.open('https://member.identityiq.com/signup.aspx?offercode=431115TS', '_blank');
    // For demo, mark as complete after a moment
    setTimeout(() => {
      setIdiqComplete(true);
      setActiveStep(1);
      if (onIDIQSetupComplete) onIDIQSetupComplete();
    }, 1000);
  };
  
  const handleDocumentUpload = (docId, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [docId]: file
    }));
  };
  
  const handleDocumentsComplete = () => {
    if (onDocumentsComplete) onDocumentsComplete(uploadedDocuments);
    if (onComplete) onComplete();
  };
  
  const handleSkipDocuments = () => {
    if (onSkipDocuments) onSkipDocuments();
    if (onComplete) onComplete();
  };
  
  const uploadedCount = Object.values(uploadedDocuments).filter(Boolean).length;
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WELCOME HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <Paper sx={{ 
        p: 4, 
        mb: 3, 
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎉 Welcome to the Speedy Credit Repair Family, {clientName}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Your contract is signed. Let's complete your setup!
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={activeStep === 0 ? 50 : 100}
          sx={{ 
            mt: 3, 
            height: 8, 
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'white'
            }
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          Step {activeStep + 1} of 2: {activeStep === 0 ? 'Credit Monitoring Setup' : 'Document Upload'}
        </Typography>
      </Paper>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STEPPER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 1: IDIQ SUBSCRIPTION */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        
        <Step>
          <StepLabel
            StepIconProps={{
              icon: idiqComplete ? <CheckCircle size={24} /> : <CreditCard size={24} />
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Required: Credit Monitoring Setup
            </Typography>
          </StepLabel>
          <StepContent>
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              {/* Explanation */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Why is this required?</AlertTitle>
                <Typography variant="body2">
                  To effectively work on your credit, we need <strong>ongoing access to your credit reports</strong>. 
                  This IdentityIQ subscription allows Speedy Credit Repair to work on <strong>auto-pilot</strong> - 
                  you can simply watch your credit improve without needing to send us every email or update!
                </Typography>
              </Alert>
              
              {/* Pricing Card */}
              <Card sx={{ bgcolor: 'primary.50', mb: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        IdentityIQ Credit Monitoring
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partner Discount Rate
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        $21.86
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        per month
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    <strong>Note:</strong> This is separate from your {selectedPlan.name || 'service plan'} fee 
                    and is required during your service period. You may cancel anytime after service completion, 
                    or continue at our partner discount rate to keep monitoring your credit, benefit from 
                    identity theft protection, and watch your progress!
                  </Typography>
                </CardContent>
              </Card>
              
              {/* Benefits Grid */}
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                What's Included:
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {IDIQ_BENEFITS.map((benefit, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                        {benefit.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {benefit.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              
              {/* Save Money Alert */}
              <Alert 
                severity="success" 
                icon={<DollarSign size={20} />}
                sx={{ mb: 3 }}
                action={
                  <Button 
                    size="small" 
                    color="inherit"
                    onClick={() => setShowComparisonDialog(true)}
                  >
                    Compare
                  </Button>
                }
              >
                <AlertTitle>Save Money - Drop Other Services!</AlertTitle>
                <Typography variant="body2">
                  Already paying for LifeLock, Experian, or other monitoring services? 
                  IdentityIQ covers all these features at a <strong>lower price</strong> in one membership!
                </Typography>
              </Alert>
              
              {/* Action Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleIDIQSetup}
                endIcon={<ExternalLink size={20} />}
                disabled={idiqComplete}
              >
                {idiqComplete ? '✓ Setup Complete' : 'Set Up Credit Monitoring - $21.86/mo'}
              </Button>
            </Paper>
          </StepContent>
        </Step>
        
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* STEP 2: DOCUMENT UPLOAD */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        
        <Step>
          <StepLabel>
            <Typography variant="subtitle1" fontWeight="bold">
              Optional (Strongly Recommended): Upload Identity Documents
            </Typography>
          </StepLabel>
          <StepContent>
            <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
              {/* Explanation */}
              <Alert severity="warning" icon={<Zap size={20} />} sx={{ mb: 3 }}>
                <AlertTitle>Speed Up Your Results!</AlertTitle>
                <Typography variant="body2">
                  The credit bureaus <strong>often request proof of identity</strong> as a stalling tactic 
                  to slow down the dispute process. Having these documents ready can <strong>save 2-4 weeks</strong> 
                  and significantly improve the effectiveness of your results!
                </Typography>
              </Alert>
              
              {/* Document Upload Cards */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                {DOCUMENT_TYPES.map(docType => (
                  <FileDropzone
                    key={docType.id}
                    documentType={docType}
                    onUpload={handleDocumentUpload}
                    uploadedFile={uploadedDocuments[docType.id]}
                  />
                ))}
              </Stack>
              
              {/* Progress */}
              {uploadedCount > 0 && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {uploadedCount} of {DOCUMENT_TYPES.length} documents uploaded
                </Alert>
              )}
              
              {/* No Documents Notice */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Don't have these documents handy?</AlertTitle>
                <Typography variant="body2">
                  No problem! You can skip this step and upload them later. We'll send you 
                  a reminder if the bureaus request verification.
                </Typography>
              </Alert>
              
              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleSkipDocuments}
                >
                  I'll Do This Later
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDocumentsComplete}
                  endIcon={<ArrowRight size={20} />}
                  disabled={uploadedCount === 0}
                >
                  Continue ({uploadedCount} uploaded)
                </Button>
              </Stack>
            </Paper>
          </StepContent>
        </Step>
      </Stepper>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMPARISON DIALOG */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <Dialog 
        open={showComparisonDialog} 
        onClose={() => setShowComparisonDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Why Switch to IdentityIQ?</Typography>
            <IconButton onClick={() => setShowComparisonDialog(false)}>
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compare monthly costs for similar protection:
          </Typography>
          
          <Stack spacing={2}>
            {[
              { name: 'LifeLock Standard', price: '$11.99/mo', features: 'Basic monitoring, $25k insurance' },
              { name: 'LifeLock Ultimate Plus', price: '$34.99/mo', features: 'Full monitoring, $1M insurance' },
              { name: 'Experian IdentityWorks', price: '$24.99/mo', features: '3-bureau monitoring' },
              { name: 'myFICO Ultimate', price: '$39.99/mo', features: '3-bureau + FICO scores' },
            ].map((service, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">{service.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.features}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="error.main">
                      {service.price}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            
            <Card sx={{ bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      IdentityIQ (Our Partner)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      3-bureau, $25k insurance (upgradeable), SCR dashboard access
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    $21.86/mo
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
          
          <Alert severity="success" sx={{ mt: 3 }}>
            <strong>Consolidate and save!</strong> Cancel your other monitoring services 
            and use IdentityIQ for everything at one low price.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparisonDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostSigningSetup;