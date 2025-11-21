// Path: /src/components/IDIQAutoEnrollment.jsx
// ═══════════════════════════════════════════════════════════════════════════
// IDIQ AUTO-ENROLLMENT SYSTEM - MEGA ULTIMATE EDITION
// ═══════════════════════════════════════════════════════════════════════════
// Complete automated credit monitoring enrollment with Partner ID 11981
// Maximum AI integration, real-time validation, progress tracking

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Stepper, Step,
  StepLabel, StepContent, Alert, CircularProgress, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardContent,
  CardActions, Grid, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Checkbox, Radio, RadioGroup, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Badge, Divider, List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction, Switch, Tabs, Tab, AccordionSummary,
  AccordionDetails, Accordion, Avatar, Stack, InputAdornment,
  Collapse, Snackbar, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CreditCard, Shield, ShieldCheck, ShieldOff, AlertCircle, CheckCircle,
  XCircle, RefreshCw, Send, Lock, Unlock, Eye, EyeOff, User,
  Mail, Phone, Home, Calendar, DollarSign, FileText, Download,
  Upload, Zap, TrendingUp, Activity, BarChart3, PieChart, Target,
  Award, Clock, Info, HelpCircle, Settings, Save, Edit, Trash2,
  Copy, Share2, ExternalLink, ChevronRight, ChevronDown, Plus,
  Minus, Search, Filter, Database, Cpu, Wifi, WifiOff, Globe,
  Key, UserCheck, AlertTriangle, CheckSquare, Square, Circle,
  ArrowRight, ArrowLeft, MoreVertical, Loader, Star, Heart
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import {
  collection, doc, setDoc, updateDoc, getDoc, getDocs, query,
  where, orderBy, limit, serverTimestamp, onSnapshot, addDoc
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';

const functions = getFunctions();

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PARTNER_ID = '11981';
const IDIQ_API_ENDPOINT = process.env.VITE_IDIQ_API_URL || 'https://api.idiq.com';

const ENROLLMENT_TYPES = {
  TRIAL: {
    id: 'trial',
    name: 'Free 7-Day Trial',
    price: 0,
    duration: 7,
    features: ['3-bureau reports', 'Basic monitoring', 'Email alerts'],
    icon: Shield,
    color: '#4CAF50'
  },
  BASIC: {
    id: 'basic',
    name: 'Basic Monitoring',
    price: 19.95,
    duration: 30,
    features: ['Monthly reports', '24/7 monitoring', 'Email/SMS alerts', 'Score tracking'],
    icon: ShieldCheck,
    color: '#2196F3'
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Protection',
    price: 29.95,
    duration: 30,
    features: ['Weekly reports', 'Real-time alerts', 'Identity protection', 'Credit lock', 'Dark web monitoring'],
    icon: ShieldCheck,
    color: '#9C27B0'
  }
};

const VALIDATION_RULES = {
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  phone: /^\d{10}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  zip: /^\d{5}(-\d{4})?$/
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function IDIQAutoEnrollment({ 
  contactId, 
  contactData = {}, 
  onComplete,
  autoEnroll = false,
  enrollmentType = 'TRIAL'
}) {
  // ===== STATE MANAGEMENT =====
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    // Personal Information
    firstName: contactData.firstName || '',
    lastName: contactData.lastName || '',
    middleInitial: contactData.middleInitial || '',
    suffix: contactData.suffix || '',
    dateOfBirth: contactData.dateOfBirth || null,
    ssn: '',
    ssnLast4: contactData.ssnLast4 || '',
    
    // Contact Information
    email: contactData.email || '',
    phone: contactData.phone || '',
    alternatePhone: contactData.alternatePhone || '',
    
    // Address Information
    address1: contactData.address1 || '',
    address2: contactData.address2 || '',
    city: contactData.city || '',
    state: contactData.state || '',
    zipCode: contactData.zipCode || '',
    
    // IDIQ Specific
    memberId: '',
    username: '',
    password: '',
    secretWord: '',
    secretQuestion: '',
    secretAnswer: '',
    
    // Enrollment Settings
    enrollmentType: enrollmentType,
    autoRenew: true,
    consentToMonitor: false,
    agreeToTerms: false,
    marketingOptIn: false,
    
    // Payment Information (if not trial)
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    billingZip: '',
    achRouting: '',
    achAccount: '',
    
    // Metadata
    partnerId: PARTNER_ID,
    leadScore: contactData.leadScore || 0,
    enrollmentSource: 'auto_workflow',
    enrollmentDate: null,
    lastReportPull: null,
    monitoringActive: false
  });

  const [validation, setValidation] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [existingEnrollment, setExistingEnrollment] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [monitoringStatus, setMonitoringStatus] = useState('inactive');
  const [tabValue, setTabValue] = useState(0);

  // ===== ENROLLMENT STEPS =====
  const steps = [
    'Verify Identity',
    'Choose Plan',
    'Account Setup',
    'Payment (if applicable)',
    'Review & Consent',
    'Complete Enrollment'
  ];

  // ===== EFFECTS =====
  useEffect(() => {
    if (contactId) {
      checkExistingEnrollment();
      loadRecentReports();
    }
    if (autoEnroll && contactData.leadScore >= 6) {
      startAutoEnrollment();
    }
  }, [contactId, autoEnroll]);

  useEffect(() => {
    // Get AI recommendation based on lead score
    if (contactData.leadScore) {
      getAIRecommendation();
    }
  }, [contactData.leadScore]);

  // ===== CHECK EXISTING ENROLLMENT =====
  const checkExistingEnrollment = async () => {
    try {
      const enrollmentDoc = await getDoc(
        doc(db, 'idiqEnrollments', contactId)
      );
      
      if (enrollmentDoc.exists()) {
        const data = enrollmentDoc.data();
        setExistingEnrollment(data);
        setMonitoringStatus(data.monitoringActive ? 'active' : 'expired');
        
        // Pre-fill form with existing data
        setEnrollmentData(prev => ({
          ...prev,
          memberId: data.memberId || '',
          username: data.username || '',
          enrollmentDate: data.enrollmentDate,
          lastReportPull: data.lastReportPull
        }));
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  // ===== LOAD RECENT REPORTS =====
  const loadRecentReports = async () => {
    try {
      const reportsQuery = query(
        collection(db, 'creditReports'),
        where('contactId', '==', contactId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(reportsQuery);
      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      
      setRecentReports(reports);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  // ===== AI RECOMMENDATION =====
  const getAIRecommendation = async () => {
    try {
      setLoading(true);
      
      const getRecommendation = httpsCallable(functions, 'getIDIQRecommendation');
      const result = await getRecommendation({
        leadScore: contactData.leadScore,
        creditScore: contactData.creditScore,
        negativeItems: contactData.negativeItems,
        urgency: contactData.urgency
      });
      
      setAiRecommendation(result.data);
    } catch (err) {
      console.error('AI Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== AUTO ENROLLMENT FLOW =====
  const startAutoEnrollment = async () => {
    console.log('🚀 Starting auto-enrollment for high-value lead');
    
    // Determine best enrollment type based on score
    let recommendedType = 'TRIAL';
    if (contactData.leadScore >= 8) {
      recommendedType = 'PREMIUM';
    } else if (contactData.leadScore >= 6) {
      recommendedType = 'BASIC';
    }
    
    setEnrollmentData(prev => ({
      ...prev,
      enrollmentType: recommendedType
    }));
    
    // Auto-advance through steps if data is complete
    if (validateStep(0)) {
      setActiveStep(1);
    }
  };

  // ===== FORM VALIDATION =====
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Identity verification
        if (!enrollmentData.firstName) errors.firstName = 'First name required';
        if (!enrollmentData.lastName) errors.lastName = 'Last name required';
        if (!enrollmentData.dateOfBirth) errors.dateOfBirth = 'Date of birth required';
        if (!enrollmentData.ssnLast4 || enrollmentData.ssnLast4.length !== 4) {
          errors.ssnLast4 = 'Last 4 SSN digits required';
        }
        break;
        
      case 1: // Plan selection
        if (!enrollmentData.enrollmentType) errors.enrollmentType = 'Please select a plan';
        break;
        
      case 2: // Account setup
        if (!enrollmentData.username) errors.username = 'Username required';
        if (!enrollmentData.password || enrollmentData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        if (!enrollmentData.secretWord) errors.secretWord = 'Secret word required';
        if (!enrollmentData.email || !VALIDATION_RULES.email.test(enrollmentData.email)) {
          errors.email = 'Valid email required';
        }
        break;
        
      case 3: // Payment (if not trial)
        if (enrollmentData.enrollmentType !== 'TRIAL') {
          if (enrollmentData.paymentMethod === 'card') {
            if (!enrollmentData.cardNumber) errors.cardNumber = 'Card number required';
            if (!enrollmentData.cardExpiry) errors.cardExpiry = 'Expiry date required';
            if (!enrollmentData.cardCvv) errors.cardCvv = 'CVV required';
          } else {
            if (!enrollmentData.achRouting) errors.achRouting = 'Routing number required';
            if (!enrollmentData.achAccount) errors.achAccount = 'Account number required';
          }
        }
        break;
        
      case 4: // Consent
        if (!enrollmentData.consentToMonitor) errors.consent = 'Consent required';
        if (!enrollmentData.agreeToTerms) errors.terms = 'Must agree to terms';
        break;
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== HANDLE STEP NAVIGATION =====
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // ===== SUBMIT ENROLLMENT =====
  const submitEnrollment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Submitting IDIQ enrollment...');
      
      // Call Cloud Function to process enrollment
      const processEnrollment = httpsCallable(functions, 'processIDIQEnrollment');
      const result = await processEnrollment({
        contactId,
        enrollmentData: {
          ...enrollmentData,
          enrollmentDate: serverTimestamp(),
          monitoringActive: true
        }
      });
      
      if (result.data.success) {
        // Save to Firestore
        await setDoc(doc(db, 'idiqEnrollments', contactId), {
          ...enrollmentData,
          memberId: result.data.memberId,
          enrollmentDate: serverTimestamp(),
          enrollmentStatus: 'active',
          monitoringActive: true,
          lastUpdated: serverTimestamp()
        });
        
        // Update contact record
        await updateDoc(doc(db, 'contacts', contactId), {
          idiqEnrolled: true,
          idiqMemberId: result.data.memberId,
          idiqEnrollmentDate: serverTimestamp(),
          monitoringActive: true
        });
        
        // Log activity
        await addDoc(collection(db, 'activities'), {
          contactId,
          type: 'idiq_enrollment',
          description: `Enrolled in IDIQ ${enrollmentData.enrollmentType} plan`,
          metadata: {
            memberId: result.data.memberId,
            planType: enrollmentData.enrollmentType,
            partnerId: PARTNER_ID
          },
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser?.uid
        });
        
        setSuccess(true);
        setActiveStep(5);
        
        // Pull initial credit report
        await pullInitialReport(result.data.memberId);
        
        // Callback to parent
        if (onComplete) {
          onComplete({
            success: true,
            memberId: result.data.memberId,
            enrollmentType: enrollmentData.enrollmentType
          });
        }
        
      } else {
        throw new Error(result.data.error || 'Enrollment failed');
      }
      
    } catch (err) {
      console.error('❌ Enrollment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== PULL INITIAL CREDIT REPORT =====
  const pullInitialReport = async (memberId) => {
    try {
      console.log('📊 Pulling initial credit report...');
      
      const pullReport = httpsCallable(functions, 'pullIDIQReport');
      const result = await pullReport({
        contactId,
        memberId,
        reportType: 'full'
      });
      
      if (result.data.success) {
        console.log('✅ Initial report pulled successfully');
        
        // Update last pull date
        await updateDoc(doc(db, 'idiqEnrollments', contactId), {
          lastReportPull: serverTimestamp(),
          lastReportId: result.data.reportId
        });
      }
      
    } catch (err) {
      console.error('Report pull error:', err);
    }
  };

  // ===== RENDER FUNCTIONS =====
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <IdentityVerificationStep />;
      case 1:
        return <PlanSelectionStep />;
      case 2:
        return <AccountSetupStep />;
      case 3:
        return <PaymentStep />;
      case 4:
        return <ConsentStep />;
      case 5:
        return <CompletionStep />;
      default:
        return null;
    }
  };

  // ===== STEP 0: IDENTITY VERIFICATION =====
  const IdentityVerificationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <UserCheck className="inline mr-2" />
        Verify Identity Information
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This information is required for credit report access and identity verification.
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={enrollmentData.firstName}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              firstName: e.target.value
            })}
            error={!!validation.firstName}
            helperText={validation.firstName}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={enrollmentData.lastName}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              lastName: e.target.value
            })}
            error={!!validation.lastName}
            helperText={validation.lastName}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of Birth"
              value={enrollmentData.dateOfBirth}
              onChange={(date) => setEnrollmentData({
                ...enrollmentData,
                dateOfBirth: date
              })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!validation.dateOfBirth}
                  helperText={validation.dateOfBirth}
                  required
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last 4 SSN"
            value={enrollmentData.ssnLast4}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setEnrollmentData({
                ...enrollmentData,
                ssnLast4: value
              });
            }}
            error={!!validation.ssnLast4}
            helperText={validation.ssnLast4}
            required
            inputProps={{ maxLength: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={enrollmentData.address1}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              address1: e.target.value
            })}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={enrollmentData.city}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              city: e.target.value
            })}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>State</InputLabel>
            <Select
              value={enrollmentData.state}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                state: e.target.value
              })}
              label="State"
            >
              <MenuItem value="CA">California</MenuItem>
              <MenuItem value="TX">Texas</MenuItem>
              <MenuItem value="FL">Florida</MenuItem>
              {/* Add all states */}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="ZIP Code"
            value={enrollmentData.zipCode}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              zipCode: e.target.value
            })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  // ===== STEP 1: PLAN SELECTION =====
  const PlanSelectionStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <CreditCard className="inline mr-2" />
        Select Monitoring Plan
      </Typography>
      
      {aiRecommendation && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            AI Recommendation
          </Typography>
          <Typography variant="body2">
            Based on lead score of {contactData.leadScore}/10, we recommend: {' '}
            <strong>{aiRecommendation.recommendedPlan}</strong>
          </Typography>
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {Object.values(ENROLLMENT_TYPES).map((plan) => {
          const Icon = plan.icon;
          const isSelected = enrollmentData.enrollmentType === plan.id.toUpperCase();
          
          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => setEnrollmentData({
                  ...enrollmentData,
                  enrollmentType: plan.id.toUpperCase()
                })}
              >
                {isSelected && (
                  <Chip
                    label="Selected"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8
                    }}
                  />
                )}
                
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: plan.color, mr: 2 }}>
                      <Icon size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {plan.name}
                      </Typography>
                      <Typography variant="h5" color="primary">
                        ${plan.price}
                        {plan.price > 0 && '/mo'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <List dense>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle size={16} color={plan.color} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      <Box mt={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enrollmentData.autoRenew}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                autoRenew: e.target.checked
              })}
            />
          }
          label="Auto-renew subscription"
        />
      </Box>
    </Box>
  );

  // ===== STEP 2: ACCOUNT SETUP =====
  const AccountSetupStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <Settings className="inline mr-2" />
        Create IDIQ Account
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            value={enrollmentData.username}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              username: e.target.value
            })}
            error={!!validation.username}
            helperText={validation.username || 'Choose a unique username'}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={enrollmentData.password}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              password: e.target.value
            })}
            error={!!validation.password}
            helperText={validation.password || 'Minimum 8 characters'}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={enrollmentData.email}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              email: e.target.value
            })}
            error={!!validation.email}
            helperText={validation.email}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={enrollmentData.phone}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              phone: e.target.value.replace(/\D/g, '').slice(0, 10)
            })}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Chip label="Security Questions" size="small" />
          </Divider>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Secret Word"
            value={enrollmentData.secretWord}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              secretWord: e.target.value
            })}
            error={!!validation.secretWord}
            helperText={validation.secretWord || 'For account recovery'}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Security Question</InputLabel>
            <Select
              value={enrollmentData.secretQuestion}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                secretQuestion: e.target.value
              })}
              label="Security Question"
            >
              <MenuItem value="pet">What was your first pet's name?</MenuItem>
              <MenuItem value="school">What elementary school did you attend?</MenuItem>
              <MenuItem value="city">In what city were you born?</MenuItem>
              <MenuItem value="car">What was your first car?</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Security Answer"
            value={enrollmentData.secretAnswer}
            onChange={(e) => setEnrollmentData({
              ...enrollmentData,
              secretAnswer: e.target.value
            })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  // ===== STEP 3: PAYMENT =====
  const PaymentStep = () => {
    if (enrollmentData.enrollmentType === 'TRIAL') {
      return (
        <Box textAlign="center" py={4}>
          <CheckCircle size={64} color="#4CAF50" />
          <Typography variant="h5" mt={2}>
            No Payment Required!
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Your 7-day trial is free. Payment information will be required after the trial period.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <DollarSign className="inline mr-2" />
          Payment Information
        </Typography>
        
        <ToggleButtonGroup
          value={enrollmentData.paymentMethod}
          exclusive
          onChange={(e, value) => value && setEnrollmentData({
            ...enrollmentData,
            paymentMethod: value
          })}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="card">
            <CreditCard size={20} className="mr-2" />
            Credit/Debit Card
          </ToggleButton>
          <ToggleButton value="ach">
            <FileText size={20} className="mr-2" />
            Bank Account (ACH)
          </ToggleButton>
        </ToggleButtonGroup>
        
        {enrollmentData.paymentMethod === 'card' ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={enrollmentData.cardNumber}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)
                })}
                error={!!validation.cardNumber}
                helperText={validation.cardNumber}
                placeholder="1234 5678 9012 3456"
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                value={enrollmentData.cardExpiry}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  cardExpiry: e.target.value
                })}
                error={!!validation.cardExpiry}
                helperText={validation.cardExpiry}
                placeholder="MM/YY"
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                value={enrollmentData.cardCvv}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                })}
                error={!!validation.cardCvv}
                helperText={validation.cardCvv}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Billing ZIP Code"
                value={enrollmentData.billingZip}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  billingZip: e.target.value.replace(/\D/g, '').slice(0, 5)
                })}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Routing Number"
                value={enrollmentData.achRouting}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  achRouting: e.target.value.replace(/\D/g, '').slice(0, 9)
                })}
                error={!!validation.achRouting}
                helperText={validation.achRouting}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Number"
                value={enrollmentData.achAccount}
                onChange={(e) => setEnrollmentData({
                  ...enrollmentData,
                  achAccount: e.target.value
                })}
                error={!!validation.achAccount}
                helperText={validation.achAccount}
                required
              />
            </Grid>
          </Grid>
        )}
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Your payment information is encrypted and secure. Charges will begin after your selected plan period.
          </Typography>
        </Alert>
      </Box>
    );
  };

  // ===== STEP 4: CONSENT =====
  const ConsentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        <FileText className="inline mr-2" />
        Review & Consent
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Enrollment Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Name:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              {enrollmentData.firstName} {enrollmentData.lastName}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Plan:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              {ENROLLMENT_TYPES[enrollmentData.enrollmentType]?.name}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Price:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              ${ENROLLMENT_TYPES[enrollmentData.enrollmentType]?.price}/mo
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Partner ID:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              {PARTNER_ID}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enrollmentData.consentToMonitor}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                consentToMonitor: e.target.checked
              })}
            />
          }
          label="I consent to credit monitoring and report access"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={enrollmentData.agreeToTerms}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                agreeToTerms: e.target.checked
              })}
            />
          }
          label="I agree to the Terms of Service and Privacy Policy"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={enrollmentData.marketingOptIn}
              onChange={(e) => setEnrollmentData({
                ...enrollmentData,
                marketingOptIn: e.target.checked
              })}
            />
          }
          label="Send me credit tips and promotional offers (optional)"
        />
      </Stack>
      
      {validation.consent && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validation.consent}
        </Alert>
      )}
      
      {validation.terms && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {validation.terms}
        </Alert>
      )}
    </Box>
  );

  // ===== STEP 5: COMPLETION =====
  const CompletionStep = () => (
    <Box textAlign="center" py={4}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: 'success.main',
          mx: 'auto',
          mb: 3
        }}
      >
        <CheckCircle size={48} />
      </Avatar>
      
      <Typography variant="h4" gutterBottom>
        Enrollment Complete!
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        IDIQ credit monitoring has been successfully activated for this contact.
      </Typography>
      
      {existingEnrollment && (
        <Paper sx={{ p: 3, mt: 3, maxWidth: 400, mx: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Enrollment Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Member ID:</strong> {existingEnrollment.memberId}
            </Typography>
            <Typography variant="body2">
              <strong>Username:</strong> {existingEnrollment.username}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong>{' '}
              <Chip
                label="Active"
                color="success"
                size="small"
              />
            </Typography>
          </Stack>
        </Paper>
      )}
      
      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => window.open('https://idiq.com/login', '_blank')}
        >
          Access IDIQ Portal
        </Button>
        <Button
          variant="contained"
          startIcon={<FileText />}
          onClick={pullInitialReport}
        >
          Pull Credit Report Now
        </Button>
      </Stack>
    </Box>
  );

  // ===== MONITORING STATUS CARD =====
  const MonitoringStatusCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              Credit Monitoring Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Partner ID: {PARTNER_ID}
            </Typography>
          </Box>
          <Chip
            icon={monitoringStatus === 'active' ? <Wifi /> : <WifiOff />}
            label={monitoringStatus === 'active' ? 'Active' : 'Inactive'}
            color={monitoringStatus === 'active' ? 'success' : 'default'}
          />
        </Box>
        
        {existingEnrollment && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Member ID
                </Typography>
                <Typography variant="body1">
                  {existingEnrollment.memberId || 'Not enrolled'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Report Pull
                </Typography>
                <Typography variant="body1">
                  {existingEnrollment.lastReportPull 
                    ? format(existingEnrollment.lastReportPull.toDate(), 'MMM dd, yyyy')
                    : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====
  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          <Shield className="inline mr-2" />
          IDIQ Credit Monitoring Enrollment
        </Typography>
        <Chip
          label={`Lead Score: ${contactData.leadScore || 0}/10`}
          color={contactData.leadScore >= 7 ? 'success' : 'default'}
        />
      </Box>
      
      {/* Monitoring Status */}
      {existingEnrollment && <MonitoringStatusCard />}
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Enrollment completed successfully!
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {renderStepContent(index)}
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={index === steps.length - 1 ? submitEnrollment : handleNext}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {index === steps.length - 1 ? 'Complete Enrollment' : 'Continue'}
                </Button>
                {index > 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{ ml: 2 }}
                    disabled={loading}
                  >
                    Back
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {/* Recent Reports Section */}
      {recentReports.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Recent Credit Reports
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Scores</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(report.createdAt.toDate(), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      EQ: {report.scores?.equifax} | 
                      EX: {report.scores?.experian} | 
                      TU: {report.scores?.transunion}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Eye size={16} />
                      </IconButton>
                      <IconButton size="small">
                        <Download size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
}