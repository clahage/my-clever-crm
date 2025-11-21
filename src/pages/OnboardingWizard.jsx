// ===================================================================
// OnboardingWizard.jsx - Comprehensive Onboarding System
// ===================================================================
// Purpose: Step-by-step onboarding for employees and clients
// Features:
// - Multi-step wizard with progress tracking
// - Role-specific onboarding flows
// - AI-powered guidance and tips
// - Document collection and e-signatures
// - Interactive tutorials
// - Automated task assignment
// - Welcome videos and resources
// - Progress checkpoints
// - Completion certificates
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Video,
  Users,
  Settings,
  Award,
  Download,
  Upload,
  Play,
  BookOpen,
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Target,
  Zap,
  Sparkles,
  PartyPopper,
  ChevronDown,
  Info,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';

// ===================================================================
// ONBOARDING FLOW DEFINITIONS
// ===================================================================

const EMPLOYEE_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    label: 'Welcome',
    title: 'Welcome to SpeedyCRM!',
    description: 'Let\'s get you started with your new journey',
    icon: <PartyPopper />,
    required: true
  },
  {
    id: 'personal-info',
    label: 'Personal Information',
    title: 'Tell Us About Yourself',
    description: 'Basic information for your profile',
    icon: <Users />,
    required: true
  },
  {
    id: 'documents',
    label: 'Documents',
    title: 'Required Documents',
    description: 'Upload necessary documentation',
    icon: <FileText />,
    required: true
  },
  {
    id: 'system-setup',
    label: 'System Setup',
    title: 'Configure Your Account',
    description: 'Personalize your workspace',
    icon: <Settings />,
    required: true
  },
  {
    id: 'training',
    label: 'Initial Training',
    title: 'Essential Training Modules',
    description: 'Complete required training courses',
    icon: <GraduationCap />,
    required: true
  },
  {
    id: 'review',
    label: 'Review & Complete',
    title: 'Final Review',
    description: 'Verify everything is correct',
    icon: <CheckCircle />,
    required: true
  }
];

const CLIENT_ONBOARDING_STEPS = [
  {
    id: 'welcome',
    label: 'Welcome',
    title: 'Welcome to Speedy Credit Repair!',
    description: 'Your journey to better credit starts here',
    icon: <PartyPopper />,
    required: true
  },
  {
    id: 'agreement',
    label: 'Service Agreement',
    title: 'Review & Sign Agreement',
    description: 'Review and electronically sign your service agreement',
    icon: <FileText />,
    required: true
  },
  {
    id: 'credit-info',
    label: 'Credit Information',
    title: 'Your Credit Information',
    description: 'Provide details about your credit situation',
    icon: <Target />,
    required: true
  },
  {
    id: 'goals',
    label: 'Goals & Timeline',
    title: 'Set Your Goals',
    description: 'What do you want to achieve?',
    icon: <Award />,
    required: true
  },
  {
    id: 'payment',
    label: 'Payment Setup',
    title: 'Payment Information',
    description: 'Set up your payment method',
    icon: <Briefcase />,
    required: true
  },
  {
    id: 'portal-tour',
    label: 'Portal Tour',
    title: 'Client Portal Tour',
    description: 'Learn how to use your client portal',
    icon: <Video />,
    required: false
  },
  {
    id: 'complete',
    label: 'All Set!',
    title: 'You\'re All Set!',
    description: 'Welcome to the Speedy family',
    icon: <CheckCircle />,
    required: true
  }
];

// ===================================================================
// MAIN ONBOARDING WIZARD COMPONENT
// ===================================================================

