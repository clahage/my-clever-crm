// src/pages/InformationSheet.jsx - Comprehensive Client Information Collection
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Stepper, Step, StepLabel,
  Card, CardContent, FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, Radio, RadioGroup, Divider, Alert, Snackbar, Stack,
  Autocomplete, InputAdornment, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, Avatar,
  LinearProgress, Accordion, AccordionSummary, AccordionDetails, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  User, Mail, Phone, MapPin, Calendar, Home, Briefcase, CreditCard,
  DollarSign, FileText, CheckCircle, AlertCircle, Save, Send, Download,
  Edit, Trash2, Plus, ChevronDown, ChevronRight, Upload, Eye
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, doc, query, where, getDocs,
  serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const InformationSheet = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [savedForms, setSavedForms] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: null,
    ssn: '',
    email: '',
    phone: '',
    alternatePhone: '',
    preferredContact: 'email',
    
    // Current Address
    currentAddress: {
      street: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      residenceSince: null,
      residenceType: 'rent', // rent, own, family
      monthlyPayment: ''
    },
    
    // Previous Address (if less than 2 years at current)
    previousAddress: {
      needed: false,
      street: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      residenceFrom: null,
      residenceTo: null
    },
    
    // Employment Information
    employment: {
      status: 'employed', // employed, self-employed, unemployed, retired
      employer: '',
      jobTitle: '',
      employedSince: null,
      monthlyIncome: '',
      workPhone: '',
      
      // If self-employed
      businessName: '',
      businessType: '',
      
      // Address
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    
    // Previous Employment (if less than 2 years)
    previousEmployment: {
      needed: false,
      employer: '',
      jobTitle: '',
      employedFrom: null,
      employedTo: null
    },
    
    // Additional Income
    additionalIncome: [],
    
    // Current Credit Accounts
    creditAccounts: [],
    
    // Goals & Objectives
    goals: {
      primaryGoal: '', // home purchase, auto loan, credit cards, etc.
      targetDate: null,
      targetScore: '',
      specificNeeds: '',
      disputeReasons: []
    },
    
    // Legal Information
    legal: {
      bankruptcyHistory: false,
      bankruptcyDate: null,
      bankruptcyType: '',
      bankruptcyDischargeDate: null,
      foreclosureHistory: false,
      foreclosureDate: null,
      judgments: false,
      judgmentDetails: '',
      taxLiens: false,
      taxLienDetails: ''
    },
    
    // Authorization
    authorization: {
      accuracyConfirmed: false,
      consentToInquiry: false,
      consentToContact: false,
      signature: '',
      signatureDate: null,
      ipAddress: ''
    },
    
    // Admin
    contactId: null,
    status: 'draft',
    completedAt: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = [
    'Personal Information',
    'Address Details',
    'Employment',
    'Financial Information',
    'Credit Goals',
    'Legal History',
    'Review & Submit'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const incomeTypes = [
    'Rental Income',
    'Investment Income',
    'Alimony',
    'Child Support',
    'Social Security',
    'Disability',
    'Pension',
    'Other'
  ];

  const disputeReasons = [
    'Not mine - Never opened this account',
    'Paid in full - Shows balance',
    'Incorrect balance',
    'Duplicate account',
    'Incorrect payment history',
    'Identity theft',
    'Account closed by consumer',
    'Mixed credit file',
    'Outdated information',
    'Settled account showing unpaid',
    'Bankruptcy not reporting correctly',
    'Authorized user - not responsible'
  ];

  // Load contacts for autocomplete
  const loadContacts = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          ...data,
          displayName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()
        });
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Load saved forms
  const loadSavedForms = async () => {
    try {
      const q = query(
        collection(db, 'informationSheets'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const formsData = [];
      
      querySnapshot.forEach((doc) => {
        formsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSavedForms(formsData);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadContacts();
      loadSavedForms();
    }
  }, [currentUser]);

  // Form validation
  const validateStep = (step) => {
    switch (step) {
      case 0: // Personal Information
        return formData.firstName && formData.lastName && formData.dateOfBirth &&
               formData.ssn && formData.email && formData.phone;
      
      case 1: // Address
        return formData.currentAddress.street && formData.currentAddress.city &&
               formData.currentAddress.state && formData.currentAddress.zip;
      
      case 2: // Employment
        return formData.employment.status && 
               (formData.employment.status === 'unemployed' || formData.employment.employer);
      
      case 3: // Financial
        return true; // Optional section
      
      case 4: // Goals
        return formData.goals.primaryGoal && formData.goals.targetScore;
      
      case 5: // Legal
        return true; // Optional but important
      
      case 6: // Review
        return formData.authorization.accuracyConfirmed &&
               formData.authorization.consentToInquiry &&
               formData.authorization.consentToContact;
      
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      showSnackbar('Please complete all required fields', 'warning');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const draftData = {
        ...formData,
        userId: currentUser.uid,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      if (formData.id) {
        await updateDoc(doc(db, 'informationSheets', formData.id), draftData);
        showSnackbar('Draft updated successfully', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'informationSheets'), {
          ...draftData,
          createdAt: serverTimestamp()
        });
        setFormData(prev => ({ ...prev, id: docRef.id }));
        showSnackbar('Draft saved successfully', 'success');
      }
      
      loadSavedForms();
    } catch (error) {
      console.error('Error saving draft:', error);
      showSnackbar('Error saving draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(6)) {
      showSnackbar('Please complete all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        userId: currentUser.uid,
        status: 'completed',
        completedAt: serverTimestamp(),
        authorization: {
          ...formData.authorization,
          signatureDate: new Date(),
          ipAddress: await fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => data.ip)
            .catch(() => 'unknown')
        }
      };

      if (formData.id) {
        await updateDoc(doc(db, 'informationSheets', formData.id), submissionData);
      } else {
        await addDoc(collection(db, 'informationSheets'), {
          ...submissionData,
          createdAt: serverTimestamp()
        });
      }

      // Create/update contact if needed
      if (formData.contactId) {
        await updateDoc(doc(db, 'contacts', formData.contactId), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          updatedAt: serverTimestamp()
        });
      }

      showSnackbar('Information sheet submitted successfully!', 'success');
      
      // Reset form after short delay
      setTimeout(() => {
        resetForm();
        setActiveStep(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showSnackbar('Error submitting form', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: null,
      ssn: '',
      email: '',
      phone: '',
      alternatePhone: '',
      preferredContact: 'email',
      currentAddress: {
        street: '',
        unit: '',
        city: '',
        state: '',
        zip: '',
        residenceSince: null,
        residenceType: 'rent',
        monthlyPayment: ''
      },
      previousAddress: {
        needed: false,
        street: '',
        unit: '',
        city: '',
        state: '',
        zip: '',
        residenceFrom: null,
        residenceTo: null
      },
      employment: {
        status: 'employed',
        employer: '',
        jobTitle: '',
        employedSince: null,
        monthlyIncome: '',
        workPhone: '',
        businessName: '',
        businessType: '',
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      previousEmployment: {
        needed: false,
        employer: '',
        jobTitle: '',
        employedFrom: null,
        employedTo: null
      },
      additionalIncome: [],
      creditAccounts: [],
      goals: {
        primaryGoal: '',
        targetDate: null,
        targetScore: '',
        specificNeeds: '',
        disputeReasons: []
      },
      legal: {
        bankruptcyHistory: false,
        bankruptcyDate: null,
        bankruptcyType: '',
        bankruptcyDischargeDate: null,
        foreclosureHistory: false,
        foreclosureDate: null,
        judgments: false,
        judgmentDetails: '',
        taxLiens: false,
        taxLienDetails: ''
      },
      authorization: {
        accuracyConfirmed: false,
        consentToInquiry: false,
        consentToContact: false,
        signature: '',
        signatureDate: null,
        ipAddress: ''
      },
      contactId: null,
      status: 'draft',
      completedAt: null
    });
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Add additional income
  const addAdditionalIncome = () => {
    setFormData(prev => ({
      ...prev,
      additionalIncome: [
        ...prev.additionalIncome,
        { type: '', amount: '', source: '' }
      ]
    }));
  };

  // Remove additional income
  const removeAdditionalIncome = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalIncome: prev.additionalIncome.filter((_, i) => i !== index)
    }));
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                All information provided will be kept strictly confidential
              </Alert>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Middle Name"
                fullWidth
                value={formData.middleName}
                onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Suffix</InputLabel>
                <Select
                  value={formData.suffix}
                  onChange={(e) => setFormData(prev => ({ ...prev, suffix: e.target.value }))}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Jr.">Jr.</MenuItem>
                  <MenuItem value="Sr.">Sr.</MenuItem>
                  <MenuItem value="II">II</MenuItem>
                  <MenuItem value="III">III</MenuItem>
                  <MenuItem value="IV">IV</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Date of Birth *"
                value={formData.dateOfBirth}
                onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Social Security Number"
                required
                fullWidth
                value={formData.ssn}
                onChange={(e) => setFormData(prev => ({ ...prev, ssn: e.target.value }))}
                placeholder="XXX-XX-XXXX"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.preferredContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="text">Text/SMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Email Address"
                required
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Primary Phone"
                required
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(XXX) XXX-XXXX"
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Alternate Phone"
                fullWidth
                value={formData.alternatePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                placeholder="(XXX) XXX-XXXX"
              />
            </Grid>
          </Grid>
        );

      case 1: // Address Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Current Address</Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                label="Street Address"
                required
                fullWidth
                value={formData.currentAddress.street}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, street: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <MapPin size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Unit/Apt #"
                fullWidth
                value={formData.currentAddress.unit}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, unit: e.target.value }
                }))}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="City"
                required
                fullWidth
                value={formData.currentAddress.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, city: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.currentAddress.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    currentAddress: { ...prev.currentAddress, state: e.target.value }
                  }))}
                >
                  {states.map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="ZIP Code"
                required
                fullWidth
                value={formData.currentAddress.zip}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, zip: e.target.value }
                }))}
                inputProps={{ maxLength: 5 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePicker
                label="Living Here Since *"
                value={formData.currentAddress.residenceSince}
                onChange={(date) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, residenceSince: date }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Residence Type</InputLabel>
                <Select
                  value={formData.currentAddress.residenceType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    currentAddress: { ...prev.currentAddress, residenceType: e.target.value }
                  }))}
                >
                  <MenuItem value="rent">Rent</MenuItem>
                  <MenuItem value="own">Own</MenuItem>
                  <MenuItem value="family">Living with Family</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Monthly Payment"
                fullWidth
                value={formData.currentAddress.monthlyPayment}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, monthlyPayment: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.previousAddress.needed}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      previousAddress: { ...prev.previousAddress, needed: e.target.checked }
                    }))}
                  />
                }
                label="I lived at my current address for less than 2 years"
              />
            </Grid>

            {formData.previousAddress.needed && (
              <>
                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="h6" sx={{ mt: 2 }}>Previous Address</Typography>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    label="Previous Street Address"
                    fullWidth
                    value={formData.previousAddress.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      previousAddress: { ...prev.previousAddress, street: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Unit/Apt #"
                    fullWidth
                    value={formData.previousAddress.unit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      previousAddress: { ...prev.previousAddress, unit: e.target.value }
                    }))}
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <TextField
                    label="City"
                    fullWidth
                    value={formData.previousAddress.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      previousAddress: { ...prev.previousAddress, city: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                      value={formData.previousAddress.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        previousAddress: { ...prev.previousAddress, state: e.target.value }
                      }))}
                    >
                      {states.map(state => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    value={formData.previousAddress.zip}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      previousAddress: { ...prev.previousAddress, zip: e.target.value }
                    }))}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 2: // Employment
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  value={formData.employment.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    employment: { ...prev.employment, status: e.target.value }
                  }))}
                >
                  <MenuItem value="employed">Employed</MenuItem>
                  <MenuItem value="self-employed">Self-Employed</MenuItem>
                  <MenuItem value="unemployed">Unemployed</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.employment.status === 'employed' || formData.employment.status === 'self-employed') && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={formData.employment.status === 'self-employed' ? 'Business Name' : 'Employer Name'}
                    required
                    fullWidth
                    value={formData.employment.employer}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, employer: e.target.value }
                    }))}
                    InputProps={{
                      startAdornment: <Briefcase size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Job Title/Position"
                    fullWidth
                    value={formData.employment.jobTitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, jobTitle: e.target.value }
                    }))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Employed Since"
                    value={formData.employment.employedSince}
                    onChange={(date) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, employedSince: date }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Monthly Income"
                    fullWidth
                    value={formData.employment.monthlyIncome}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, monthlyIncome: e.target.value }
                    }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Work Phone"
                    fullWidth
                    value={formData.employment.workPhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, workPhone: e.target.value }
                    }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Employer Address</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Street Address"
                    fullWidth
                    value={formData.employment.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, street: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={formData.employment.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, city: e.target.value }
                    }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                      value={formData.employment.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        employment: { ...prev.employment, state: e.target.value }
                      }))}
                    >
                      {states.map(state => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    value={formData.employment.zip}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      employment: { ...prev.employment, zip: e.target.value }
                    }))}
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 3: // Financial Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Additional Income Sources</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Plus size={18} />}
                  onClick={addAdditionalIncome}
                >
                  Add Income
                </Button>
              </Box>
            </Grid>

            {formData.additionalIncome.map((income, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Income Type</InputLabel>
                          <Select
                            value={income.type}
                            onChange={(e) => {
                              const newIncome = [...formData.additionalIncome];
                              newIncome[index].type = e.target.value;
                              setFormData(prev => ({ ...prev, additionalIncome: newIncome }));
                            }}
                          >
                            {incomeTypes.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Monthly Amount"
                          fullWidth
                          value={income.amount}
                          onChange={(e) => {
                            const newIncome = [...formData.additionalIncome];
                            newIncome[index].amount = e.target.value;
                            setFormData(prev => ({ ...prev, additionalIncome: newIncome }));
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Source"
                          fullWidth
                          value={income.source}
                          onChange={(e) => {
                            const newIncome = [...formData.additionalIncome];
                            newIncome[index].source = e.target.value;
                            setFormData(prev => ({ ...prev, additionalIncome: newIncome }));
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeAdditionalIncome(index)}
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {formData.additionalIncome.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Click "Add Income" to include any additional income sources such as rental income, investments, or benefits.
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 4: // Credit Goals
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Primary Credit Goal</InputLabel>
                <Select
                  value={formData.goals.primaryGoal}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    goals: { ...prev.goals, primaryGoal: e.target.value }
                  }))}
                >
                  <MenuItem value="home_purchase">Home Purchase</MenuItem>
                  <MenuItem value="auto_loan">Auto Loan</MenuItem>
                  <MenuItem value="credit_cards">Credit Card Approval</MenuItem>
                  <MenuItem value="personal_loan">Personal Loan</MenuItem>
                  <MenuItem value="refinance">Refinance Existing Debt</MenuItem>
                  <MenuItem value="score_improvement">General Score Improvement</MenuItem>
                  <MenuItem value="rental_approval">Rental Application</MenuItem>
                  <MenuItem value="employment">Employment/Background Check</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Target Date"
                value={formData.goals.targetDate}
                onChange={(date) => setFormData(prev => ({
                  ...prev,
                  goals: { ...prev.goals, targetDate: date }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Target Credit Score"
                required
                fullWidth
                type="number"
                value={formData.goals.targetScore}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  goals: { ...prev.goals, targetScore: e.target.value }
                }))}
                placeholder="e.g., 700"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Specific Needs or Requirements"
                multiline
                rows={3}
                fullWidth
                value={formData.goals.specificNeeds}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  goals: { ...prev.goals, specificNeeds: e.target.value }
                }))}
                placeholder="Tell us about your specific situation or any urgent needs..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select all reasons that apply to items on your credit report:
              </Typography>
              <Box sx={{ mt: 2 }}>
                {disputeReasons.map((reason) => (
                  <FormControlLabel
                    key={reason}
                    control={
                      <Checkbox
                        checked={formData.goals.disputeReasons.includes(reason)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              goals: {
                                ...prev.goals,
                                disputeReasons: [...prev.goals.disputeReasons, reason]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              goals: {
                                ...prev.goals,
                                disputeReasons: prev.goals.disputeReasons.filter(r => r !== reason)
                              }
                            }));
                          }
                        }}
                      />
                    }
                    label={reason}
                    sx={{ width: '100%', mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 5: // Legal History
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning">
                Please answer honestly. This information helps us provide better service and is required for compliance.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.legal.bankruptcyHistory}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, bankruptcyHistory: e.target.checked }
                    }))}
                  />
                }
                label="Have you ever filed for bankruptcy?"
              />
            </Grid>

            {formData.legal.bankruptcyHistory && (
              <>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Bankruptcy Filing Date"
                    value={formData.legal.bankruptcyDate}
                    onChange={(date) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, bankruptcyDate: date }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Bankruptcy Type</InputLabel>
                    <Select
                      value={formData.legal.bankruptcyType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        legal: { ...prev.legal, bankruptcyType: e.target.value }
                      }))}
                    >
                      <MenuItem value="Chapter 7">Chapter 7</MenuItem>
                      <MenuItem value="Chapter 11">Chapter 11</MenuItem>
                      <MenuItem value="Chapter 13">Chapter 13</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Discharge Date"
                    value={formData.legal.bankruptcyDischargeDate}
                    onChange={(date) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, bankruptcyDischargeDate: date }
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.legal.foreclosureHistory}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, foreclosureHistory: e.target.checked }
                    }))}
                  />
                }
                label="Have you had a foreclosure?"
              />
            </Grid>

            {formData.legal.foreclosureHistory && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Foreclosure Date"
                  value={formData.legal.foreclosureDate}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    legal: { ...prev.legal, foreclosureDate: date }
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.legal.judgments}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, judgments: e.target.checked }
                    }))}
                  />
                }
                label="Do you have any judgments against you?"
              />
            </Grid>

            {formData.legal.judgments && (
              <Grid item xs={12}>
                <TextField
                  label="Judgment Details"
                  multiline
                  rows={2}
                  fullWidth
                  value={formData.legal.judgmentDetails}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    legal: { ...prev.legal, judgmentDetails: e.target.value }
                  }))}
                  placeholder="Please provide details about the judgment(s)"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.legal.taxLiens}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      legal: { ...prev.legal, taxLiens: e.target.checked }
                    }))}
                  />
                }
                label="Do you have any tax liens?"
              />
            </Grid>

            {formData.legal.taxLiens && (
              <Grid item xs={12}>
                <TextField
                  label="Tax Lien Details"
                  multiline
                  rows={2}
                  fullWidth
                  value={formData.legal.taxLienDetails}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    legal: { ...prev.legal, taxLienDetails: e.target.value }
                  }))}
                  placeholder="Please provide details about the tax lien(s)"
                />
              </Grid>
            )}
          </Grid>
        );

      case 6: // Review & Submit
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Please review your information carefully before submitting.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Personal Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">
                        {`${formData.firstName} ${formData.middleName} ${formData.lastName} ${formData.suffix}`.trim()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1">
                        {formData.dateOfBirth ? format(formData.dateOfBirth, 'MM/dd/yyyy') : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{formData.email || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{formData.phone || '-'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Current Address</Typography>
                  <Typography variant="body1">
                    {formData.currentAddress.street} {formData.currentAddress.unit}
                  </Typography>
                  <Typography variant="body1">
                    {formData.currentAddress.city}, {formData.currentAddress.state} {formData.currentAddress.zip}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Employment</Typography>
                  <Typography variant="body1">
                    {formData.employment.employer || 'Not provided'}
                  </Typography>
                  {formData.employment.jobTitle && (
                    <Typography variant="body2" color="text.secondary">
                      {formData.employment.jobTitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Authorization & Consent</Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.authorization.accuracyConfirmed}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, accuracyConfirmed: e.target.checked }
                    }))}
                  />
                }
                label="I certify that all information provided is true and accurate to the best of my knowledge"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.authorization.consentToInquiry}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, consentToInquiry: e.target.checked }
                    }))}
                  />
                }
                label="I authorize the company to obtain my credit reports and review my credit history"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.authorization.consentToContact}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      authorization: { ...prev.authorization, consentToContact: e.target.checked }
                    }))}
                  />
                }
                label="I consent to be contacted by phone, email, or SMS regarding my credit repair services"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Electronic Signature (Type your full name)"
                required
                fullWidth
                value={formData.authorization.signature}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  authorization: { ...prev.authorization, signature: e.target.value }
                }))}
                placeholder="Type your full legal name"
              />
              <Typography variant="caption" color="text.secondary">
                By typing your name above, you agree that this serves as your legal electronic signature
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Client Information Sheet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete this form to begin your credit repair journey
          </Typography>
        </Box>

        {/* Saved Forms */}
        {savedForms.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Submissions</Typography>
              <List dense>
                {savedForms.slice(0, 3).map((form) => (
                  <ListItem
                    key={form.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => {
                        setSelectedForm(form);
                        setViewDialogOpen(true);
                      }}>
                        <Eye size={18} />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={`${form.firstName} ${form.lastName}`}
                      secondary={`Status: ${form.status} - ${form.createdAt ? format(form.createdAt.toDate(), 'MM/dd/yyyy') : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Paper sx={{ p: 4 }}>
          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSaveDraft}
                startIcon={<Save size={18} />}
                disabled={loading}
              >
                Save Draft
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<Send size={18} />}
                  disabled={loading}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ChevronRight size={18} />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Loading Indicator */}
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default InformationSheet;