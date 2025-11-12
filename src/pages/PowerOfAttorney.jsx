// src/pages/PowerOfAttorney.jsx - Limited Power of Attorney for Credit Repair
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Divider, Alert, Snackbar,
  Card, CardContent, FormControl, FormControlLabel, Checkbox, Select, MenuItem,
  Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, InputLabel, Chip, LinearProgress, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FileText, Download, Send, CheckCircle, Shield, User, Mail, Phone,
  Calendar, Save, Eye, Trash2, Edit, AlertCircle, Info
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, doc, query, where, getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';

const PowerOfAttorney = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [poaDocuments, setPoaDocuments] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const signaturePad = useRef(null);

  // POA Data
  const [poaData, setPoaData] = useState({
    // Principal (Client) Information
    principal: {
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      ssn: '',
      address: {
        street: '',
        unit: '',
        city: '',
        state: '',
        zip: ''
      }
    },

    // Attorney-in-Fact (Company) Information
    attorney: {
      companyName: 'Speedy Credit Repair',
      representative: '',
      address: {
        street: '123 Credit Lane',
        city: 'Huntington Beach',
        state: 'CA',
        zip: '92648'
      },
      phone: '(555) 123-4567',
      email: 'support@speedycreditrepair.com'
    },

    // Granted Powers
    powers: {
      // Credit Bureau Powers
      bureauAccess: true,
      requestReports: true,
      disputeItems: true,
      fileComplaints: true,
      
      // Creditor Powers
      contactCreditors: true,
      requestValidation: true,
      negotiateSettlements: false,
      requestDeletion: true,
      
      // Collection Agency Powers
      contactCollectors: true,
      disputeCollections: true,
      requestCeaseContact: true,
      
      // Additional Powers
      signDocuments: true,
      receiveCorrespondence: true,
      authorizeInquiries: true,
      fileAppeals: true
    },

    // Limitations & Restrictions
    limitations: {
      noFinancialCommitments: true, // Cannot incur debt or make payments
      noAccountChanges: true, // Cannot open/close accounts
      creditPurposeOnly: true, // Limited to credit repair activities
      reportRequired: true, // Must report actions monthly
      clientApprovalRequired: false // Whether major actions need approval
    },

    // Scope & Duration
    scope: {
      bureaus: ['Equifax', 'Experian', 'TransUnion'],
      specificAccounts: [],
      startDate: new Date(),
      endDate: null,
      durationType: 'contract_term', // contract_term, specific_date, indefinite
      autoTerminate: true // Terminate when service agreement ends
    },

    // Revocation Rights
    revocation: {
      canRevokeAnytime: true,
      noticeRequired: '30 days',
      noticeMethod: 'Written notice via email or certified mail',
      effectiveDate: 'Upon receipt of written notice'
    },

    // Legal Acknowledgements
    acknowledgements: {
      voluntaryGrant: false,
      understandPowers: false,
      understandLimitations: false,
      understandRevocation: false,
      notCoerced: false,
      mentalCapacity: false,
      readDocument: false
    },

    // Signature & Notarization
    signatures: {
      principalSignature: '',
      principalSignatureDate: null,
      witnessName: '',
      witnessSignature: '',
      witnessDate: null,
      notaryRequired: false,
      notaryName: '',
      notaryCommission: '',
      notaryExpiration: null,
      notarySeal: ''
    },

    // Status & Tracking
    status: 'draft', // draft, active, revoked, expired
    contactId: null,
    poaNumber: '',
    effectiveDate: null,
    expirationDate: null,
    revokedDate: null,
    revokedReason: ''
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

  // Load POA documents
  const loadPoaDocuments = async () => {
    try {
      const q = query(
        collection(db, 'powerOfAttorney'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const docsData = [];
      
      querySnapshot.forEach((doc) => {
        docsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setPoaDocuments(docsData);
    } catch (error) {
      console.error('Error loading POA documents:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadContacts();
      loadPoaDocuments();
    }
  }, [currentUser]);

  // Generate POA number
  const generatePoaNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `POA-${year}${month}-${random}`;
  };

  // Validate form
  const validateForm = () => {
    if (!poaData.principal.firstName || !poaData.principal.lastName) {
      showSnackbar('Please enter principal name', 'warning');
      return false;
    }
    if (!poaData.principal.email || !poaData.principal.phone) {
      showSnackbar('Please enter contact information', 'warning');
      return false;
    }
    if (!Object.values(poaData.acknowledgements).every(v => v === true)) {
      showSnackbar('Please check all acknowledgements', 'warning');
      return false;
    }
    if (!poaData.signatures.principalSignature) {
      showSnackbar('Please provide your signature', 'warning');
      return false;
    }
    return true;
  };

  // Clear signature
  const clearSignature = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      setPoaData(prev => ({
        ...prev,
        signatures: { ...prev.signatures, principalSignature: '' }
      }));
    }
  };

  // Save signature
  const saveSignature = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const signature = signaturePad.current.toDataURL();
      setPoaData(prev => ({
        ...prev,
        signatures: {
          ...prev.signatures,
          principalSignature: signature,
          principalSignatureDate: new Date()
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
      const draftData = {
        ...poaData,
        userId: currentUser.uid,
        status: 'draft',
        updatedAt: serverTimestamp()
      };

      if (poaData.id) {
        await updateDoc(doc(db, 'powerOfAttorney', poaData.id), draftData);
        showSnackbar('Draft updated successfully', 'success');
      } else {
        const poaNumber = generatePoaNumber();
        const docRef = await addDoc(collection(db, 'powerOfAttorney'), {
          ...draftData,
          poaNumber,
          createdAt: serverTimestamp()
        });
        setPoaData(prev => ({ 
          ...prev, 
          id: docRef.id,
          poaNumber
        }));
        showSnackbar('Draft saved successfully', 'success');
      }
      
      loadPoaDocuments();
    } catch (error) {
      console.error('Error saving draft:', error);
      showSnackbar('Error saving draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit POA
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const effectiveDate = poaData.scope.startDate || new Date();
      let expirationDate = null;

      if (poaData.scope.durationType === 'specific_date' && poaData.scope.endDate) {
        expirationDate = poaData.scope.endDate;
      } else if (poaData.scope.durationType === 'contract_term') {
        // Set to 2 years from now as default
        expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 2);
      }

      const submissionData = {
        ...poaData,
        userId: currentUser.uid,
        status: 'active',
        effectiveDate,
        expirationDate,
        completedAt: serverTimestamp()
      };

      if (!poaData.poaNumber) {
        submissionData.poaNumber = generatePoaNumber();
      }

      if (poaData.id) {
        await updateDoc(doc(db, 'powerOfAttorney', poaData.id), submissionData);
      } else {
        await addDoc(collection(db, 'powerOfAttorney'), {
          ...submissionData,
          createdAt: serverTimestamp()
        });
      }

      // Update contact status
      if (poaData.contactId) {
        await updateDoc(doc(db, 'contacts', poaData.contactId), {
          poaStatus: 'active',
          poaEffectiveDate: effectiveDate,
          updatedAt: serverTimestamp()
        });
      }

      showSnackbar('Power of Attorney submitted successfully!', 'success');
      
      setTimeout(() => {
        loadPoaDocuments();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting POA:', error);
      showSnackbar('Error submitting POA', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Revoke POA
  const handleRevoke = async (poaId) => {
    if (!window.confirm('Are you sure you want to revoke this Power of Attorney?')) return;

    try {
      await updateDoc(doc(db, 'powerOfAttorney', poaId), {
        status: 'revoked',
        revokedDate: new Date(),
        revokedReason: 'Revoked by principal',
        updatedAt: serverTimestamp()
      });

      showSnackbar('Power of Attorney revoked', 'success');
      loadPoaDocuments();
    } catch (error) {
      console.error('Error revoking POA:', error);
      showSnackbar('Error revoking POA', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/brand/default/logo-brand-128.png"
            alt="Speedy Credit Repair"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          />
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Power of Attorney for Credit Repair
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Limited authorization to act on your behalf for credit repair services
            </Typography>
          </Box>
        </Box>

        {/* Existing POA Documents */}
        {poaDocuments.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Authorizations</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>POA Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Effective Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {poaDocuments.map((poa) => (
                      <TableRow key={poa.id}>
                        <TableCell>
                          {poa.principal?.firstName} {poa.principal?.lastName}
                        </TableCell>
                        <TableCell>{poa.poaNumber}</TableCell>
                        <TableCell>
                          <Chip 
                            label={poa.status}
                            size="small"
                            color={
                              poa.status === 'active' ? 'success' :
                              poa.status === 'revoked' ? 'error' :
                              'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {poa.effectiveDate ? format(
                            poa.effectiveDate.toDate ? poa.effectiveDate.toDate() : new Date(poa.effectiveDate),
                            'MM/dd/yyyy'
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedDoc(poa);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye size={16} />
                            </IconButton>
                            {poa.status === 'active' && (
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRevoke(poa.id)}
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

        {/* Main POA Form */}
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Important Notice */}
            <Grid item xs={12}>
              <Alert severity="info" icon={<Info />}>
                <Typography variant="subtitle2" gutterBottom>
                  What is a Power of Attorney?
                </Typography>
                <Typography variant="body2">
                  This is a legal document that authorizes us to communicate with credit bureaus, 
                  creditors, and collection agencies on your behalf. This is required for us to dispute 
                  items on your credit report. You can revoke this authorization at any time.
                </Typography>
              </Alert>
            </Grid>

            {/* Principal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Principal (Your) Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                onChange={(e, value) => {
                  if (value) {
                    setPoaData(prev => ({
                      ...prev,
                      contactId: value.id,
                      principal: {
                        ...prev.principal,
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

            <Grid item xs={12} md={3}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={poaData.principal.firstName}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, firstName: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Middle Name"
                fullWidth
                value={poaData.principal.middleName}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, middleName: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Last Name"
                required
                fullWidth
                value={poaData.principal.lastName}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, lastName: e.target.value }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Suffix</InputLabel>
                <Select
                  value={poaData.principal.suffix}
                  onChange={(e) => setPoaData(prev => ({
                    ...prev,
                    principal: { ...prev.principal, suffix: e.target.value }
                  }))}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Jr.">Jr.</MenuItem>
                  <MenuItem value="Sr.">Sr.</MenuItem>
                  <MenuItem value="II">II</MenuItem>
                  <MenuItem value="III">III</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                required
                fullWidth
                type="email"
                value={poaData.principal.email}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, email: e.target.value }
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
                value={poaData.principal.phone}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, phone: e.target.value }
                }))}
                InputProps={{
                  startAdornment: <Phone size={18} style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Street Address"
                fullWidth
                value={poaData.principal.address.street}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: {
                    ...prev.principal,
                    address: { ...prev.principal.address, street: e.target.value }
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Unit/Apt"
                fullWidth
                value={poaData.principal.address.unit}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: {
                    ...prev.principal,
                    address: { ...prev.principal.address, unit: e.target.value }
                  }
                }))}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="City"
                fullWidth
                value={poaData.principal.address.city}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: {
                    ...prev.principal,
                    address: { ...prev.principal.address, city: e.target.value }
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={poaData.principal.address.state}
                  onChange={(e) => setPoaData(prev => ({
                    ...prev,
                    principal: {
                      ...prev.principal,
                      address: { ...prev.principal.address, state: e.target.value }
                    }
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
                value={poaData.principal.address.zip}
                onChange={(e) => setPoaData(prev => ({
                  ...prev,
                  principal: {
                    ...prev.principal,
                    address: { ...prev.principal.address, zip: e.target.value }
                  }
                }))}
              />
            </Grid>

            {/* Powers Granted */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Powers Granted to Attorney-in-Fact
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You are granting {poaData.attorney.companyName} the authority to:
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Credit Bureau Powers</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.bureauAccess}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, bureauAccess: e.target.checked }
                    }))}
                  />
                }
                label="Access credit reports from all three bureaus"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.requestReports}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, requestReports: e.target.checked }
                    }))}
                  />
                }
                label="Request credit reports on your behalf"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.disputeItems}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, disputeItems: e.target.checked }
                    }))}
                  />
                }
                label="Dispute inaccurate items on credit reports"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.fileComplaints}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, fileComplaints: e.target.checked }
                    }))}
                  />
                }
                label="File complaints with regulatory agencies"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Creditor & Collector Powers</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.contactCreditors}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, contactCreditors: e.target.checked }
                    }))}
                  />
                }
                label="Contact creditors and furnishers"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.requestValidation}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, requestValidation: e.target.checked }
                    }))}
                  />
                }
                label="Request debt validation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.contactCollectors}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, contactCollectors: e.target.checked }
                    }))}
                  />
                }
                label="Communicate with collection agencies"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.powers.requestCeaseContact}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      powers: { ...prev.powers, requestCeaseContact: e.target.checked }
                    }))}
                  />
                }
                label="Request cease and desist communications"
              />
            </Grid>

            {/* Limitations */}
            <Grid item xs={12}>
              <Alert severity="warning" icon={<Shield />}>
                <Typography variant="subtitle2" gutterBottom>
                  Important Limitations
                </Typography>
                <Typography variant="body2">
                  This Power of Attorney does NOT authorize us to:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Make payments on your behalf</li>
                  <li>Incur debt or financial obligations</li>
                  <li>Open or close accounts</li>
                  <li>Make changes to your financial accounts</li>
                  <li>Access funds or assets</li>
                </ul>
              </Alert>
            </Grid>

            {/* Scope & Duration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Scope & Duration
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Effective Start Date"
                value={poaData.scope.startDate}
                onChange={(date) => setPoaData(prev => ({
                  ...prev,
                  scope: { ...prev.scope, startDate: date }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Duration Type</InputLabel>
                <Select
                  value={poaData.scope.durationType}
                  onChange={(e) => setPoaData(prev => ({
                    ...prev,
                    scope: { ...prev.scope, durationType: e.target.value }
                  }))}
                >
                  <MenuItem value="contract_term">Duration of Service Contract</MenuItem>
                  <MenuItem value="specific_date">Until Specific Date</MenuItem>
                  <MenuItem value="indefinite">Indefinite (Until Revoked)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {poaData.scope.durationType === 'specific_date' && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Expiration Date"
                  value={poaData.scope.endDate}
                  onChange={(date) => setPoaData(prev => ({
                    ...prev,
                    scope: { ...prev.scope, endDate: date }
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            )}

            {/* Revocation Rights */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Right to Revoke
                  </Typography>
                  <Typography variant="body2" paragraph>
                    You may revoke this Power of Attorney at any time by providing written notice 
                    via email or certified mail. Revocation becomes effective upon receipt of your notice.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Notice Method:</strong> {poaData.revocation.noticeMethod}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Effective:</strong> {poaData.revocation.effectiveDate}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Legal Acknowledgements */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Legal Acknowledgements
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.voluntaryGrant}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, voluntaryGrant: e.target.checked }
                    }))}
                  />
                }
                label="I am granting this Power of Attorney voluntarily and of my own free will"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.understandPowers}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, understandPowers: e.target.checked }
                    }))}
                  />
                }
                label="I understand the powers I am granting to my attorney-in-fact"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.understandLimitations}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, understandLimitations: e.target.checked }
                    }))}
                  />
                }
                label="I understand the limitations of this Power of Attorney"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.understandRevocation}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, understandRevocation: e.target.checked }
                    }))}
                  />
                }
                label="I understand my right to revoke this authorization at any time"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.notCoerced}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, notCoerced: e.target.checked }
                    }))}
                  />
                }
                label="I am not being coerced or forced to sign this document"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.mentalCapacity}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, mentalCapacity: e.target.checked }
                    }))}
                  />
                }
                label="I am of sound mind and have the legal capacity to execute this document"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={poaData.acknowledgements.readDocument}
                    onChange={(e) => setPoaData(prev => ({
                      ...prev,
                      acknowledgements: { ...prev.acknowledgements, readDocument: e.target.checked }
                    }))}
                  />
                }
                label="I have read and understand this entire document"
              />
            </Grid>

            {/* Signature */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Principal Signature
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sign below to authorize this Power of Attorney
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

              {poaData.signatures.principalSignature && (
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
                  Submit Power of Attorney
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

export default PowerOfAttorney;