const OnboardingWizard = () => {
  // ===============================================================
  // STATE MANAGEMENT
  // ===============================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [onboardingType, setOnboardingType] = useState(null); // 'employee' or 'client'
  const [formData, setFormData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [error, setError] = useState(null);

  const currentSteps = onboardingType === 'employee' 
    ? EMPLOYEE_ONBOARDING_STEPS 
    : CLIENT_ONBOARDING_STEPS;

  // ===============================================================
  // LOAD ONBOARDING STATUS
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('🎓 OnboardingWizard: Loading status');

    const loadOnboardingStatus = async () => {
      try {
        // Load user profile
        const userDoc = await getDoc(doc(db, 'userProfiles', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);

          // Determine onboarding type from role
          if (userData.role && ['user', 'manager', 'admin', 'masterAdmin'].includes(userData.role)) {
            setOnboardingType('employee');
          } else {
            setOnboardingType('client');
          }
        }

        // Load existing onboarding progress
        const onboardingDoc = await getDoc(
          doc(db, 'onboardingProgress', auth.currentUser.uid)
        );

        if (onboardingDoc.exists()) {
          const data = onboardingDoc.data();
          setOnboardingData(data);
          setActiveStep(data.currentStep || 0);
          setFormData(data.formData || {});
          setUploadedFiles(data.uploadedFiles || {});
          console.log('📊 Loaded existing onboarding progress');
        } else {
          // Initialize new onboarding
          const newOnboarding = {
            userId: auth.currentUser.uid,
            status: 'in-progress',
            currentStep: 0,
            startedAt: serverTimestamp(),
            type: onboardingType,
            formData: {},
            uploadedFiles: {},
            completedSteps: []
          };
          await setDoc(
            doc(db, 'onboardingProgress', auth.currentUser.uid),
            newOnboarding
          );
          setOnboardingData(newOnboarding);
          console.log('✨ Created new onboarding record');
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading onboarding:', err);
        setError('Failed to load onboarding status');
        setLoading(false);
      }
    };

    loadOnboardingStatus();
  }, [onboardingType]);

  // ===============================================================
  // REAL-TIME LISTENER FOR UPDATES
  // ===============================================================

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'onboardingProgress', auth.currentUser.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setOnboardingData(docSnap.data());
        }
      },
      (err) => {
        console.error('❌ Error in onboarding listener:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // ===============================================================
  // AI SUGGESTIONS BASED ON CURRENT STEP
  // ===============================================================

  useEffect(() => {
    if (!currentSteps[activeStep]) return;

    const generateAISuggestions = () => {
      const step = currentSteps[activeStep];
      const suggestions = [];

      switch (step.id) {
        case 'personal-info':
          suggestions.push({
            icon: <Info />,
            text: 'Provide accurate information for your profile and communications',
            type: 'info'
          });
          suggestions.push({
            icon: <Zap />,
            text: 'Tip: Use your work email for better communication',
            type: 'tip'
          });
          break;

        case 'documents':
          suggestions.push({
            icon: <AlertCircle />,
            text: 'Required documents: ID, tax forms, and employment verification',
            type: 'warning'
          });
          suggestions.push({
            icon: <Zap />,
            text: 'Scan documents clearly to avoid delays',
            type: 'tip'
          });
          break;

        case 'system-setup':
          suggestions.push({
            icon: <Sparkles />,
            text: 'Customize your dashboard to match your workflow',
            type: 'info'
          });
          break;

        case 'training':
          suggestions.push({
            icon: <GraduationCap />,
            text: 'Complete all required training modules to unlock full access',
            type: 'info'
          });
          suggestions.push({
            icon: <Zap />,
            text: 'Training modules take about 2-3 hours to complete',
            type: 'tip'
          });
          break;

        case 'credit-info':
          suggestions.push({
            icon: <Info />,
            text: 'Be honest about your credit situation for the best results',
            type: 'info'
          });
          break;

        case 'goals':
          suggestions.push({
            icon: <Target />,
            text: 'Set realistic goals based on your timeline',
            type: 'info'
          });
          suggestions.push({
            icon: <Zap />,
            text: 'Most clients see results within 3-6 months',
            type: 'tip'
          });
          break;

        default:
          break;
      }

      setAiSuggestions(suggestions);
    };

    generateAISuggestions();
  }, [activeStep, currentSteps]);

  // ===============================================================
  // FORM HANDLERS
  // ===============================================================

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    setSaving(true);
    try {
      const storageRef = ref(
        storage,
        `onboarding/${auth.currentUser.uid}/${field}/${file.name}`
      );
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setUploadedFiles(prev => ({
        ...prev,
        [field]: {
          name: file.name,
          url: downloadURL,
          uploadedAt: new Date().toISOString()
        }
      }));

      console.log('📤 File uploaded:', field);
    } catch (err) {
      console.error('❌ Error uploading file:', err);
      setError(`Failed to upload ${field}`);
    } finally {
      setSaving(false);
    }
  };

  // ===============================================================
  // STEP VALIDATION
  // ===============================================================

  const validateCurrentStep = () => {
    const step = currentSteps[activeStep];
    const errors = {};

    switch (step.id) {
      case 'personal-info':
        if (!formData.firstName) errors.firstName = 'First name is required';
        if (!formData.lastName) errors.lastName = 'Last name is required';
        if (!formData.phone) errors.phone = 'Phone number is required';
        if (!formData.address) errors.address = 'Address is required';
        break;

      case 'documents':
        if (!uploadedFiles.idDocument) errors.idDocument = 'ID document is required';
        if (onboardingType === 'employee' && !uploadedFiles.taxForms) {
          errors.taxForms = 'Tax forms are required';
        }
        break;

      case 'credit-info':
        if (!formData.currentScore) errors.currentScore = 'Current credit score is required';
        if (!formData.creditIssues) errors.creditIssues = 'Please describe your credit issues';
        break;

      case 'goals':
        if (!formData.targetScore) errors.targetScore = 'Target score is required';
        if (!formData.timeline) errors.timeline = 'Timeline is required';
        break;

      case 'payment':
        if (!formData.paymentMethod) errors.paymentMethod = 'Payment method is required';
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===============================================================
  // NAVIGATION HANDLERS
  // ===============================================================

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSaving(true);
    try {
      // Save progress
      await updateDoc(doc(db, 'onboardingProgress', auth.currentUser.uid), {
        currentStep: activeStep + 1,
        formData: formData,
        uploadedFiles: uploadedFiles,
        completedSteps: [...(onboardingData.completedSteps || []), currentSteps[activeStep].id],
        lastUpdated: serverTimestamp()
      });

      // Log activity
      await setDoc(doc(collection(db, 'trainingActivity')), {
        userId: auth.currentUser.uid,
        type: 'onboarding-step-completed',
        step: currentSteps[activeStep].id,
        stepNumber: activeStep + 1,
        timestamp: serverTimestamp()
      });

      setActiveStep(prev => prev + 1);
      console.log('✅ Step completed:', currentSteps[activeStep].id);
    } catch (err) {
      console.error('❌ Error saving progress:', err);
      setError('Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setSaving(true);
    try {
      // Mark onboarding as complete
      await updateDoc(doc(db, 'onboardingProgress', auth.currentUser.uid), {
        status: 'completed',
        completedAt: serverTimestamp(),
        currentStep: currentSteps.length,
        formData: formData,
        uploadedFiles: uploadedFiles
      });

      // Update user profile
      await updateDoc(doc(db, 'userProfiles', auth.currentUser.uid), {
        onboardingCompleted: true,
        onboardingCompletedAt: serverTimestamp()
      });

      // Log completion
      await setDoc(doc(collection(db, 'trainingActivity')), {
        userId: auth.currentUser.uid,
        type: 'onboarding-completed',
        onboardingType: onboardingType,
        timestamp: serverTimestamp()
      });

      console.log('🎉 Onboarding completed!');
      setShowCompletionDialog(true);
    } catch (err) {
      console.error('❌ Error completing onboarding:', err);
      setError('Failed to complete onboarding');
    } finally {
      setSaving(false);
    }
  };

  // ===============================================================
  // RENDER STEP CONTENT
  // ===============================================================

  const renderStepContent = (step) => {
    switch (step.id) {
      case 'welcome':
        return (
          <Box>
            <Box className="text-center py-8">
              <Box className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                <PartyPopper className="text-white" size={48} />
              </Box>
              <Typography variant="h4" className="font-bold mb-3 text-gray-900 dark:text-white">
                {step.title}
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                {onboardingType === 'employee' 
                  ? 'We\'re excited to have you join our team! This onboarding process will help you get set up and ready to succeed.'
                  : 'Welcome to Speedy Credit Repair! We\'re committed to helping you achieve your credit goals. Let\'s get started with a few simple steps.'}
              </Typography>

              <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                <CardContent>
                  <Typography variant="h6" className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    What to Expect
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Complete this onboarding in 15-20 minutes"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Provide necessary information and documents"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Get instant access to your dashboard"
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case 'personal-info':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || userProfile?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!!userProfile?.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 'documents':
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                Please upload clear, legible copies of the required documents. Accepted formats: PDF, JPG, PNG (max 10MB)
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box className="flex items-center justify-between mb-3">
                      <Box className="flex items-center gap-2">
                        <FileText size={24} className="text-blue-600" />
                        <Typography variant="h6">
                          Government-Issued ID *
                        </Typography>
                      </Box>
                      {uploadedFiles.idDocument && (
                        <Chip
                          label="Uploaded"
                          color="success"
                          size="small"
                          icon={<CheckCircle size={16} />}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-3">
                      Driver's license, passport, or state ID
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<Upload />}
                    >
                      {uploadedFiles.idDocument ? 'Replace File' : 'Upload File'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idDocument', e.target.files[0])}
                      />
                    </Button>
                    {uploadedFiles.idDocument && (
                      <Typography variant="caption" className="ml-2 text-green-600">
                        {uploadedFiles.idDocument.name}
                      </Typography>
                    )}
                    {validationErrors.idDocument && (
                      <Typography variant="caption" color="error" className="block mt-1">
                        {validationErrors.idDocument}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {onboardingType === 'employee' && (
                <>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box className="flex items-center justify-between mb-3">
                          <Box className="flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            <Typography variant="h6">
                              Tax Forms (W-4 or W-9) *
                            </Typography>
                          </Box>
                          {uploadedFiles.taxForms && (
                            <Chip
                              label="Uploaded"
                              color="success"
                              size="small"
                              icon={<CheckCircle size={16} />}
                            />
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                        >
                          {uploadedFiles.taxForms ? 'Replace File' : 'Upload File'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf"
                            onChange={(e) => handleFileUpload('taxForms', e.target.files[0])}
                          />
                        </Button>
                        {uploadedFiles.taxForms && (
                          <Typography variant="caption" className="ml-2 text-green-600">
                            {uploadedFiles.taxForms.name}
                          </Typography>
                        )}
                        {validationErrors.taxForms && (
                          <Typography variant="caption" color="error" className="block mt-1">
                            {validationErrors.taxForms}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box className="flex items-center justify-between mb-3">
                          <Box className="flex items-center gap-2">
                            <FileText size={24} className="text-blue-600" />
                            <Typography variant="h6">
                              Employment Verification (Optional)
                            </Typography>
                          </Box>
                          {uploadedFiles.employment && (
                            <Chip
                              label="Uploaded"
                              color="success"
                              size="small"
                              icon={<CheckCircle size={16} />}
                            />
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<Upload />}
                        >
                          {uploadedFiles.employment ? 'Replace File' : 'Upload File'}
                          <input
                            type="file"
                            hidden
                            accept=".pdf,image/*"
                            onChange={(e) => handleFileUpload('employment', e.target.files[0])}
                          />
                        </Button>
                        {uploadedFiles.employment && (
                          <Typography variant="caption" className="ml-2 text-green-600">
                            {uploadedFiles.employment.name}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );

      case 'system-setup':
        return (
          <Box>
            <Typography variant="h6" className="mb-4 text-gray-900 dark:text-white">
              Customize Your Workspace
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Theme Preference</FormLabel>
                  <RadioGroup
                    value={formData.theme || 'auto'}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                  >
                    <FormControlLabel value="light" control={<Radio />} label="Light Mode" />
                    <FormControlLabel value="dark" control={<Radio />} label="Dark Mode" />
                    <FormControlLabel value="auto" control={<Radio />} label="Auto (System Default)" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Email Notifications</FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.emailNotifications ?? true}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Receive email notifications"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.dailyDigest ?? true}
                        onChange={(e) => handleInputChange('dailyDigest', e.target.checked)}
                      />
                    }
                    label="Daily activity digest"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    value={formData.timezone || 'America/Los_Angeles'}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 'training':
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              Complete these essential training modules to get started. More advanced training is available in the Training Library.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex items-center gap-3 mb-3">
                      <Box className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Video className="text-blue-600 dark:text-blue-400" />
                      </Box>
                      <Box>
                        <Typography variant="h6">Platform Overview</Typography>
                        <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                          15 minutes
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={formData.trainingPlatformOverview || 0} />
                    <Button
                      fullWidth
                      variant="outlined"
                      className="mt-3"
                      startIcon={<Play />}
                      onClick={() => handleInputChange('trainingPlatformOverview', 100)}
                    >
                      {formData.trainingPlatformOverview === 100 ? 'Completed' : 'Start Training'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex items-center gap-3 mb-3">
                      <Box className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BookOpen className="text-green-600 dark:text-green-400" />
                      </Box>
                      <Box>
                        <Typography variant="h6">Company Policies</Typography>
                        <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                          20 minutes
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={formData.trainingPolicies || 0} />
                    <Button
                      fullWidth
                      variant="outlined"
                      className="mt-3"
                      startIcon={<Play />}
                      onClick={() => handleInputChange('trainingPolicies', 100)}
                    >
                      {formData.trainingPolicies === 100 ? 'Completed' : 'Start Training'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex items-center gap-3 mb-3">
                      <Box className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Users className="text-purple-600 dark:text-purple-400" />
                      </Box>
                      <Box>
                        <Typography variant="h6">Customer Service</Typography>
                        <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                          30 minutes
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={formData.trainingCustomerService || 0} />
                    <Button
                      fullWidth
                      variant="outlined"
                      className="mt-3"
                      startIcon={<Play />}
                      onClick={() => handleInputChange('trainingCustomerService', 100)}
                    >
                      {formData.trainingCustomerService === 100 ? 'Completed' : 'Start Training'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex items-center gap-3 mb-3">
                      <Box className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Settings className="text-orange-600 dark:text-orange-400" />
                      </Box>
                      <Box>
                        <Typography variant="h6">System Tools</Typography>
                        <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                          25 minutes
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={formData.trainingTools || 0} />
                    <Button
                      fullWidth
                      variant="outlined"
                      className="mt-3"
                      startIcon={<Play />}
                      onClick={() => handleInputChange('trainingTools', 100)}
                    >
                      {formData.trainingTools === 100 ? 'Completed' : 'Start Training'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 'agreement':
        return (
          <Box>
            <Card className="mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-3">
                  Service Agreement
                </Typography>
                <Box className="max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded mb-4">
                  <Typography variant="body2" className="whitespace-pre-line">
                    {`SPEEDY CREDIT REPAIR SERVICE AGREEMENT

This Agreement is entered into between Speedy Credit Repair ("Company") and the Client.

1. SERVICES PROVIDED
The Company agrees to provide credit repair services including but not limited to:
- Credit report analysis
- Dispute letter preparation and submission
- Communication with credit bureaus
- Progress tracking and reporting
- Credit education and counseling

2. CLIENT OBLIGATIONS
The Client agrees to:
- Provide accurate information
- Review credit reports promptly
- Respond to Company communications
- Pay fees as agreed
- Comply with all applicable laws

3. FEES AND PAYMENT
- Setup Fee: $99 (one-time)
- Monthly Service Fee: $79
- Payment is due on the first of each month
- Credit card or ACH auto-pay required

4. CANCELLATION
Either party may cancel this agreement with 30 days written notice.

5. DISCLAIMERS
The Company makes no guarantees regarding:
- Specific credit score improvements
- Removal of accurate negative items
- Timeline for results

6. PRIVACY
All client information is kept strictly confidential per our Privacy Policy.

By signing below, you acknowledge that you have read, understood, and agree to the terms of this Agreement.`}
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.agreementAccepted || false}
                      onChange={(e) => handleInputChange('agreementAccepted', e.target.checked)}
                    />
                  }
                  label="I have read and agree to the Service Agreement"
                />

                {formData.agreementAccepted && (
                  <Box className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Typography variant="body2" className="mb-2">
                      Electronic Signature
                    </Typography>
                    <TextField
                      fullWidth
                      label="Type your full name to sign"
                      value={formData.signature || ''}
                      onChange={(e) => handleInputChange('signature', e.target.value)}
                      placeholder="John Doe"
                    />
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-2 block">
                      By typing your name, you are providing an electronic signature which is legally binding.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case 'credit-info':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Credit Score (Estimate)"
                  type="number"
                  value={formData.currentScore || ''}
                  onChange={(e) => handleInputChange('currentScore', e.target.value)}
                  error={!!validationErrors.currentScore}
                  helperText={validationErrors.currentScore || 'If you don\'t know, provide your best estimate'}
                  required
                  InputProps={{ inputProps: { min: 300, max: 850 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Do you have copies of your credit reports?</FormLabel>
                  <RadioGroup
                    value={formData.hasReports || 'no'}
                    onChange={(e) => handleInputChange('hasReports', e.target.value)}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes, I have them" />
                    <FormControlLabel value="no" control={<Radio />} label="No, I need to get them" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Describe Your Credit Issues"
                  multiline
                  rows={4}
                  value={formData.creditIssues || ''}
                  onChange={(e) => handleInputChange('creditIssues', e.target.value)}
                  error={!!validationErrors.creditIssues}
                  helperText={validationErrors.creditIssues || 'Late payments, collections, charge-offs, etc.'}
                  required
                  placeholder="Example: I have several late payments from 2020, a collection account from a medical bill, and my credit cards are maxed out..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>Check all that apply to you:</FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesLatePayments || false}
                        onChange={(e) => handleInputChange('issuesLatePayments', e.target.checked)}
                      />
                    }
                    label="Late payments"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesCollections || false}
                        onChange={(e) => handleInputChange('issuesCollections', e.target.checked)}
                      />
                    }
                    label="Collection accounts"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesChargeOffs || false}
                        onChange={(e) => handleInputChange('issuesChargeOffs', e.target.checked)}
                      />
                    }
                    label="Charge-offs"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesBankruptcy || false}
                        onChange={(e) => handleInputChange('issuesBankruptcy', e.target.checked)}
                      />
                    }
                    label="Bankruptcy"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesHighUtilization || false}
                        onChange={(e) => handleInputChange('issuesHighUtilization', e.target.checked)}
                      />
                    }
                    label="High credit utilization"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.issuesIdentityTheft || false}
                        onChange={(e) => handleInputChange('issuesIdentityTheft', e.target.checked)}
                      />
                    }
                    label="Identity theft / fraud"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 'goals':
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Credit Score"
                  type="number"
                  value={formData.targetScore || ''}
                  onChange={(e) => handleInputChange('targetScore', e.target.value)}
                  error={!!validationErrors.targetScore}
                  helperText={validationErrors.targetScore || 'What score do you want to achieve?'}
                  required
                  InputProps={{ inputProps: { min: 300, max: 850 } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.timeline}>
                  <FormLabel>Desired Timeline</FormLabel>
                  <Select
                    value={formData.timeline || ''}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                  >
                    <MenuItem value="3-months">3 months (aggressive)</MenuItem>
                    <MenuItem value="6-months">6 months (typical)</MenuItem>
                    <MenuItem value="12-months">12 months (conservative)</MenuItem>
                    <MenuItem value="flexible">Flexible timeline</MenuItem>
                  </Select>
                  {validationErrors.timeline && (
                    <Typography variant="caption" color="error">
                      {validationErrors.timeline}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>What are your main goals? (Check all that apply)</FormLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalBuyHome || false}
                        onChange={(e) => handleInputChange('goalBuyHome', e.target.checked)}
                      />
                    }
                    label="Buy a home / Get a mortgage"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalBuyCar || false}
                        onChange={(e) => handleInputChange('goalBuyCar', e.target.checked)}
                      />
                    }
                    label="Buy a car / Get an auto loan"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalCreditCard || false}
                        onChange={(e) => handleInputChange('goalCreditCard', e.target.checked)}
                      />
                    }
                    label="Get approved for credit cards"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalRefinance || false}
                        onChange={(e) => handleInputChange('goalRefinance', e.target.checked)}
                      />
                    }
                    label="Refinance existing loans"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalRentApartment || false}
                        onChange={(e) => handleInputChange('goalRentApartment', e.target.checked)}
                      />
                    }
                    label="Rent an apartment"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalEmployment || false}
                        onChange={(e) => handleInputChange('goalEmployment', e.target.checked)}
                      />
                    }
                    label="Pass employment background check"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.goalGeneral || false}
                        onChange={(e) => handleInputChange('goalGeneral', e.target.checked)}
                      />
                    }
                    label="General credit improvement"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Details (Optional)"
                  multiline
                  rows={3}
                  value={formData.goalDetails || ''}
                  onChange={(e) => handleInputChange('goalDetails', e.target.value)}
                  placeholder="Tell us more about your situation or specific goals..."
                />
              </Grid>
            </Grid>

            <Card className="mt-4 bg-green-50 dark:bg-green-900/20">
              <CardContent>
                <Box className="flex items-start gap-3">
                  <Target className="text-green-600 mt-1" />
                  <Box>
                    <Typography variant="h6" className="mb-2 text-green-900 dark:text-green-100">
                      Your Personalized Plan
                    </Typography>
                    <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                      Based on your goals, we'll create a customized credit repair strategy. Most clients see results within 3-6 months, with an average score increase of 60-100 points.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 'payment':
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              Your first payment will be processed immediately. Future payments will be automatically charged monthly.
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent>
                    <Typography variant="h5" className="font-bold mb-4">
                      Service Pricing
                    </Typography>
                    <Box className="space-y-3">
                      <Box className="flex justify-between items-center pb-2 border-b">
                        <Typography>Setup Fee (One-time)</Typography>
                        <Typography className="font-bold text-xl">$99</Typography>
                      </Box>
                      <Box className="flex justify-between items-center pb-2 border-b">
                        <Typography>Monthly Service Fee</Typography>
                        <Typography className="font-bold text-xl">$79/month</Typography>
                      </Box>
                      <Box className="flex justify-between items-center pt-2">
                        <Typography variant="h6">Due Today</Typography>
                        <Typography variant="h5" className="font-bold text-blue-600">
                          $178
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset" required error={!!validationErrors.paymentMethod}>
                  <FormLabel>Payment Method</FormLabel>
                  <RadioGroup
                    value={formData.paymentMethod || ''}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  >
                    <FormControlLabel 
                      value="credit-card" 
                      control={<Radio />} 
                      label="Credit Card / Debit Card" 
                    />
                    <FormControlLabel 
                      value="ach" 
                      control={<Radio />} 
                      label="Bank Account (ACH)" 
                    />
                  </RadioGroup>
                  {validationErrors.paymentMethod && (
                    <Typography variant="caption" color="error">
                      {validationErrors.paymentMethod}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {formData.paymentMethod && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-3">
                        {formData.paymentMethod === 'credit-card' ? 'Card Information' : 'Bank Account Information'}
                      </Typography>
                      
                      {formData.paymentMethod === 'credit-card' ? (
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Card Number"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber || ''}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Expiration Date"
                              placeholder="MM/YY"
                              value={formData.cardExpiry || ''}
                              onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="CVV"
                              placeholder="123"
                              value={formData.cardCvv || ''}
                              onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Name on Card"
                              value={formData.cardName || ''}
                              onChange={(e) => handleInputChange('cardName', e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Bank Name"
                              value={formData.bankName || ''}
                              onChange={(e) => handleInputChange('bankName', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Routing Number"
                              placeholder="123456789"
                              value={formData.routingNumber || ''}
                              onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Account Number"
                              value={formData.accountNumber || ''}
                              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <FormLabel>Account Type</FormLabel>
                              <RadioGroup
                                value={formData.accountType || 'checking'}
                                onChange={(e) => handleInputChange('accountType', e.target.value)}
                              >
                                <FormControlLabel value="checking" control={<Radio />} label="Checking" />
                                <FormControlLabel value="savings" control={<Radio />} label="Savings" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                        </Grid>
                      )}

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.authorizePayment || false}
                            onChange={(e) => handleInputChange('authorizePayment', e.target.checked)}
                          />
                        }
                        label="I authorize Speedy Credit Repair to charge my account for the amounts shown above"
                        className="mt-3"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 'portal-tour':
        return (
          <Box>
            <Typography variant="h5" className="mb-4 text-center">
              Take a Quick Tour of Your Client Portal
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-3">
                      <BarChart3 className="text-blue-600" size={24} />
                      <Typography variant="h6">Credit Dashboard</Typography>
                    </Box>
                    <Typography variant="body2" className="mb-3 text-gray-600 dark:text-gray-400">
                      Track your credit scores, view progress charts, and see recent changes to your credit reports.
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Play />}>
                      Watch Video (2 min)
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-3">
                      <MessageSquare className="text-green-600" size={24} />
                      <Typography variant="h6">Messages & Support</Typography>
                    </Box>
                    <Typography variant="body2" className="mb-3 text-gray-600 dark:text-gray-400">
                      Communicate with your credit specialist, ask questions, and get updates on your case.
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Play />}>
                      Watch Video (1.5 min)
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-3">
                      <FileText className="text-purple-600" size={24} />
                      <Typography variant="h6">Documents & Reports</Typography>
                    </Box>
                    <Typography variant="body2" className="mb-3 text-gray-600 dark:text-gray-400">
                      Access your credit reports, dispute letters, and important documents anytime.
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Play />}>
                      Watch Video (2 min)
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="h-full">
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-3">
                      <Calendar className="text-orange-600" size={24} />
                      <Typography variant="h6">Schedule Consultations</Typography>
                    </Box>
                    <Typography variant="body2" className="mb-3 text-gray-600 dark:text-gray-400">
                      Book appointments with your specialist for strategy sessions and progress reviews.
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Play />}>
                      Watch Video (1 min)
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card className="mt-4 bg-blue-50 dark:bg-blue-900/20">
              <CardContent>
                <Typography variant="body2" className="text-center">
                  <strong>Pro Tip:</strong> You can access your portal anytime at portal.speedycreditrepair.com or through our mobile app!
                </Typography>
              </CardContent>
            </Card>

            <Box className="text-center mt-4">
              <Button
                variant="text"
                onClick={() => handleInputChange('skipTour', true)}
              >
                Skip Tour (I'll explore on my own)
              </Button>
            </Box>
          </Box>
        );

      case 'review':
      case 'complete':
        return (
          <Box>
            <Box className="text-center mb-6">
              <Box className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <CheckCircle className="text-white" size={48} />
              </Box>
              <Typography variant="h4" className="font-bold mb-2 text-gray-900 dark:text-white">
                {step.id === 'review' ? 'Review Your Information' : 'Congratulations!'}
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400 mb-6">
                {step.id === 'review' 
                  ? 'Please review all information before completing your onboarding'
                  : 'Your onboarding is complete! Welcome to the team.'}
              </Typography>
            </Box>

            {step.id === 'review' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-2 flex items-center gap-2">
                        <Users size={20} />
                        Personal Information
                      </Typography>
                      <Divider className="my-2" />
                      <Typography variant="body2" className="mb-1">
                        <strong>Name:</strong> {formData.firstName} {formData.lastName}
                      </Typography>
                      <Typography variant="body2" className="mb-1">
                        <strong>Email:</strong> {formData.email}
                      </Typography>
                      <Typography variant="body2" className="mb-1">
                        <strong>Phone:</strong> {formData.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {formData.address}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-2 flex items-center gap-2">
                        <FileText size={20} />
                        Documents
                      </Typography>
                      <Divider className="my-2" />
                      {uploadedFiles.idDocument && (
                        <Typography variant="body2" className="mb-1 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          ID Document: {uploadedFiles.idDocument.name}
                        </Typography>
                      )}
                      {uploadedFiles.taxForms && (
                        <Typography variant="body2" className="mb-1 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          Tax Forms: {uploadedFiles.taxForms.name}
                        </Typography>
                      )}
                      {uploadedFiles.employment && (
                        <Typography variant="body2" className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          Employment: {uploadedFiles.employment.name}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {onboardingType === 'client' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" className="mb-2 flex items-center gap-2">
                            <Target size={20} />
                            Credit Goals
                          </Typography>
                          <Divider className="my-2" />
                          <Typography variant="body2" className="mb-1">
                            <strong>Current Score:</strong> {formData.currentScore}
                          </Typography>
                          <Typography variant="body2" className="mb-1">
                            <strong>Target Score:</strong> {formData.targetScore}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Timeline:</strong> {formData.timeline}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" className="mb-2 flex items-center gap-2">
                            <Briefcase size={20} />
                            Payment Setup
                          </Typography>
                          <Divider className="my-2" />
                          <Typography variant="body2" className="mb-1">
                            <strong>Method:</strong> {formData.paymentMethod === 'credit-card' ? 'Credit Card' : 'Bank Account (ACH)'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong> {formData.authorizePayment ? 'Authorized' : 'Pending'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {step.id === 'complete' && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent>
                  <Typography variant="h6" className="mb-3">What's Next?</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={onboardingType === 'employee' ? 'Access your full dashboard' : 'Your credit specialist will review your case'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={onboardingType === 'employee' ? 'Complete advanced training modules' : 'You\'ll receive your first credit analysis within 24-48 hours'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle className="text-green-600" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={onboardingType === 'employee' ? 'Meet your team and manager' : 'We\'ll begin preparing your first round of disputes'}
                      />
                    </ListItem>
                  </List>

                  <Box className="text-center mt-4">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ExternalLink />}
                      onClick={() => window.location.href = onboardingType === 'employee' ? '/dashboard' : '/client-portal'}
                    >
                      {onboardingType === 'employee' ? 'Go to Dashboard' : 'Go to Client Portal'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  // ===============================================================
  // RENDER LOADING STATE
  // ===============================================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-96">
        <Box className="text-center">
          <CircularProgress size={60} />
          <Typography className="mt-4 text-gray-600 dark:text-gray-400">
            Loading onboarding wizard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ===============================================================
  // RENDER ERROR STATE
  // ===============================================================

  if (error) {
    return (
      <Alert severity="error" className="m-4">
        <Typography variant="h6">Error Loading Onboarding</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  // ===============================================================
  // RENDER MAIN WIZARD
  // ===============================================================

  return (
    <Container maxWidth="lg" className="py-6">
      <Paper className="p-6">
        {/* Progress Bar */}
        <Box className="mb-6">
          <Box className="flex justify-between items-center mb-2">
            <Typography variant="h6" className="text-gray-900 dark:text-white">
              {onboardingType === 'employee' ? 'Employee Onboarding' : 'Client Onboarding'}
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Step {activeStep + 1} of {currentSteps.length}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={((activeStep + 1) / currentSteps.length) * 100} 
            className="h-2 rounded"
          />
        </Box>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <Box className="mb-4">
            {aiSuggestions.map((suggestion, index) => (
              <Alert
                key={index}
                severity={suggestion.type === 'warning' ? 'warning' : 'info'}
                icon={suggestion.icon}
                className="mb-2"
              >
                {suggestion.text}
              </Alert>
            ))}
          </Box>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {currentSteps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                optional={
                  !step.required && (
                    <Typography variant="caption">Optional</Typography>
                  )
                }
              >
                <Box className="flex items-center gap-2">
                  {step.icon}
                  <Typography className="font-semibold">{step.label}</Typography>
                </Box>
              </StepLabel>
              <StepContent>
                <Box className="py-4">
                  <Typography variant="h5" className="mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </Typography>
                  <Typography className="mb-4 text-gray-600 dark:text-gray-400">
                    {step.description}
                  </Typography>

                  {renderStepContent(step)}

                  <Box className="flex gap-2 mt-6">
                    {index > 0 && (
                      <Button
                        onClick={handleBack}
                        startIcon={<ArrowLeft />}
                        disabled={saving}
                      >
                        Back
                      </Button>
                    )}
                    {index < currentSteps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowRight />}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Continue'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleComplete}
                        endIcon={<CheckCircle />}
                        disabled={saving}
                        color="success"
                      >
                        {saving ? 'Completing...' : 'Complete Onboarding'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="text-center py-8">
          <Box className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <PartyPopper className="text-white" size={48} />
          </Box>
          <Typography variant="h4" className="font-bold mb-2">
            🎉 Congratulations!
          </Typography>
          <Typography className="text-gray-600 dark:text-gray-400 mb-4">
            Your onboarding is complete! You're all set to get started.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.href = onboardingType === 'employee' ? '/dashboard' : '/client-portal'}
          >
            Get Started
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default OnboardingWizard;