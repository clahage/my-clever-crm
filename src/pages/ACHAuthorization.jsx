// src/pages/ACHAuthorization.jsx - ACH/Credit Card Payment Authorization
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Divider, Alert, Snackbar,
  Card, CardContent, FormControl, FormControlLabel, Checkbox, Radio, RadioGroup,
  Stack, IconButton, InputLabel, Select, MenuItem, Chip, LinearProgress,
  Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CreditCard as LucideCreditCard, DollarSign, Send, CheckCircle, Shield, User, Mail, Phone,
  Save, Eye, Trash2, Lock, AlertCircle, Info, Calendar
} from 'lucide-react';
import {
  collection, addDoc, updateDoc, doc, query, where, getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';

const ACHAuthorization = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const signaturePad = useRef(null);

  // Authorization Data
  const [authData, setAuthData] = useState({
    // Account Holder Information
    accountHolder: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      }
    },

    // Payment Method
    paymentMethod: 'ach', // ach, credit_card, debit_card

    // ACH/Bank Information
    bankInfo: {
      accountType: 'checking', // checking, savings
      routingNumber: '',
      accountNumber: '',
      accountNumberConfirm: '',
      bankName: '',
      accountHolderName: ''
    },

    // Credit/Debit Card Information
    cardInfo: {
      cardNumber: '',
      cardNumberMasked: '',
      cardholderName: '',
      expirationMonth: '',
      expirationYear: '',
      cvv: '',
      billingZip: '',
      cardType: '' // visa, mastercard, amex, discover
    },

    // Payment Schedule
    paymentSchedule: {
      frequency: 'monthly', // one-time, monthly, quarterly, annual
      amount: 0,
      startDate: new Date(),
      billingDay: 1, // day of month
      endDate: null,
      indefinite: true
    },

    // Authorization Details
    authorization: {
      setupFee: 0,
      monthlyAmount: 0,
      firstPaymentDate: new Date(),
      recurringPayments: true,
      variableAmounts: false,
      prenotification: true, // Send notification before each payment
      notificationDays: 3 // Days before payment
    },

    // Legal Acknowledgements
    acknowledgements: {
      authorizePayments: false,
      accurateInformation: false,
      nsfFees: false, // Understand NSF fees
      revocationRights: false,
      electronicSignature: false,
      termsAndConditions: false
    },

    // Signature
    signature: {
      accountHolderSignature: '',
      signatureDate: null,
      ipAddress: '',
      userAgent: ''
    },

    // Status & Tracking
    status: 'draft', // draft, active, cancelled, failed
    contactId: null,
    authNumber: '',
    activatedDate: null,
    cancelledDate: null,
    cancelReason: '',
    lastPaymentDate: null,
    nextPaymentDate: null,
    totalPaymentsProcessed: 0
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // ===== AI ENHANCEMENT STATES =====
  // AI Fraud Detection
  const [fraudScore, setFraudScore] = useState(null);
  const [fraudWarnings, setFraudWarnings] = useState([]);
  const [fraudCheckComplete, setFraudCheckComplete] = useState(false);
  const [fraudLoading, setFraudLoading] = useState(false);

  // AI Payment Risk Assessment
  const [paymentRiskAnalysis, setPaymentRiskAnalysis] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // AI Bank Verification
  const [bankVerification, setBankVerification] = useState(null);
  const [bankVerifyLoading, setBankVerifyLoading] = useState(false);

  // AI Payment Success Predictor
  const [paymentPrediction, setPaymentPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // ===== AI ENHANCEMENT FUNCTIONS =====

  // Function 1: Detect Fraud
  const detectFraud = async () => {
    setFraudLoading(true);
    try {
      console.log('Starting AI fraud detection...');
      const functions = getFunctions();
      const checkFraud = httpsCallable(functions, 'detectPaymentFraud');

      // Get IP address
      let ipAddress = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (e) {
        console.error('IP fetch error:', e);
      }

      const result = await checkFraud({
        paymentMethod: authData.paymentMethod,
        amount: authData.authorization.monthlyAmount,
        accountHolder: authData.accountHolder,
        bankInfo: {
          routingNumber: authData.bankInfo.routingNumber,
          bankName: authData.bankInfo.bankName,
          accountType: authData.bankInfo.accountType
        },
        cardInfo: authData.paymentMethod.includes('card') ? {
          cardType: authData.cardInfo.cardType,
          billingZip: authData.cardInfo.billingZip
        } : null,
        ipAddress,
        deviceFingerprint: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      console.log('Fraud detection result:', result.data);
      setFraudScore(result.data.riskScore);
      setFraudWarnings(result.data.warnings || []);
      setFraudCheckComplete(true);

      showSnackbar(`Fraud Risk Score: ${result.data.riskScore}/100`,
        result.data.riskScore > 70 ? 'error' : result.data.riskScore > 50 ? 'warning' : 'success'
      );

      return result.data.riskScore < 70;
    } catch (error) {
      console.error('Fraud detection error:', error);
      showSnackbar('Fraud check unavailable - proceeding with caution', 'warning');
      return true;
    } finally {
      setFraudLoading(false);
    }
  };

  // Function 2: Assess Payment Risk
  const assessPaymentRisk = async () => {
    if (!authData.authorization.monthlyAmount || authData.authorization.monthlyAmount === 0) {
      return;
    }

    setRiskLoading(true);
    try {
      console.log('Starting AI payment risk assessment...');
      const functions = getFunctions();
      const assessRisk = httpsCallable(functions, 'assessPaymentRisk');

      const result = await assessRisk({
        frequency: authData.paymentSchedule.frequency,
        amount: authData.authorization.monthlyAmount,
        billingDay: authData.paymentSchedule.billingDay,
        accountType: authData.bankInfo.accountType,
        paymentMethod: authData.paymentMethod,
        setupFee: authData.authorization.setupFee,
        income: authData.accountHolder.estimatedIncome || 5000
      });

      console.log('Payment risk assessment result:', result.data);
      setPaymentRiskAnalysis(result.data);
    } catch (error) {
      console.error('Payment risk assessment error:', error);
    } finally {
      setRiskLoading(false);
    }
  };

  // Function 3: Verify Bank
  const verifyBank = async () => {
    if (!authData.bankInfo.routingNumber || authData.bankInfo.routingNumber.length !== 9) {
      return;
    }

    setBankVerifyLoading(true);
    try {
      console.log('Starting AI bank verification...');
      const functions = getFunctions();
      const verify = httpsCallable(functions, 'verifyBankInfo');

      const result = await verify({
        routingNumber: authData.bankInfo.routingNumber,
        accountType: authData.bankInfo.accountType
      });

      console.log('Bank verification result:', result.data);
      setBankVerification(result.data);

      if (result.data.bankName && !authData.bankInfo.bankName) {
        setAuthData(prev => ({
          ...prev,
          bankInfo: { ...prev.bankInfo, bankName: result.data.bankName }
        }));
        showSnackbar(`Bank verified: ${result.data.bankName}`, 'success');
      }
    } catch (error) {
      console.error('Bank verification error:', error);
    } finally {
      setBankVerifyLoading(false);
    }
  };

  // Function 4: Predict Payment Success
  const predictPaymentSuccess = async () => {
    setPredictionLoading(true);
    try {
      console.log('Starting AI payment prediction...');
      const functions = getFunctions();
      const predict = httpsCallable(functions, 'predictPaymentSuccess');

      const result = await predict({
        amount: authData.authorization.monthlyAmount,
        frequency: authData.paymentSchedule.frequency,
        paymentMethod: authData.paymentMethod,
        accountType: authData.bankInfo.accountType,
        billingDay: authData.paymentSchedule.billingDay
      });

      console.log('Payment prediction result:', result.data);
      setPaymentPrediction(result.data);
    } catch (error) {
      console.error('Payment prediction error:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Auto-verify bank when routing number is complete
  useEffect(() => {
    if (authData.bankInfo.routingNumber.length === 9 && authData.paymentMethod === 'ach') {
      verifyBank();
    }
  }, [authData.bankInfo.routingNumber]);

  // Auto-assess payment risk when payment details change
  useEffect(() => {
    if (authData.authorization.monthlyAmount > 0 && authData.paymentSchedule.frequency) {
      const timer = setTimeout(() => {
        assessPaymentRisk();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authData.authorization.monthlyAmount, authData.paymentSchedule.frequency, authData.paymentSchedule.billingDay]);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const months = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

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

  // Load authorizations
  const loadAuthorizations = async () => {
    try {
      const q = query(
        collection(db, 'paymentAuthorizations'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const authsData = [];
      
      querySnapshot.forEach((doc) => {
        authsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAuthorizations(authsData);
    } catch (error) {
      console.error('Error loading authorizations:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadContacts();
      loadAuthorizations();
    }
  }, [currentUser]);

  // Detect card type from number
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return '';
  };

  // Mask card number
  const maskCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.length < 4) return number;
    return `****-****-****-${cleaned.slice(-4)}`;
  };

  // Format card number for display
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  // Validate routing number
  const validateRoutingNumber = (routing) => {
    if (routing.length !== 9) return false;
    
    // ABA routing number checksum validation
    const digits = routing.split('').map(Number);
    const checksum = (
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      (digits[2] + digits[5] + digits[8])
    ) % 10;
    
    return checksum === 0;
  };

  // Generate authorization number
  const generateAuthNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `AUTH-${year}${month}-${random}`;
  };

  // Validate form
  const validateForm = () => {
    if (!authData.accountHolder.firstName || !authData.accountHolder.lastName) {
      showSnackbar('Please enter account holder name', 'warning');
      return false;
    }

    if (authData.paymentMethod === 'ach') {
      if (!authData.bankInfo.routingNumber || !authData.bankInfo.accountNumber) {
        showSnackbar('Please enter bank account information', 'warning');
        return false;
      }
      if (authData.bankInfo.accountNumber !== authData.bankInfo.accountNumberConfirm) {
        showSnackbar('Account numbers do not match', 'warning');
        return false;
      }
      if (!validateRoutingNumber(authData.bankInfo.routingNumber)) {
        showSnackbar('Invalid routing number', 'warning');
        return false;
      }
    }

    if (authData.paymentMethod === 'credit_card' || authData.paymentMethod === 'debit_card') {
      if (!authData.cardInfo.cardNumber || !authData.cardInfo.expirationMonth || 
          !authData.cardInfo.expirationYear || !authData.cardInfo.cvv) {
        showSnackbar('Please complete card information', 'warning');
        return false;
      }
    }

    if (!Object.values(authData.acknowledgements).every(v => v === true)) {
      showSnackbar('Please accept all required acknowledgements', 'warning');
      return false;
    }

    if (!authData.signature.accountHolderSignature) {
      showSnackbar('Please provide your signature', 'warning');
      return false;
    }

    return true;
  };

  // Clear signature
  const clearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setAuthData(prev => ({
        ...prev,
        signature: { ...prev.signature, accountHolderSignature: '' }
      }));
    }
  };

  // Save signature
  const saveSignature = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const signature = signaturePad.current.toDataURL();
      setAuthData(prev => ({
        ...prev,
        signature: {
          ...prev.signature,
          accountHolderSignature: signature,
          signatureDate: new Date()
        }
      }));
      showSnackbar('Signature captured', 'success');
    } else {
      showSnackbar('Please provide a signature', 'warning');
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Mask sensitive data before saving
      const draftData = {
        ...authData,
        bankInfo: {
          ...authData.bankInfo,
          accountNumber: authData.bankInfo.accountNumber ? 
            `****${authData.bankInfo.accountNumber.slice(-4)}` : '',
          accountNumberConfirm: ''
        },
        cardInfo: {
          ...authData.cardInfo,
          cardNumber: authData.cardInfo.cardNumber ? 
            maskCardNumber(authData.cardInfo.cardNumber) : '',
          cvv: '' // Never store CVV
        },
        userId: currentUser.uid,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      if (authData.id) {
        await updateDoc(doc(db, 'paymentAuthorizations', authData.id), draftData);
        showSnackbar('Draft updated successfully', 'success');
      } else {
        const authNumber = generateAuthNumber();
        const docRef = await addDoc(collection(db, 'paymentAuthorizations'), {
          ...draftData,
          authNumber,
          createdAt: serverTimestamp()
        });
        setAuthData(prev => ({ 
          ...prev, 
          id: docRef.id,
          authNumber
        }));
        showSnackbar('Draft saved successfully', 'success');
      }
      
      loadAuthorizations();
    } catch (error) {
      console.error('Error saving draft:', error);
      showSnackbar('Error saving draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit authorization
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // ===== RUN AI FRAUD DETECTION FIRST =====
    const fraudCheckPassed = await detectFraud();

    if (!fraudCheckPassed) {
      showSnackbar('Transaction flagged as high risk. Please contact support.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      // Calculate next payment date
      const nextPaymentDate = new Date(authData.paymentSchedule.startDate);
      if (authData.paymentSchedule.frequency === 'monthly') {
        nextPaymentDate.setDate(authData.paymentSchedule.billingDay);
      }

      const submissionData = {
        ...authData,
        // Mask sensitive data
        bankInfo: {
          ...authData.bankInfo,
          accountNumber: authData.bankInfo.accountNumber ? 
            `****${authData.bankInfo.accountNumber.slice(-4)}` : '',
          accountNumberConfirm: ''
        },
        cardInfo: {
          ...authData.cardInfo,
          cardNumber: authData.cardInfo.cardNumber ? 
            maskCardNumber(authData.cardInfo.cardNumber) : '',
          cvv: '' // Never store CVV
        },
        signature: {
          ...authData.signature,
          ipAddress: ipData.ip,
          userAgent: navigator.userAgent
        },
        userId: currentUser.uid,
        status: 'active',
        activatedDate: new Date(),
        nextPaymentDate,
        completedAt: serverTimestamp()
      };

      if (!authData.authNumber) {
        submissionData.authNumber = generateAuthNumber();
      }

      if (authData.id) {
        await updateDoc(doc(db, 'paymentAuthorizations', authData.id), submissionData);
      } else {
        await addDoc(collection(db, 'paymentAuthorizations'), {
          ...submissionData,
          createdAt: serverTimestamp()
        });
      }

      // Update contact with payment info
      if (authData.contactId) {
        await updateDoc(doc(db, 'contacts', authData.contactId), {
          paymentMethod: authData.paymentMethod,
          paymentActive: true,
          updatedAt: serverTimestamp()
        });
      }

      showSnackbar('Payment authorization submitted successfully!', 'success');
      
      setTimeout(() => {
        loadAuthorizations();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting authorization:', error);
      showSnackbar('Error submitting authorization', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel authorization
  const handleCancel = async (authId) => {
    if (!window.confirm('Are you sure you want to cancel this payment authorization?')) return;

    try {
      await updateDoc(doc(db, 'paymentAuthorizations', authId), {
        status: 'cancelled',
        cancelledDate: new Date(),
        cancelReason: 'Cancelled by user',
        updatedAt: serverTimestamp()
      });

      showSnackbar('Payment authorization cancelled', 'success');
      loadAuthorizations();
    } catch (error) {
      console.error('Error cancelling authorization:', error);
      showSnackbar('Error cancelling authorization', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Payment Authorization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ACH and credit card payment authorization form
          </Typography>
        </Box>

        {/* Security Notice */}
        <Alert severity="info" icon={<Shield />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Your payment information is secure
          </Typography>
          <Typography variant="body2">
            We use bank-level encryption to protect your financial information. We never store 
            complete card numbers or CVV codes.
          </Typography>
        </Alert>

        {/* Existing Authorizations */}
        {authorizations.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Payment Methods</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Holder</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Next Payment</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {authorizations.map((auth) => (
                      <TableRow key={auth.id}>
                        <TableCell>
                          {auth.accountHolder?.firstName} {auth.accountHolder?.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={auth.paymentMethod === 'ach' ? <DollarSign size={14} /> : <LucideCreditCard size={14} />}
                            label={auth.paymentMethod === 'ach' ? 'Bank Account' : 'Card'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${auth.authorization?.monthlyAmount || 0}/mo</TableCell>
                        <TableCell>
                          <Chip 
                            label={auth.status}
                            size="small"
                            color={
                              auth.status === 'active' ? 'success' :
                              auth.status === 'cancelled' ? 'error' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {auth.nextPaymentDate ? format(
                            auth.nextPaymentDate.toDate ? auth.nextPaymentDate.toDate() : new Date(auth.nextPaymentDate),
                            'MM/dd/yyyy'
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                              <Eye size={16} />
                            </IconButton>
                            {auth.status === 'active' && (
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleCancel(auth.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Account Holder Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Holder Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                onChange={(e, value) => {
                  if (value) {
                    setAuthData(prev => ({
                      ...prev,
                      contactId: value.id,
                      accountHolder: {
                        ...prev.accountHolder,
                        firstName: value.firstName || '',
                        lastName: value.lastName || '',
                        email: value.email || '',
                        phone: value.phone || ''
                      }
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Existing Client (Optional)" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={authData.accountHolder.firstName}
                onChange={(e) => setAuthData(prev => ({
                  ...prev,
                  accountHolder: { ...prev.accountHolder, firstName: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={authData.accountHolder.lastName}
                onChange={(e) => setAuthData(prev => ({
                  ...prev,
                  accountHolder: { ...prev.accountHolder, lastName: e.target.value }
                }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                required
                fullWidth
                type="email"
                value={authData.accountHolder.email}
                onChange={(e) => setAuthData(prev => ({
                  ...prev,
                  accountHolder: { ...prev.accountHolder, email: e.target.value }
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
                value={authData.accountHolder.phone}
                onChange={(e) => setAuthData(prev => ({
                  ...prev,
                  accountHolder: { ...prev.accountHolder, phone: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            {/* Payment Method Selection */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonGroup
                value={authData.paymentMethod}
                exclusive
                onChange={(e, value) => value && setAuthData(prev => ({ ...prev, paymentMethod: value }))}
                fullWidth
              >
                <ToggleButton value="ach">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DollarSign size={20} />
                    <Box>
                      <Typography variant="body2">Bank Account (ACH)</Typography>
                      <Typography variant="caption">No processing fees</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="credit_card">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LucideCreditCard size={20} />
                    <Box>
                      <Typography variant="body2">Credit Card</Typography>
                      <Typography variant="caption">Instant processing</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="debit_card">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LucideCreditCard size={20} />
                    <Box>
                      <Typography variant="body2">Debit Card</Typography>
                      <Typography variant="caption">Direct from checking</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* ACH/Bank Information */}
            {authData.paymentMethod === 'ach' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Bank Account Information
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You can find your routing and account numbers on your checks or bank statement
                  </Alert>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={authData.bankInfo.accountType}
                      onChange={(e) => setAuthData(prev => ({
                        ...prev,
                        bankInfo: { ...prev.bankInfo, accountType: e.target.value }
                      }))}
                    >
                      <MenuItem value="checking">Checking</MenuItem>
                      <MenuItem value="savings">Savings</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bank Name"
                    fullWidth
                    value={authData.bankInfo.bankName}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, bankName: e.target.value }
                    }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Routing Number"
                    required
                    fullWidth
                    value={authData.bankInfo.routingNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setAuthData(prev => ({
                        ...prev,
                        bankInfo: { ...prev.bankInfo, routingNumber: value }
                      }));
                    }}
                    placeholder="9 digits"
                    error={Boolean(authData.bankInfo.routingNumber.length === 9 && !validateRoutingNumber(authData.bankInfo.routingNumber))}
                    helperText={authData.bankInfo.routingNumber.length === 9 && !validateRoutingNumber(authData.bankInfo.routingNumber) ? 'Invalid routing number' : ''}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Holder Name"
                    fullWidth
                    value={authData.bankInfo.accountHolderName}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, accountHolderName: e.target.value }
                    }))}
                    placeholder="Name on account"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Number"
                    required
                    fullWidth
                    type="password"
                    value={authData.bankInfo.accountNumber}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, accountNumber: e.target.value.replace(/\D/g, '') }
                    }))}
                    InputProps={{
                      startAdornment: <Lock size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Confirm Account Number"
                    required
                    fullWidth
                    type="password"
                    value={authData.bankInfo.accountNumberConfirm}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      bankInfo: { ...prev.bankInfo, accountNumberConfirm: e.target.value.replace(/\D/g, '') }
                    }))}
                    error={Boolean(authData.bankInfo.accountNumberConfirm && authData.bankInfo.accountNumber !== authData.bankInfo.accountNumberConfirm)}
                    helperText={authData.bankInfo.accountNumberConfirm && authData.bankInfo.accountNumber !== authData.bankInfo.accountNumberConfirm ? 'Account numbers must match' : ''}
                  />
                </Grid>
              </>
            )}

            {/* Credit/Debit Card Information */}
            {(authData.paymentMethod === 'credit_card' || authData.paymentMethod === 'debit_card') && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Card Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Cardholder Name"
                    required
                    fullWidth
                    value={authData.cardInfo.cardholderName}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      cardInfo: { ...prev.cardInfo, cardholderName: e.target.value }
                    }))}
                    placeholder="Name as it appears on card"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Card Number"
                    required
                    fullWidth
                    value={authData.cardInfo.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = formatCardNumber(value);
                      const cardType = detectCardType(value);
                      setAuthData(prev => ({
                        ...prev,
                        cardInfo: { 
                          ...prev.cardInfo, 
                          cardNumber: formatted,
                          cardType
                        }
                      }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    InputProps={{
                      startAdornment: <LucideCreditCard size={18} style={{ marginRight: 8 }} />,
                      endAdornment: authData.cardInfo.cardType && (
                        <Chip label={authData.cardInfo.cardType.toUpperCase()} size="small" />
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Exp. Month</InputLabel>
                    <Select
                      value={authData.cardInfo.expirationMonth}
                      onChange={(e) => setAuthData(prev => ({
                        ...prev,
                        cardInfo: { ...prev.cardInfo, expirationMonth: e.target.value }
                      }))}
                    >
                      {months.map(month => (
                        <MenuItem key={month} value={month}>{month}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Exp. Year</InputLabel>
                    <Select
                      value={authData.cardInfo.expirationYear}
                      onChange={(e) => setAuthData(prev => ({
                        ...prev,
                        cardInfo: { ...prev.cardInfo, expirationYear: e.target.value }
                      }))}
                    >
                      {years.map(year => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="CVV"
                    required
                    fullWidth
                    value={authData.cardInfo.cvv}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      cardInfo: { ...prev.cardInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }
                    }))}
                    placeholder="123"
                    InputProps={{
                      startAdornment: <Lock size={18} style={{ marginRight: 8 }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Billing ZIP Code"
                    required
                    fullWidth
                    value={authData.cardInfo.billingZip}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      cardInfo: { ...prev.cardInfo, billingZip: e.target.value.replace(/\D/g, '').slice(0, 5) }
                    }))}
                    placeholder="12345"
                  />
                </Grid>
              </>
            )}

            {/* Payment Schedule */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment Schedule
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Payment Frequency</InputLabel>
                <Select
                  value={authData.paymentSchedule.frequency}
                  onChange={(e) => setAuthData(prev => ({
                    ...prev,
                    paymentSchedule: { ...prev.paymentSchedule, frequency: e.target.value }
                  }))}
                >
                  <MenuItem value="one-time">One-time Payment</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Payment Amount"
                required
                fullWidth
                type="number"
                value={authData.authorization.monthlyAmount}
                onChange={(e) => setAuthData(prev => ({
                  ...prev,
                  authorization: { ...prev.authorization, monthlyAmount: parseFloat(e.target.value) || 0 }
                }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>

            {authData.paymentSchedule.frequency === 'monthly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Billing Day</InputLabel>
                  <Select
                    value={authData.paymentSchedule.billingDay}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      paymentSchedule: { ...prev.paymentSchedule, billingDay: e.target.value }
                    }))}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <MenuItem key={day} value={day}>
                        Day {day} of each month
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <DatePicker
                label="First Payment Date"
                value={authData.authorization.firstPaymentDate}
                onChange={(date) => setAuthData(prev => ({
                  ...prev,
                  authorization: { ...prev.authorization, firstPaymentDate: date }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            {authData.authorization.setupFee > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Setup fee of ${authData.authorization.setupFee} will be charged with your first payment
                </Alert>
              </Grid>
            )}

            {/* ===== AI ENHANCEMENT SECTION ===== */}

            {/* AI Fraud Detection Alert */}
            {fraudCheckComplete && (
              <Grid item xs={12}>
                <Alert
                  severity={fraudScore > 70 ? 'error' : fraudScore > 50 ? 'warning' : 'success'}
                  icon={fraudScore > 70 ? <AlertCircle /> : <Shield />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    AI Fraud Detection: Risk Score {fraudScore}/100
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {fraudScore > 70 ? 'HIGH RISK - Additional verification required' :
                     fraudScore > 50 ? 'MODERATE RISK - Please review payment details' :
                     'LOW RISK - Payment information looks secure'}
                  </Typography>

                  {fraudWarnings.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {fraudWarnings.map((warning, idx) => (
                        <Typography key={idx} variant="caption" display="block" color="text.secondary">
                          • {warning}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Alert>
              </Grid>
            )}

            {/* AI Payment Risk Analysis */}
            {paymentRiskAnalysis && (
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor: paymentRiskAnalysis.riskLevel === 'low' ? 'success.main' :
                                 paymentRiskAnalysis.riskLevel === 'medium' ? 'warning.main' : 'error.main',
                    borderWidth: 2
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Shield size={32} color={
                        paymentRiskAnalysis.riskLevel === 'low' ? '#4caf50' :
                        paymentRiskAnalysis.riskLevel === 'medium' ? '#ff9800' : '#f44336'
                      } />
                      <Box flex={1}>
                        <Typography variant="h6">
                          AI Payment Risk Analysis
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          AI-powered payment success prediction
                        </Typography>
                      </Box>
                      <Chip
                        label={`${paymentRiskAnalysis.riskLevel?.toUpperCase()} RISK`}
                        color={
                          paymentRiskAnalysis.riskLevel === 'low' ? 'success' :
                          paymentRiskAnalysis.riskLevel === 'medium' ? 'warning' : 'error'
                        }
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {paymentRiskAnalysis.successProbability}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Success Rate
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {paymentRiskAnalysis.affordabilityScore}/10
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Affordability
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {paymentRiskAnalysis.optimalDay}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Optimal Day
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {paymentRiskAnalysis.alternativeFrequency}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Best Frequency
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {paymentRiskAnalysis.recommendations?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          AI Recommendations:
                        </Typography>
                        {paymentRiskAnalysis.recommendations.map((rec, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            • {rec}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* AI Bank Verification */}
            {bankVerification && authData.paymentMethod === 'ach' && (
              <Grid item xs={12}>
                <Alert severity="success" icon={<CheckCircle />}>
                  <Typography variant="subtitle2">Bank Verified</Typography>
                  <Typography variant="body2">
                    {bankVerification.bankName} - {bankVerification.routingValid ? 'Valid Routing Number' : 'Unverified'}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Legal Acknowledgements */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Authorization & Acknowledgements
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.authorizePayments}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, authorizePayments: e.target.checked }
                    }))}
                  />
                }
                label="I authorize recurring payments to be automatically deducted from my account"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.accurateInformation}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, accurateInformation: e.target.checked }
                    }))}
                  />
                }
                label="I certify that the information provided is accurate and I am authorized to use this payment method"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.nsfFees}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, nsfFees: e.target.checked }
                    }))}
                  />
                }
                label="I understand that insufficient funds may result in NSF fees from my bank and service disruption"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.revocationRights}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, revocationRights: e.target.checked }
                    }))}
                  />
                }
                label="I understand I can revoke this authorization by providing 30 days written notice"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.termsAndConditions}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, termsAndConditions: e.target.checked }
                    }))}
                  />
                }
                label="I agree to the Terms and Conditions and Payment Processing Policy"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={authData.acknowledgements.electronicSignature}
                    onChange={(e) => setAuthData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, electronicSignature: e.target.checked }
                    }))}
                  />
                }
                label="I agree to use electronic signature with the same legal effect as handwritten signature"
              />
            </Grid>

            {/* Signature */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Electronic Signature
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sign below to authorize automatic payments
              </Typography>
              
              <Box sx={{ 
                border: 2, 
                borderColor: 'divider', 
                borderRadius: 1,
                p: 2,
                mt: 2,
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

              {authData.signature.accountHolderSignature && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <CheckCircle size={18} /> Signature captured successfully
                </Alert>
              )}
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleSaveDraft}
                  startIcon={<Save size={18} />}
                  disabled={loading}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<Send size={18} />}
                  disabled={loading}
                >
                  Submit Authorization
                </Button>
              </Stack>
            </Grid>

            {loading && (
              <Grid item xs={12}>
                <LinearProgress />
              </Grid>
            )}
          </Grid>
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

export default ACHAuthorization;