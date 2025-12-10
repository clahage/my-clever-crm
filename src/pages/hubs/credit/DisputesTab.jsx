// Path: /src/pages/hubs/credit/DisputesTab.jsx
// ============================================================================
// CREDIT HUB - DISPUTE MANAGEMENT TAB
// ============================================================================
// Purpose: Create and track disputes
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider
} from '@mui/material';
import {
  AlertCircle,
  Plus,
  Eye,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const DISPUTE_REASONS = [
  'Not Mine',
  'Incorrect Balance',
  'Incorrect Payment Status',
  'Duplicate Account',
  'Account Closed',
  'Fraud',
  'Paid in Full',
  'Late Payment Error',
  'Other'
];

const DisputesTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [creditReports, setCreditReports] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [disputeForm, setDisputeForm] = useState({
    selectedItems: [],
    reason: '',
    customReason: '',
    description: '',
    evidence: []
  });

  const steps = ['Select Items', 'Dispute Reason', 'Add Evidence', 'Review & Submit'];

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to disputes
    const clientId = userProfile?.role === 'client' ? userProfile.uid : null;
    const disputesQuery = clientId
      ? query(
          collection(db, 'disputes'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));

    const unsubDisputes = onSnapshot(disputesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDisputes(data);
      setLoading(false);
    });
    unsubscribers.push(unsubDisputes);

    // Subscribe to credit reports (to get items to dispute)
    const reportsQuery = clientId
      ? query(
          collection(db, 'creditReports'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'creditReports'), orderBy('createdAt', 'desc'));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCreditReports(data);
    });
    unsubscribers.push(unsubReports);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile]);

  const handleCreateDispute = async () => {
    try {
      if (disputeForm.selectedItems.length === 0) {
        throw new Error('Please select at least one item to dispute');
      }

      const dispute = {
        clientId: userProfile.uid,
        clientName: userProfile.displayName || userProfile.email,
        clientEmail: userProfile.email,
        items: disputeForm.selectedItems,
        reason: disputeForm.reason === 'Other' ? disputeForm.customReason : disputeForm.reason,
        description: disputeForm.description,
        evidence: disputeForm.evidence,
        status: 'pending',
        bureaus: {
          equifax: 'pending',
          experian: 'pending',
          transunion: 'pending'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile.email
      };

      await addDoc(collection(db, 'disputes'), dispute);

      setSnackbar({
        open: true,
        message: 'Dispute created successfully',
        severity: 'success'
      });

      // Reset form
      setOpenDialog(false);
      setActiveStep(0);
      setDisputeForm({
        selectedItems: [],
        reason: '',
        customReason: '',
        description: '',
        evidence: []
      });
    } catch (error) {
      console.error('Error creating dispute:', error);
      setSnackbar({
        open: true,
        message: 'Error creating dispute: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && disputeForm.selectedItems.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one item to dispute',
        severity: 'warning'
      });
      return;
    }
    if (activeStep === 1 && !disputeForm.reason) {
      setSnackbar({
        open: true,
        message: 'Please select a dispute reason',
        severity: 'warning'
      });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const toggleItemSelection = (item) => {
    const isSelected = disputeForm.selectedItems.some(i => i.id === item.id);
    if (isSelected) {
      setDisputeForm({
        ...disputeForm,
        selectedItems: disputeForm.selectedItems.filter(i => i.id !== item.id)
      });
    } else {
      setDisputeForm({
        ...disputeForm,
        selectedItems: [...disputeForm.selectedItems, item]
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getDisputeableItems = () => {
    if (creditReports.length === 0) return [];

    const latestReport = creditReports[0];
    const items = [];

    // Extract accounts from all bureaus
    ['equifax', 'experian', 'transunion'].forEach(bureau => {
      const accounts = latestReport.bureaus?.[bureau]?.accounts || [];
      accounts.forEach((account, index) => {
        items.push({
          id: `${bureau}-account-${index}`,
          type: 'account',
          bureau,
          creditor: account.creditor,
          accountNumber: account.accountNumber,
          balance: account.balance,
          status: account.status
        });
      });

      const inquiries = latestReport.bureaus?.[bureau]?.inquiries || [];
      inquiries.forEach((inquiry, index) => {
        items.push({
          id: `${bureau}-inquiry-${index}`,
          type: 'inquiry',
          bureau,
          creditor: inquiry.creditor,
          date: inquiry.date
        });
      });
    });

    return items;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        const items = getDisputeableItems();
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Select the items from your credit report that you want to dispute
            </Alert>
            <List>
              {items.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No items available"
                    secondary="Please ensure you have a credit report on file"
                  />
                </ListItem>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      button
                      onClick={() => toggleItemSelection(item)}
                    >
                      <Checkbox
                        checked={disputeForm.selectedItems.some(i => i.id === item.id)}
                        onChange={() => toggleItemSelection(item)}
                      />
                      <ListItemText
                        primary={item.creditor}
                        secondary={
                          <Box>
                            <Chip label={item.bureau} size="small" sx={{ mr: 1 }} />
                            <Chip label={item.type} size="small" />
                            {item.type === 'account' && (
                              <Typography variant="caption" display="block">
                                Balance: ${item.balance?.toLocaleString() || '0'} • Status: {item.status}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Dispute Reason</InputLabel>
              <Select
                value={disputeForm.reason}
                onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                label="Dispute Reason"
              >
                {DISPUTE_REASONS.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {disputeForm.reason === 'Other' && (
              <TextField
                fullWidth
                label="Custom Reason"
                value={disputeForm.customReason}
                onChange={(e) => setDisputeForm({ ...disputeForm, customReason: e.target.value })}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detailed Description"
              value={disputeForm.description}
              onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
              placeholder="Provide additional details about your dispute..."
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload supporting documents to strengthen your dispute (optional)
            </Alert>
            <Button
              variant="outlined"
              startIcon={<Upload size={18} />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Evidence
            </Button>
            <Typography variant="caption" color="text.secondary">
              Accepted formats: PDF, JPG, PNG (Max 10MB)
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please review your dispute before submitting
            </Alert>
            <Typography variant="subtitle2" gutterBottom>
              Items to Dispute ({disputeForm.selectedItems.length})
            </Typography>
            <List dense>
              {disputeForm.selectedItems.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={item.creditor}
                    secondary={`${item.bureau} - ${item.type}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Reason</Typography>
            <Typography variant="body2" paragraph>
              {disputeForm.reason === 'Other' ? disputeForm.customReason : disputeForm.reason}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Description</Typography>
            <Typography variant="body2" paragraph>
              {disputeForm.description || 'No description provided'}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Dispute Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and track credit report disputes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Create Dispute
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Disputes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {disputes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {disputes.filter(d => d.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Resolved</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {disputes.filter(d => d.status === 'resolved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Success Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {disputes.length > 0
                  ? Math.round((disputes.filter(d => d.status === 'resolved').length / disputes.length) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Disputes Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Your Disputes
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bureaus</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No disputes yet. Click "Create Dispute" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  disputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        {dispute.createdAt?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>{dispute.reason}</TableCell>
                      <TableCell>{dispute.items?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(dispute.status)}
                          label={dispute.status}
                          color={getStatusColor(dispute.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {dispute.bureaus?.equifax && (
                            <Chip
                              label="EQ"
                              size="small"
                              color={dispute.bureaus.equifax === 'resolved' ? 'success' : 'default'}
                            />
                          )}
                          {dispute.bureaus?.experian && (
                            <Chip
                              label="EX"
                              size="small"
                              color={dispute.bureaus.experian === 'resolved' ? 'success' : 'default'}
                            />
                          )}
                          {dispute.bureaus?.transunion && (
                            <Chip
                              label="TU"
                              size="small"
                              color={dispute.bureaus.transunion === 'resolved' ? 'success' : 'default'}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="View Details">
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" title="View Documents">
                          <FileText size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Dispute Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Dispute</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Box sx={{ flex: 1 }} />
          {activeStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreateDispute}>
              Submit Dispute
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisputesTab;
