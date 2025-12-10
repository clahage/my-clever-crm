// Path: /src/pages/hubs/clients/OnboardingTab.jsx
// ============================================================================
// CLIENTS HUB - ONBOARDING TAB
// ============================================================================
// Purpose: Client intake and welcome wizard with multi-step form
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  UserPlus,
  CheckCircle,
  FileText,
  CreditCard,
  Send,
  ArrowRight,
  ArrowLeft,
  Home,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Shield
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const steps = ['Personal Info', 'Contact Details', 'Service Selection', 'Agreement', 'Review & Submit'];

const OnboardingTab = () => {
  const { userProfile } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentOnboarding, setRecentOnboarding] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    // Contact Details
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // Service Selection
    serviceType: 'credit_repair',
    serviceLevel: 'basic',
    additionalServices: [],
    estimatedScore: '',
    targetScore: '',
    // Agreement
    termsAccepted: false,
    privacyAccepted: false,
    electronicConsent: false,
    // Additional
    referralSource: '',
    notes: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'clientOnboarding'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const onboardingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentOnboarding(onboardingData);
    });

    return () => unsubscribe();
  }, []);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
          setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
          return false;
        }
        break;
      case 1:
        if (!formData.email || !formData.phone || !formData.address) {
          setSnackbar({ open: true, message: 'Please fill in all contact details', severity: 'error' });
          return false;
        }
        break;
      case 3:
        if (!formData.termsAccepted || !formData.privacyAccepted || !formData.electronicConsent) {
          setSnackbar({ open: true, message: 'Please accept all required agreements', severity: 'error' });
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      // Save to clientOnboarding collection
      const onboardingRef = await addDoc(collection(db, 'clientOnboarding'), {
        ...formData,
        status: 'completed',
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email,
        completedAt: serverTimestamp()
      });

      // Also create client record
      await addDoc(collection(db, 'clients'), {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        status: 'active',
        source: formData.referralSource || 'Onboarding',
        serviceType: formData.serviceType,
        serviceLevel: formData.serviceLevel,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email,
        onboardingId: onboardingRef.id
      });

      setSnackbar({
        open: true,
        message: 'Client onboarding completed successfully!',
        severity: 'success'
      });

      // Reset form
      setTimeout(() => {
        setActiveStep(0);
        setFormData({
          firstName: '', lastName: '', dateOfBirth: '', ssn: '',
          email: '', phone: '', address: '', city: '', state: '', zipCode: '',
          serviceType: 'credit_repair', serviceLevel: 'basic', additionalServices: [],
          estimatedScore: '', targetScore: '',
          termsAccepted: false, privacyAccepted: false, electronicConsent: false,
          referralSource: '', notes: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Error submitting onboarding:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting onboarding. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please provide your personal details to get started.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SSN (Last 4 Digits)"
                value={formData.ssn}
                onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                inputProps={{ maxLength: 4 }}
                helperText="Optional - for verification purposes"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Contact Details</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                How can we reach you?
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8, color: '#999' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8, color: '#999' }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Street Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                InputProps={{
                  startAdornment: <Home size={18} style={{ marginRight: 8, color: '#999' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Service Selection</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the services that best fit your needs.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  label="Service Type"
                >
                  <MenuItem value="credit_repair">Credit Repair</MenuItem>
                  <MenuItem value="credit_monitoring">Credit Monitoring</MenuItem>
                  <MenuItem value="debt_management">Debt Management</MenuItem>
                  <MenuItem value="financial_coaching">Financial Coaching</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Service Level</Typography>
              <RadioGroup
                value={formData.serviceLevel}
                onChange={(e) => setFormData({ ...formData, serviceLevel: e.target.value })}
              >
                <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <FormControlLabel
                    value="basic"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Basic - $79/month</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Credit report review, dispute letters, monthly updates
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                  <FormControlLabel
                    value="premium"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Premium - $129/month</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Everything in Basic + credit monitoring, debt analysis, priority support
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <FormControlLabel
                    value="enterprise"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>Enterprise - $199/month</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Full service package with dedicated advisor, legal support, identity protection
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Current Score"
                type="number"
                value={formData.estimatedScore}
                onChange={(e) => setFormData({ ...formData, estimatedScore: e.target.value })}
                helperText="If known (300-850)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Score"
                type="number"
                value={formData.targetScore}
                onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                helperText="Your goal credit score"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Terms & Agreements</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review and accept the following agreements to continue.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Shield size={24} color="#1976d2" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Terms of Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      By accepting these terms, you agree to our service policies, payment terms, and
                      understand that credit repair results may vary based on individual circumstances.
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.termsAccepted}
                          onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                        />
                      }
                      label="I accept the Terms of Service"
                    />
                  </Box>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Shield size={24} color="#1976d2" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Privacy Policy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      We are committed to protecting your personal information and will only use it
                      to provide the services you've requested.
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.privacyAccepted}
                          onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                        />
                      }
                      label="I accept the Privacy Policy"
                    />
                  </Box>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <FileText size={24} color="#1976d2" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Electronic Signature Consent
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      You consent to receive documents and communications electronically and agree
                      that electronic signatures are legally binding.
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.electronicConsent}
                          onChange={(e) => setFormData({ ...formData, electronicConsent: e.target.checked })}
                        />
                      }
                      label="I consent to electronic signatures and communications"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Review & Submit</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review your information before submitting.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">{formData.dateOfBirth}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Contact Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{formData.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{formData.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">
                      {formData.address}, {formData.city} {formData.state} {formData.zipCode}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Service Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Service Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {formData.serviceType.replace('_', ' ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Service Level</Typography>
                    <Chip label={formData.serviceLevel} color="primary" sx={{ textTransform: 'capitalize' }} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="How did you hear about us?"
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                select
              >
                <MenuItem value="google">Google Search</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="referral">Friend/Family Referral</MenuItem>
                <MenuItem value="advertisement">Advertisement</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information you'd like to share..."
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Onboarding Form */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {loading && <LinearProgress sx={{ mb: 2 }} />}

              <Box sx={{ minHeight: 400 }}>
                {renderStepContent()}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  startIcon={<ArrowLeft size={18} />}
                >
                  Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={<Send size={18} />}
                    >
                      Submit Onboarding
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowRight size={18} />}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Onboarding */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Onboarding
              </Typography>
              <List>
                {recentOnboarding.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No recent onboarding
                  </Typography>
                ) : (
                  recentOnboarding.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#4caf50" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${item.firstName} ${item.lastName}`}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {item.email}
                              </Typography>
                              <Chip
                                label={item.status || 'completed'}
                                size="small"
                                color="success"
                                sx={{ mt: 0.5, height: 20 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Onboarding Tips
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle size={16} color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Complete all required fields"
                    secondary="Ensure accurate information for faster processing"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Shield size={16} color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Review privacy policies"
                    secondary="Understand how we protect your data"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <DollarSign size={16} color="#1976d2" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Choose the right service level"
                    secondary="Select based on your credit repair needs"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OnboardingTab;
