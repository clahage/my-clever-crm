// src/pages/AddendumItemOnly.jsx - Item-Only Service Addendum
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Stepper, Step, StepLabel, Alert, Snackbar, Divider, Stack,
  FormControl, InputLabel, Select, MenuItem, Autocomplete, Checkbox,
  FormControlLabel, IconButton, Chip, InputAdornment
} from '@mui/material';
import {
  FileText, Save, ArrowLeft, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';

const AddendumItemOnly = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Client Info
    contact: null,
    originalAgreement: null,
    
    // Items to Add
    disputeItems: [],
    
    // Item Form
    currentItem: {
      creditor: '',
      accountNumber: '',
      itemType: 'late_payment', // late_payment, charge_off, collection, inquiry
      amount: '',
      reportedBy: [], // equifax, experian, transunion
      disputeReason: '',
      priority: 'normal' // low, normal, high
    },
    
    // Pricing
    itemPricing: 'included', // included, per_item, custom
    pricePerItem: 0,
    totalAdditionalCost: 0,
    
    // Terms
    reason: 'Add specific dispute items to service agreement',
    agreeToTerms: false,
    electronicSignature: '',
    signatureData: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = ['Client Selection', 'Add Dispute Items', 'Pricing', 'Review & Sign'];

  const itemTypes = [
    { value: 'late_payment', label: 'Late Payment' },
    { value: 'charge_off', label: 'Charge-off' },
    { value: 'collection', label: 'Collection Account' },
    { value: 'inquiry', label: 'Hard Inquiry' },
    { value: 'bankruptcy', label: 'Bankruptcy' },
    { value: 'foreclosure', label: 'Foreclosure' },
    { value: 'repossession', label: 'Repossession' },
    { value: 'judgment', label: 'Judgment' },
    { value: 'tax_lien', label: 'Tax Lien' }
  ];

  const bureaus = [
    { value: 'equifax', label: 'Equifax' },
    { value: 'experian', label: 'Experian' },
    { value: 'transunion', label: 'TransUnion' }
  ];

  // Load contacts and agreements
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('userId', '==', currentUser.uid)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          displayName: doc.data().name || `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim()
        }));
        setContacts(contactsData);

        const agreementsQuery = query(
          collection(db, 'serviceAgreements'),
          where('userId', '==', currentUser.uid)
        );
        const agreementsSnapshot = await getDocs(agreementsQuery);
        const agreementsData = agreementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAgreements(agreementsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [currentUser]);

  // Calculate total cost
  useEffect(() => {
    if (formData.itemPricing === 'per_item') {
      const total = formData.disputeItems.length * parseFloat(formData.pricePerItem || 0);
      setFormData(prev => ({ ...prev, totalAdditionalCost: total }));
    }
  }, [formData.disputeItems.length, formData.pricePerItem, formData.itemPricing]);

  const handleNext = () => {
    if (activeStep === 0 && (!formData.contact || !formData.originalAgreement)) {
      showSnackbar('Please select client and agreement', 'warning');
      return;
    }
    if (activeStep === 1 && formData.disputeItems.length === 0) {
      showSnackbar('Please add at least one dispute item', 'warning');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleAddItem = () => {
    if (!formData.currentItem.creditor || !formData.currentItem.itemType) {
      showSnackbar('Please fill in creditor and item type', 'warning');
      return;
    }

    if (formData.currentItem.reportedBy.length === 0) {
      showSnackbar('Please select at least one credit bureau', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev,
      disputeItems: [...prev.disputeItems, { ...prev.currentItem, id: Date.now() }],
      currentItem: {
        creditor: '',
        accountNumber: '',
        itemType: 'late_payment',
        amount: '',
        reportedBy: [],
        disputeReason: '',
        priority: 'normal'
      }
    }));

    showSnackbar('Dispute item added', 'success');
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      disputeItems: prev.disputeItems.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms || !formData.electronicSignature) {
      showSnackbar('Please agree to terms and sign', 'warning');
      return;
    }

    const signatureData = signatureRef.current ? signatureRef.current.toDataURL() : null;

    setLoading(true);
    try {
      const addendumData = {
        type: 'item_only',
        userId: currentUser.uid,
        contactId: formData.contact?.id,
        contactName: formData.contact?.displayName,
        agreementId: formData.originalAgreement?.id,
        addendumNumber: `ITEM-${Date.now()}`,
        
        disputeItems: formData.disputeItems,
        itemCount: formData.disputeItems.length,
        
        pricing: {
          type: formData.itemPricing,
          pricePerItem: formData.itemPricing === 'per_item' ? parseFloat(formData.pricePerItem) : 0,
          totalAdditionalCost: parseFloat(formData.totalAdditionalCost) || 0
        },
        
        signature: {
          name: formData.electronicSignature,
          signatureData,
          signedAt: Timestamp.now()
        },
        
        reason: formData.reason,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'addendums'), addendumData);
      
      showSnackbar('Item-only addendum created successfully!', 'success');
      setTimeout(() => navigate('/addendums'), 2000);
    } catch (error) {
      console.error('Error creating item-only addendum:', error);
      showSnackbar('Error creating addendum', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Client Selection
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Select the client and their existing service agreement to add specific dispute items
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                value={formData.contact}
                onChange={(e, value) => setFormData(prev => ({ ...prev, contact: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Select Client *" required />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={agreements.filter(a => a.contactId === formData.contact?.id)}
                getOptionLabel={(option) => `${option.agreementNumber || 'Agreement'} - ${option.services?.package || 'Service'}`}
                value={formData.originalAgreement}
                onChange={(e, value) => setFormData(prev => ({ ...prev, originalAgreement: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Original Agreement *" required />
                )}
                disabled={!formData.contact}
              />
            </Grid>

            {formData.originalAgreement && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Current Agreement</Typography>
                    <Typography variant="body2">
                      Package: {formData.originalAgreement.services?.package || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Monthly Fee: ${formData.originalAgreement.pricing?.monthlyFee || '0'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      case 1: // Add Items
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Add Dispute Items</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Creditor/Collection Agency *"
                value={formData.currentItem.creditor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentItem: { ...prev.currentItem, creditor: e.target.value }
                }))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Account Number (Last 4)"
                value={formData.currentItem.accountNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentItem: { ...prev.currentItem, accountNumber: e.target.value }
                }))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Item Type *</InputLabel>
                <Select
                  value={formData.currentItem.itemType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    currentItem: { ...prev.currentItem, itemType: e.target.value }
                  }))}
                  label="Item Type *"
                >
                  {itemTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Amount"
                type="number"
                value={formData.currentItem.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentItem: { ...prev.currentItem, amount: e.target.value }
                }))}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Reported By (Credit Bureaus) *</Typography>
              <Stack direction="row" spacing={1}>
                {bureaus.map(bureau => (
                  <Chip
                    key={bureau.value}
                    label={bureau.label}
                    onClick={() => {
                      const reportedBy = formData.currentItem.reportedBy.includes(bureau.value)
                        ? formData.currentItem.reportedBy.filter(b => b !== bureau.value)
                        : [...formData.currentItem.reportedBy, bureau.value];
                      setFormData(prev => ({
                        ...prev,
                        currentItem: { ...prev.currentItem, reportedBy }
                      }));
                    }}
                    color={formData.currentItem.reportedBy.includes(bureau.value) ? 'primary' : 'default'}
                    variant={formData.currentItem.reportedBy.includes(bureau.value) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Dispute Reason"
                multiline
                rows={2}
                value={formData.currentItem.disputeReason}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentItem: { ...prev.currentItem, disputeReason: e.target.value }
                }))}
                placeholder="Why is this item being disputed?"
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleAddItem}
                fullWidth
              >
                Add This Item to List
              </Button>
            </Grid>

            {formData.disputeItems.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Added Items ({formData.disputeItems.length})
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {formData.disputeItems.map((item, index) => (
                  <Grid item xs={12} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {index + 1}. {item.creditor}
                              {item.accountNumber && ` - ***${item.accountNumber}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {itemTypes.find(t => t.value === item.itemType)?.label}
                              {item.amount && ` - $${item.amount}`}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {item.reportedBy.map(bureau => (
                                <Chip key={bureau} label={bureau} size="small" />
                              ))}
                            </Stack>
                            {item.disputeReason && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Reason: {item.disputeReason}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        );

      case 2: // Pricing
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Pricing for Additional Items</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Pricing Structure</InputLabel>
                <Select
                  value={formData.itemPricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemPricing: e.target.value }))}
                  label="Pricing Structure"
                >
                  <MenuItem value="included">Included in existing agreement (no additional cost)</MenuItem>
                  <MenuItem value="per_item">Per-item pricing</MenuItem>
                  <MenuItem value="custom">Custom pricing</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.itemPricing === 'per_item' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Price Per Item"
                    type="number"
                    value={formData.pricePerItem}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerItem: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Additional Cost"
                    type="number"
                    value={formData.totalAdditionalCost}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    disabled
                    fullWidth
                    helperText={`${formData.disputeItems.length} items × $${formData.pricePerItem || 0}`}
                  />
                </Grid>
              </>
            )}

            {formData.itemPricing === 'custom' && (
              <Grid item xs={12}>
                <TextField
                  label="Custom Total Cost"
                  type="number"
                  value={formData.totalAdditionalCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAdditionalCost: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  fullWidth
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Additional Notes"
                multiline
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Any additional terms or notes..."
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case 3: // Review & Sign
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Please review the item-only service addendum before signing
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Addendum Summary</Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Client: {formData.contact?.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dispute Items: {formData.disputeItems.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Additional Cost: ${formData.totalAdditionalCost || '0.00'}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items to be Disputed:</Typography>
                  {formData.disputeItems.map((item, index) => (
                    <Box key={item.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {index + 1}. {item.creditor} - {itemTypes.find(t => t.value === item.itemType)?.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bureaus: {item.reportedBy.join(', ')}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  />
                }
                label="I agree to add these items to my service agreement under the terms outlined above"
              />
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Electronic Signature *</Typography>
                  
                  <TextField
                    label="Type Your Full Name"
                    value={formData.electronicSignature}
                    onChange={(e) => setFormData(prev => ({ ...prev, electronicSignature: e.target.value }))}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" gutterBottom>Draw Your Signature:</Typography>
                  <Box sx={{ border: '2px solid #ccc', borderRadius: 1, mb: 1 }}>
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        width: 500,
                        height: 200,
                        style: { width: '100%', height: '200px' }
                      }}
                    />
                  </Box>
                  <Button size="small" onClick={clearSignature}>Clear Signature</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate('/addendums')}
          sx={{ mb: 2 }}
        >
          Back to Addendums
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Item-Only Service Addendum
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add specific dispute items to an existing service agreement
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.agreeToTerms || !formData.electronicSignature}
              startIcon={<Save />}
            >
              {loading ? 'Saving...' : 'Submit Addendum'}
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
      </Paper>

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
  );
};

export default AddendumItemOnly;