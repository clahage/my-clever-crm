// src/pages/AdminAddendumFlow.jsx - Complete Addendum Management System
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Menu, MenuItem, FormControl, InputLabel,
  Select, Card, CardContent, Grid, Avatar, Stack, Tooltip,
  Stepper, Step, StepLabel, Divider, List, ListItem, ListItemText,
  Autocomplete
} from '@mui/material';
import {
  FileText, Plus, Edit, Trash2, Download, Send, Eye, X,
  Calendar, User, Building, DollarSign, Clock, CheckCircle,
  AlertCircle, ArrowRight, Save, RefreshCw, CreditCard, Shield,
  Layers
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, Timestamp, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const AdminAddendumFlow = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [addendums, setAddendums] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Selected Items
  const [selectedAddendum, setSelectedAddendum] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Template', 'Client & Agreement', 'Addendum Details', 'Review'];
  
  // Form State
  const [addendumForm, setAddendumForm] = useState({
    type: '',
    contact: null,
    originalAgreement: null,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    changes: {
      description: '',
      oldValue: '',
      newValue: ''
    },
    pricing: {
      originalAmount: 0,
      newAmount: 0,
      adjustment: 0
    },
    status: 'draft',
    approvalRequired: true
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Premade Addendum Templates
  const addendumTemplates = [
    {
      id: 'ach',
      label: 'ACH Payment Authorization',
      description: 'Add or modify ACH payment method',
      icon: DollarSign,
      color: 'primary',
      defaultContent: 'This addendum authorizes automatic ACH payments from the designated bank account.'
    },
    {
      id: 'poa',
      label: 'Power of Attorney',
      description: 'Grant authorization to act on behalf',
      icon: Shield,
      color: 'error',
      defaultContent: 'This Power of Attorney addendum grants authorization to represent the client in credit bureau matters.'
    },
    {
      id: 'full_extension',
      label: 'Full Contract Extension',
      description: 'Extend full service agreement term',
      icon: Calendar,
      color: 'success',
      defaultContent: 'This addendum extends the original service agreement for an additional term.'
    },
    {
      id: 'item_only',
      label: 'Item-Only Service',
      description: 'Add specific dispute items',
      icon: FileText,
      color: 'info',
      defaultContent: 'This addendum adds specific items to be disputed under the service agreement.'
    },
    {
      id: 'pricing',
      label: 'Pricing Adjustment',
      description: 'Modify payment terms',
      icon: DollarSign,
      color: 'warning',
      defaultContent: 'This addendum modifies the pricing structure and payment terms of the original agreement.'
    },
    {
      id: 'custom',
      label: 'Custom Addendum',
      description: 'Create custom terms',
      icon: Edit,
      color: 'secondary',
      defaultContent: ''
    }
  ];

  // Load Data
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load contacts
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('userId', '==', currentUser.uid)
        );
        
        const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
          const contactData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            displayName: doc.data().name || `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim()
          }));
          setContacts(contactData);
        });

        // Load agreements
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

        // Load addendums
        const addendumsQuery = query(
          collection(db, 'addendums'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const unsubAddendums = onSnapshot(addendumsQuery, (snapshot) => {
          const addendumData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAddendums(addendumData);
          setLoading(false);
        });

        return () => {
          unsubContacts();
          unsubAddendums();
        };
      } catch (error) {
        console.error('Error loading data:', error);
        showSnackbar('Error loading data', 'error');
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Handle Template Selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setAddendumForm(prev => ({ 
      ...prev, 
      type: template.id,
      changes: {
        ...prev.changes,
        description: template.defaultContent
      }
    }));
    setActiveStep(1); // Move to next step
  };

  // Handle Next Step
  const handleNext = () => {
    // Validation for each step
    if (activeStep === 1 && (!addendumForm.contact || !addendumForm.originalAgreement)) {
      showSnackbar('Please select client and agreement', 'warning');
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle Back Step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Generate addendum number
  const generateAddendumNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ADD-${year}${month}-${random}`;
  };

  // Handle Create Addendum
  const handleCreateAddendum = async () => {
    setLoading(true);
    try {
      const addendumData = {
        ...addendumForm,
        userId: currentUser.uid,
        contactId: addendumForm.contact?.id,
        contactName: addendumForm.contact?.displayName,
        agreementId: addendumForm.originalAgreement?.id,
        addendumNumber: generateAddendumNumber(),
        templateUsed: selectedTemplate?.label,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'addendums'), addendumData);
      
      showSnackbar('Addendum created successfully!', 'success');
      handleCloseDialogs();
      resetForm();
    } catch (error) {
      console.error('Error creating addendum:', error);
      showSnackbar('Error creating addendum', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setAddendumForm({
      type: '',
      contact: null,
      originalAgreement: null,
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      changes: {
        description: '',
        oldValue: '',
        newValue: ''
      },
      pricing: {
        originalAmount: 0,
        newAmount: 0,
        adjustment: 0
      },
      status: 'draft',
      approvalRequired: true
    });
    setSelectedTemplate(null);
    setActiveStep(0);
  };

  // Close All Dialogs
  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setViewDialogOpen(false);
    setDetailsDialogOpen(false);
    resetForm();
  };

  // Show Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // View Addendum
  const handleViewAddendum = (addendum) => {
    setSelectedAddendum(addendum);
    setViewDialogOpen(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active': return 'success';
      case 'pending_approval': return 'warning';
      case 'rejected':
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  // Render Step Content
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Select Template
        return (
          <Grid container spacing={2}>
            {addendumTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Grid item xs={12} md={6} key={template.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      },
                      border: selectedTemplate?.id === template.id ? 2 : 1,
                      borderColor: selectedTemplate?.id === template.id ? `${template.color}.main` : 'divider'
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: `${template.color}.main` }}>
                          <Icon size={24} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {template.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                        {selectedTemplate?.id === template.id && <CheckCircle color={template.color} />}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        );

      case 1: // Client & Agreement
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.displayName || ''}
                value={addendumForm.contact}
                onChange={(e, value) => setAddendumForm(prev => ({ ...prev, contact: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Select Client *" required />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={agreements.filter(a => a.contactId === addendumForm.contact?.id)}
                getOptionLabel={(option) => `${option.agreementNumber || 'Agreement'} - ${option.services?.package || 'Service Package'}`}
                value={addendumForm.originalAgreement}
                onChange={(e, value) => setAddendumForm(prev => ({ ...prev, originalAgreement: value }))}
                renderInput={(params) => (
                  <TextField {...params} label="Original Agreement *" required />
                )}
                disabled={!addendumForm.contact}
              />
            </Grid>

            {addendumForm.originalAgreement && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Agreement Details</Typography>
                    <Typography variant="body2">
                      Package: {addendumForm.originalAgreement.services?.package || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Monthly Fee: ${addendumForm.originalAgreement.pricing?.monthlyFee || '0'}
                    </Typography>
                    <Typography variant="body2">
                      Status: {addendumForm.originalAgreement.status || 'Active'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Effective Date"
                type="date"
                value={addendumForm.effectiveDate}
                onChange={(e) => setAddendumForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case 2: // Addendum Details
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Reason for Addendum"
                multiline
                rows={3}
                value={addendumForm.reason}
                onChange={(e) => setAddendumForm(prev => ({ ...prev, reason: e.target.value }))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Addendum Details / Changes"
                multiline
                rows={6}
                value={addendumForm.changes.description}
                onChange={(e) => setAddendumForm(prev => ({ 
                  ...prev, 
                  changes: { ...prev.changes, description: e.target.value }
                }))}
                placeholder={selectedTemplate?.id === 'custom' ? 
                  'Enter the full text of your custom addendum...' : 
                  'Modify the default content or add additional details...'}
                fullWidth
              />
            </Grid>

            {selectedTemplate?.id === 'pricing' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Original Amount"
                    type="number"
                    value={addendumForm.pricing.originalAmount}
                    onChange={(e) => setAddendumForm(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, originalAmount: parseFloat(e.target.value) || 0 }
                    }))}
                    InputProps={{ startAdornment: '$' }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="New Amount"
                    type="number"
                    value={addendumForm.pricing.newAmount}
                    onChange={(e) => setAddendumForm(prev => ({
                      ...prev,
                      pricing: { ...prev.pricing, newAmount: parseFloat(e.target.value) || 0 }
                    }))}
                    InputProps={{ startAdornment: '$' }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Adjustment"
                    type="number"
                    value={addendumForm.pricing.newAmount - addendumForm.pricing.originalAmount}
                    InputProps={{ startAdornment: '$' }}
                    disabled
                    fullWidth
                  />
                </Grid>
              </>
            )}
          </Grid>
        );

      case 3: // Review
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review the addendum details before finalizing
            </Alert>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Addendum Type" 
                  secondary={selectedTemplate?.label} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Client" 
                  secondary={addendumForm.contact?.displayName} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Original Agreement" 
                  secondary={addendumForm.originalAgreement?.agreementNumber} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Effective Date" 
                  secondary={addendumForm.effectiveDate} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Reason" 
                  secondary={addendumForm.reason || 'N/A'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Changes/Details" 
                  secondary={addendumForm.changes.description} 
                />
              </ListItem>
            </List>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Addendum Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage contract addendums with premade templates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Addendum
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <FileText />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {addendums.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Addendums
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Clock />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {addendums.filter(a => a.status === 'draft').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {addendums.filter(a => a.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Layers />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {addendumTemplates.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Templates
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Addendums Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Addendum #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Effective Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addendums
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((addendum) => {
                  const template = addendumTemplates.find(t => t.id === addendum.type);
                  
                  return (
                    <TableRow key={addendum.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {addendum.addendumNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={addendum.templateUsed || template?.label || addendum.type} 
                          size="small"
                          color={template?.color || 'default'}
                        />
                      </TableCell>
                      <TableCell>{addendum.contactName}</TableCell>
                      <TableCell>
                        {addendum.effectiveDate ? 
                          format(new Date(addendum.effectiveDate), 'MM/dd/yyyy') : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={addendum.status}
                          size="small"
                          color={getStatusColor(addendum.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewAddendum(addendum)}
                            >
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <Download size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send">
                            <IconButton size="small">
                              <Send size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={addendums.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create Addendum Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseDialogs}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Create New Addendum
          <IconButton
            onClick={handleCloseDialogs}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep < 3 && (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={activeStep === 0 && !selectedTemplate}
            >
              Next
            </Button>
          )}
          {activeStep === 3 && (
            <Button 
              variant="contained" 
              onClick={handleCreateAddendum}
              startIcon={<Save size={20} />}
            >
              Create Addendum
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Addendum Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Addendum Details</DialogTitle>
        <DialogContent>
          {selectedAddendum && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Number</Typography>
                  <Typography variant="body1">{selectedAddendum.addendumNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">
                    {selectedAddendum.templateUsed || 'Custom'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Client</Typography>
                  <Typography variant="body1">{selectedAddendum.contactName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1">{selectedAddendum.reason || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Changes</Typography>
                  <Typography variant="body1">{selectedAddendum.changes?.description}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button startIcon={<Download />}>Download PDF</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAddendumFlow;