// src/pages/FullAgreement.jsx - Complete Credit Repair Service Agreement
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Divider, Alert, Snackbar,
  Card, CardContent, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup,
  Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, InputAdornment, Chip, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FileText, Download, Send, CheckCircle, Edit, Trash2, Eye, Calendar,
  User, Mail, Phone, MapPin, DollarSign, CreditCard, Shield, AlertCircle,
  Save, Printer, ChevronDown, X, Check
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, doc, query, where, getDocs,
  serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';

const FullAgreement = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const signaturePad = useRef(null);
  const initialsSignature1 = useRef(null);
  const initialsSignature2 = useRef(null);
  const initialsSignature3 = useRef(null);

  // Agreement Data
  const [agreementData, setAgreementData] = useState({
    // Client Information
    client: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      dateOfBirth: null,
      ssn: ''
    },
    
    // Service Selection
    services: {
      package: 'standard', // basic, standard, premium
      addOns: [],
      duration: '6', // months
      customServices: []
    },
    
    // Pricing
    pricing: {
      setupFee: 99,
      monthlyFee: 99,
      discount: 0,
      totalMonthly: 99,
      totalContract: 0,
      paymentPlan: 'monthly' // monthly, quarterly, annual
    },
    
    // Payment Information
    payment: {
      method: 'credit_card', // credit_card, ach, check
      cardLastFour: '',
      bankLastFour: '',
      billingDate: 1, // day of month
      autoRenew: true
    },
    
    // Agreement Terms
    terms: {
      servicePeriod: '6 months',
      cancellationPolicy: 'standard',
      refundPolicy: 'standard',
      disputeResolution: 'arbitration',
      governingLaw: 'California'
    },
    
    // Legal Acknowledgements
    acknowledgements: {
      crraCompliance: false,
      noGuarantees: false,
      rightToCancel: false,
      privacyPolicy: false,
      termsOfService: false,
      electronicSignature: false,
      truthfulInformation: false
    },
    
    // Initials (for important clauses)
    initials: {
      section1: '', // CRRA disclosure
      section2: '', // No guarantees
      section3: '', // Cancellation rights
      clientInitials: '',
      date: null
    },
    
    // Signatures
    signatures: {
      clientSignature: '',
      clientSignatureDate: null,
      companySignature: '',
      companySignatureDate: null,
      witnessSignature: '',
      witnessName: '',
      witnessDate: null
    },
    
    // Status
    status: 'draft', // draft, pending_signature, signed, active, cancelled
    contactId: null,
    agreementNumber: '',
    effectiveDate: null,
    expirationDate: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = [
    'Client Information',
    'Service Selection',
    'Pricing & Payment',
    'Terms & Conditions',
    'Legal Disclosures',
    'Signatures & Submit'
  ];

  const servicePackages = {
    basic: {
      name: 'Basic Package',
      price: 79,
      setupFee: 0,
      features: [
        'Monthly credit report review',
        'Up to 5 dispute items per month',
        'Email support',
        'Educational resources',
        'Progress tracking dashboard'
      ]
    },
    standard: {
      name: 'Standard Package',
      price: 99,
      setupFee: 99,
      features: [
        'Tri-bureau credit monitoring',
        'Unlimited dispute items',
        'Priority email & phone support',
        'Personalized action plan',
        'Monthly progress reports',
        'Credit score simulator',
        'Debt validation letters'
      ]
    },
    premium: {
      name: 'Premium Package',
      price: 149,
      setupFee: 149,
      features: [
        'Everything in Standard, plus:',
        'Dedicated credit specialist',
        '24/7 support',
        'Expedited dispute processing',
        'Identity theft protection',
        'Credit building tools',
        'Goodwill letter assistance',
        'Free consultation calls'
      ]
    }
  };

  const addOnServices = [
    { id: 'expedited', name: 'Expedited Processing', price: 50 },
    { id: 'identity_theft', name: 'Identity Theft Resolution', price: 75 },
    { id: 'business_credit', name: 'Business Credit Building', price: 100 },
    { id: 'tax_lien', name: 'Tax Lien Assistance', price: 200 },
    { id: 'bankruptcy', name: 'Bankruptcy Consultation', price: 150 }
  ];

  // Load contacts
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

  // Load existing agreements
  const loadAgreements = async () => {
    try {
      const q = query(
        collection(db, 'serviceAgreements'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const agreementsData = [];
      
      querySnapshot.forEach((doc) => {
        agreementsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAgreements(agreementsData);
    } catch (error) {
      console.error('Error loading agreements:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadContacts();
      loadAgreements();
    }
  }, [currentUser]);

  // Calculate total pricing
  useEffect(() => {
    const packagePrice = servicePackages[agreementData.services.package].price;
    const setupFee = servicePackages[agreementData.services.package].setupFee;
    
    let addOnTotal = 0;
    agreementData.services.addOns.forEach(addOnId => {
      const addOn = addOnServices.find(a => a.id === addOnId);
      if (addOn) addOnTotal += addOn.price;
    });

    const monthlyTotal = packagePrice + addOnTotal;
    const duration = parseInt(agreementData.services.duration);
    const contractTotal = setupFee + (monthlyTotal * duration);

    setAgreementData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        setupFee,
        monthlyFee: packagePrice,
        totalMonthly: monthlyTotal,
        totalContract: contractTotal
      }
    }));
  }, [agreementData.services]);

  // Generate agreement number
  const generateAgreementNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SCR-${year}${month}-${random}`;
  };

  // Form validation
  const validateStep = (step) => {
    switch (step) {
      case 0: // Client Info
        return agreementData.client.firstName && agreementData.client.lastName &&
               agreementData.client.email && agreementData.client.phone;
      
      case 1: // Services
        return agreementData.services.package && agreementData.services.duration;
      
      case 2: // Payment
        return agreementData.payment.method;
      
      case 3: // Terms
        return true;
      
      case 4: // Disclosures
        return Object.values(agreementData.acknowledgements).every(v => v === true) &&
               agreementData.initials.section1 && agreementData.initials.section2 &&
               agreementData.initials.section3;
      
      case 5: // Signatures
        return agreementData.signatures.clientSignature &&
               agreementData.acknowledgements.electronicSignature;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    } else {
      showSnackbar('Please complete all required fields', 'warning');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Clear signature
  const clearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setAgreementData(prev => ({
        ...prev,
        signatures: { ...prev.signatures, clientSignature: '' }
      }));
    }
  };

  // Save signature
  const saveSignature = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const signature = signaturePad.current.toDataURL();
      setAgreementData(prev => ({
        ...prev,
        signatures: {
          ...prev.signatures,
          clientSignature: signature,
          clientSignatureDate: new Date()
        }
      }));
      showSnackbar('Signature captured', 'success');
    } else {
      showSnackbar('Please provide a signature', 'warning');
    }
  };

  // Save initials
  const saveInitials = (sectionRef, section) => {
    if (sectionRef.current && !sectionRef.current.isEmpty()) {
      const initials = sectionRef.current.toDataURL();
      setAgreementData(prev => ({
        ...prev,
        initials: {
          ...prev.initials,
          [section]: initials,
          date: new Date()
        }
      }));
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const draftData = {
        ...agreementData,
        userId: currentUser.uid,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      if (agreementData.id) {
        await updateDoc(doc(db, 'serviceAgreements', agreementData.id), draftData);
        showSnackbar('Draft updated successfully', 'success');
      } else {
        const agreementNumber = generateAgreementNumber();
        const docRef = await addDoc(collection(db, 'serviceAgreements'), {
          ...draftData,
          agreementNumber,
          createdAt: serverTimestamp()
        });
        setAgreementData(prev => ({ 
          ...prev, 
          id: docRef.id,
          agreementNumber
        }));
        showSnackbar('Draft saved successfully', 'success');
      }
      
      loadAgreements();
    } catch (error) {
      console.error('Error saving draft:', error);
      showSnackbar('Error saving draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit agreement
  const handleSubmit = async () => {
    if (!validateStep(5)) {
      showSnackbar('Please complete all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const effectiveDate = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + parseInt(agreementData.services.duration));

      const submissionData = {
        ...agreementData,
        userId: currentUser.uid,
        status: 'signed',
        effectiveDate,
        expirationDate,
        signatures: {
          ...agreementData.signatures,
          companySignature: 'auto-signed',
          companySignatureDate: new Date()
        },
        completedAt: serverTimestamp()
      };

      if (!agreementData.agreementNumber) {
        submissionData.agreementNumber = generateAgreementNumber();
      }

      if (agreementData.id) {
        await updateDoc(doc(db, 'serviceAgreements', agreementData.id), submissionData);
      } else {
        await addDoc(collection(db, 'serviceAgreements'), {
          ...submissionData,
          createdAt: serverTimestamp()
        });
      }

      // Create/update contact
      if (agreementData.contactId) {
        await updateDoc(doc(db, 'contacts', agreementData.contactId), {
          firstName: agreementData.client.firstName,
          lastName: agreementData.client.lastName,
          email: agreementData.client.email,
          phone: agreementData.client.phone,
          status: 'active',
          updatedAt: serverTimestamp()
        });
      }

      showSnackbar('Agreement signed successfully!', 'success');
      
      setTimeout(() => {
        setActiveStep(0);
        loadAgreements();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting agreement:', error);
      showSnackbar('Error submitting agreement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Client Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Enter the client's information exactly as it appears on their ID
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={agreementData.client.firstName}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, firstName: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={agreementData.client.lastName}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, lastName: e.target.value }
                }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                required
                fullWidth
                type="email"
                value={agreementData.client.email}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, email: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                required
                fullWidth
                value={agreementData.client.phone}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, phone: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Street Address"
                fullWidth
                value={agreementData.client.address}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, address: e.target.value }
                }))}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="City"
                fullWidth
                value={agreementData.client.city}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, city: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="State"
                fullWidth
                value={agreementData.client.state}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, state: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="ZIP Code"
                fullWidth
                value={agreementData.client.zip}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  client: { ...prev.client, zip: e.target.value }
                }))}
              />
            </Grid>
          </Grid>
        );

      case 1: // Service Selection
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Select Service Package</Typography>
            </Grid>

            {Object.entries(servicePackages).map(([key, pkg]) => (
              <Grid item xs={12} md={4} key={key}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    border: agreementData.services.package === key ? 2 : 1,
                    borderColor: agreementData.services.package === key ? 'primary.main' : 'divider'
                  }}
                  onClick={() => setAgreementData(prev => ({
                    ...prev,
                    services: { ...prev.services, package: key }
                  }))}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{pkg.name}</Typography>
                      {agreementData.services.package === key && (
                        <CheckCircle size={24} color="#10B981" />
                      )}
                    </Box>
                    
                    <Typography variant="h4" color="primary" gutterBottom>
                      ${pkg.price}<Typography component="span" variant="body2">/mo</Typography>
                    </Typography>
                    
                    {pkg.setupFee > 0 && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ${pkg.setupFee} setup fee
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List dense>
                      {pkg.features.map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <Check size={16} style={{ marginRight: 8, color: '#10B981' }} />
                          <Typography variant="body2">{feature}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Add-On Services</Typography>
            </Grid>

            {addOnServices.map((addOn) => (
              <Grid item xs={12} md={6} key={addOn.id}>
                <Card variant="outlined">
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agreementData.services.addOns.includes(addOn.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAgreementData(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  addOns: [...prev.services.addOns, addOn.id]
                                }
                              }));
                            } else {
                              setAgreementData(prev => ({
                                ...prev,
                                services: {
                                  ...prev.services,
                                  addOns: prev.services.addOns.filter(id => id !== addOn.id)
                                }
                              }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">{addOn.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            +${addOn.price}/month
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Contract Duration"
                  value={agreementData.services.duration}
                  onChange={(e) => setAgreementData(prev => ({
                    ...prev,
                    services: { ...prev.services, duration: e.target.value }
                  }))}
                  SelectProps={{ native: true }}
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                </TextField>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2: // Pricing & Payment
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Price Summary</Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Setup Fee:</Typography>
                      <Typography fontWeight={600}>${agreementData.pricing.setupFee}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Monthly Service Fee:</Typography>
                      <Typography fontWeight={600}>${agreementData.pricing.monthlyFee}</Typography>
                    </Box>
                    
                    {agreementData.services.addOns.length > 0 && (
                      <Box sx={{ ml: 2, mb: 1 }}>
                        {agreementData.services.addOns.map(addOnId => {
                          const addOn = addOnServices.find(a => a.id === addOnId);
                          return (
                            <Box key={addOnId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                + {addOn.name}
                              </Typography>
                              <Typography variant="body2">${addOn.price}</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">Total Monthly:</Typography>
                      <Typography variant="h6" color="primary">
                        ${agreementData.pricing.totalMonthly}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Contract Value ({agreementData.services.duration} months):
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${agreementData.pricing.totalContract}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Payment Method</Typography>
            </Grid>

            <Grid item xs={12}>
              <RadioGroup
                value={agreementData.payment.method}
                onChange={(e) => setAgreementData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, method: e.target.value }
                }))}
              >
                <FormControlLabel
                  value="credit_card"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard size={20} />
                      <Typography>Credit/Debit Card</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="ach"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DollarSign size={20} />
                      <Typography>Bank Account (ACH)</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Billing Date"
                  value={agreementData.payment.billingDate}
                  onChange={(e) => setAgreementData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, billingDate: parseInt(e.target.value) }
                  }))}
                  SelectProps={{ native: true }}
                  helperText="Day of month for recurring billing"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.payment.autoRenew}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      payment: { ...prev.payment, autoRenew: e.target.checked }
                    }))}
                  />
                }
                label="Auto-renew subscription at the end of contract period"
              />
            </Grid>
          </Grid>
        );

      case 3: // Terms & Conditions
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning">
                Please read these terms carefully before proceeding
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6">Service Terms</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    <strong>1. Services Provided:</strong> We will analyze your credit reports, identify negative items, 
                    and dispute inaccurate, unverifiable, or outdated information with credit bureaus on your behalf.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>2. Service Period:</strong> This agreement is valid for {agreementData.services.duration} months 
                    from the effective date. Services will continue month-to-month unless either party provides written notice 
                    of cancellation at least 30 days in advance.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>3. Client Responsibilities:</strong> You agree to provide accurate information, respond to requests 
                    promptly, and notify us of any changes to your credit reports.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6">Cancellation & Refund Policy</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    <strong>Right to Cancel:</strong> You have the right to cancel this contract within 3 business days 
                    from signing for a full refund of any fees paid.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>After 3-Day Period:</strong> Setup fees are non-refundable. Monthly fees are refundable on 
                    a pro-rata basis if you cancel mid-month with 30 days written notice.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Cancellation Process:</strong> To cancel, send written notice via email or certified mail to 
                    our billing department.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6">Payment Terms</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    <strong>Billing:</strong> You authorize us to charge your payment method on the {agreementData.payment.billingDate}
                    {agreementData.payment.billingDate === 1 ? 'st' : agreementData.payment.billingDate === 2 ? 'nd' : 
                      agreementData.payment.billingDate === 3 ? 'rd' : 'th'} of each month.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Failed Payments:</strong> If payment fails, services may be suspended until payment is received. 
                    A $25 fee may apply for failed payment attempts.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Price Changes:</strong> We reserve the right to change prices with 30 days written notice.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6">Dispute Resolution</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    Any disputes arising from this agreement shall be resolved through binding arbitration in accordance 
                    with the rules of the American Arbitration Association. The arbitration shall take place in 
                    {agreementData.terms.governingLaw}.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        );

      case 4: // Legal Disclosures
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="error" icon={<AlertCircle />}>
                <Typography variant="subtitle2" gutterBottom>
                  IMPORTANT LEGAL DISCLOSURES - Please read and initial each section
                </Typography>
              </Alert>
            </Grid>

            {/* CRRA Compliance */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Credit Repair Organizations Act (CRRA) Disclosure
                  </Typography>
                  <Typography variant="body2" paragraph>
                    You have the right to dispute inaccurate information in your credit report yourself, 
                    at no cost, by contacting the credit bureaus directly. You may obtain a free copy of 
                    your credit report from AnnualCreditReport.com or by calling 1-877-322-8228.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    No credit repair company can legally remove accurate and timely negative information 
                    from your credit report. Any company that tells you they can is lying.
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ border: 1, borderColor: 'divider', p: 1, width: 200, height: 60 }}>
                      <SignatureCanvas
                        ref={initialsSignature1}
                        canvasProps={{ width: 180, height: 40 }}
                        onEnd={() => saveInitials(initialsSignature1, 'section1')}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Initial here</Typography>
                      <Button 
                        size="small" 
                        onClick={() => initialsSignature1.current?.clear()}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* No Guarantees */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    No Guarantees of Results
                  </Typography>
                  <Typography variant="body2" paragraph>
                    We cannot and do not guarantee specific results or score improvements. Results vary 
                    based on individual circumstances, the accuracy of information being disputed, and 
                    responses from credit bureaus and furnishers.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Credit repair is a process that typically takes 3-6 months or longer. Some items may 
                    not be removable if they are accurate and verified.
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ border: 1, borderColor: 'divider', p: 1, width: 200, height: 60 }}>
                      <SignatureCanvas
                        ref={initialsSignature2}
                        canvasProps={{ width: 180, height: 40 }}
                        onEnd={() => saveInitials(initialsSignature2, 'section2')}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Initial here</Typography>
                      <Button 
                        size="small" 
                        onClick={() => initialsSignature2.current?.clear()}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Cancellation Rights */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Your Cancellation Rights
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>3-Day Right to Cancel:</strong> You may cancel this contract without penalty or 
                    obligation within 3 business days from the date you sign this agreement.
                  </Typography>
                  <Typography variant="body2" paragraph>
                    To cancel, send written notice to: [Company Address] or email: cancel@company.com
                  </Typography>
                  <Typography variant="body2" paragraph>
                    If you cancel within 3 business days, any fees you paid will be refunded within 10 business days.
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ border: 1, borderColor: 'divider', p: 1, width: 200, height: 60 }}>
                      <SignatureCanvas
                        ref={initialsSignature3}
                        canvasProps={{ width: 180, height: 40 }}
                        onEnd={() => saveInitials(initialsSignature3, 'section3')}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption">Initial here</Typography>
                      <Button 
                        size="small" 
                        onClick={() => initialsSignature3.current?.clear()}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Acknowledgements Checkboxes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Required Acknowledgements
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.crraCompliance}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, crraCompliance: e.target.checked }
                    }))}
                  />
                }
                label="I have read and understand the CRRA disclosure"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.noGuarantees}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, noGuarantees: e.target.checked }
                    }))}
                  />
                }
                label="I understand there are no guarantees of specific results"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.rightToCancel}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, rightToCancel: e.target.checked }
                    }))}
                  />
                }
                label="I understand my right to cancel within 3 business days"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.privacyPolicy}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, privacyPolicy: e.target.checked }
                    }))}
                  />
                }
                label="I have read and agree to the Privacy Policy"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.termsOfService}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, termsOfService: e.target.checked }
                    }))}
                  />
                }
                label="I have read and agree to the Terms of Service"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.truthfulInformation}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, truthfulInformation: e.target.checked }
                    }))}
                  />
                }
                label="I certify that all information provided is truthful and accurate"
              />
            </Grid>
          </Grid>
        );

      case 5: // Signatures
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="success">
                You're almost done! Please review and sign below.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Agreement Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Client Name</Typography>
                      <Typography variant="body1">
                        {agreementData.client.firstName} {agreementData.client.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Agreement Number</Typography>
                      <Typography variant="body1">
                        {agreementData.agreementNumber || 'Will be generated'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Service Package</Typography>
                      <Typography variant="body1">
                        {servicePackages[agreementData.services.package].name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Monthly Payment</Typography>
                      <Typography variant="body1">
                        ${agreementData.pricing.totalMonthly}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contract Duration</Typography>
                      <Typography variant="body1">
                        {agreementData.services.duration} months
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Total Contract Value</Typography>
                      <Typography variant="body1">
                        ${agreementData.pricing.totalContract}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreementData.acknowledgements.electronicSignature}
                    onChange={(e) => setAgreementData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, electronicSignature: e.target.checked }
                    }))}
                  />
                }
                label="I agree to use electronic signature and that it has the same legal effect as a handwritten signature"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Client Signature</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sign in the box below using your mouse or touchscreen
              </Typography>
              
              <Box sx={{ 
                border: 2, 
                borderColor: 'divider', 
                borderRadius: 1,
                p: 2,
                backgroundColor: 'background.paper'
              }}>
                <SignatureCanvas
                  ref={signaturePad}
                  canvasProps={{ 
                    width: 600, 
                    height: 200,
                    style: { width: '100%', height: 'auto' }
                  }}
                />
              </Box>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={clearSignature}>
                  Clear Signature
                </Button>
                <Button variant="contained" onClick={saveSignature}>
                  Accept Signature
                </Button>
              </Stack>

              {agreementData.signatures.clientSignature && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <CheckCircle size={18} /> Signature captured successfully
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                By signing this agreement, you acknowledge that you have read, understood, and agree to all terms 
                and conditions outlined in this service agreement. You confirm that all information provided is 
                accurate and complete.
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
            Service Agreement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Credit Repair Services Contract
          </Typography>
        </Box>

        {/* Recent Agreements */}
        {agreements.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Agreements</Typography>
              <List dense>
                {agreements.slice(0, 3).map((agreement) => (
                  <ListItem
                    key={agreement.id}
                    secondaryAction={
                      <Chip 
                        label={agreement.status} 
                        size="small"
                        color={agreement.status === 'signed' ? 'success' : 'default'}
                      />
                    }
                  >
                    <ListItemText
                      primary={`${agreement.client?.firstName} ${agreement.client?.lastName}`}
                      secondary={`${agreement.agreementNumber} - ${
                        agreement.createdAt ? format(agreement.createdAt.toDate(), 'MM/dd/yyyy') : ''
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Main Agreement Form */}
        <Paper sx={{ p: 4 }}>
          {/* Stepper */}
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

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
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
                  disabled={loading || !validateStep(5)}
                >
                  Submit Agreement
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

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

export default FullAgreement;