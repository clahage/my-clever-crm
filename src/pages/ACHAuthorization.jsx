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
  CreditCard, DollarSign, Send, CheckCircle, Shield, User, Mail, Phone,
  Save, Eye, Trash2, Lock, AlertCircle, Info, Calendar
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, doc, query, where, getDocs,
  serverTimestamp
} from 'firebase/firestore';
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
                            icon={auth.paymentMethod === 'ach' ? <DollarSign size={14} /> : <CreditCard size={14} />}
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
                    <CreditCard size={20} />
                    <Box>
                      <Typography variant="body2">Credit Card</Typography>
                      <Typography variant="caption">Instant processing</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="debit_card">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CreditCard size={20} />
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
                      startAdornment: <CreditCard size={18} style={{ marginRight: 8 }} />,
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