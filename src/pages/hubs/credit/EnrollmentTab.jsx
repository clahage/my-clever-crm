// Path: /src/pages/hubs/credit/EnrollmentTab.jsx
// ============================================================================
// CREDIT HUB - IDIQ ENROLLMENT TAB
// ============================================================================
// Purpose: Enroll clients in IDIQ system
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const EnrollmentTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [enrollmentData, setEnrollmentData] = useState({
    ssn: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Client', 'Enter Information', 'Review & Submit'];

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to enrollments
    const enrollmentsQuery = query(collection(db, 'idiqEnrollments'));
    const unsubEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnrollments(data);
      setLoading(false);
    });
    unsubscribers.push(unsubEnrollments);

    // Subscribe to clients
    const clientsQuery = query(collection(db, 'clients'));
    const unsubClients = onSnapshot(clientsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(data);
    });
    unsubscribers.push(unsubClients);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const handleEnroll = async () => {
    try {
      const client = clients.find(c => c.id === selectedClient);
      if (!client) {
        throw new Error('Client not found');
      }

      const enrollment = {
        clientId: selectedClient,
        clientName: client.name,
        clientEmail: client.email,
        ...enrollmentData,
        status: 'pending',
        enrolledBy: userProfile?.email || 'Unknown',
        enrolledById: userProfile?.uid || 'Unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // IDIQ API integration point
        idiqStatus: 'awaiting_submission',
        idiqEnrollmentId: null,
        idiqResponse: null
      };

      await addDoc(collection(db, 'idiqEnrollments'), enrollment);

      // TODO: Submit to IDIQ API
      // const idiqResponse = await submitToIDIQAPI(enrollment);
      // await updateDoc(doc(db, 'idiqEnrollments', docRef.id), {
      //   idiqEnrollmentId: idiqResponse.enrollmentId,
      //   idiqResponse: idiqResponse,
      //   status: 'active'
      // });

      setSnackbar({
        open: true,
        message: 'Client enrolled successfully',
        severity: 'success'
      });

      // Reset form
      setOpenDialog(false);
      setActiveStep(0);
      setSelectedClient('');
      setEnrollmentData({
        ssn: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error enrolling client:', error);
      setSnackbar({
        open: true,
        message: 'Error enrolling client: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedClient) {
      setSnackbar({
        open: true,
        message: 'Please select a client',
        severity: 'warning'
      });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Client</InputLabel>
            <Select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              label="Select Client"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 1:
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Social Security Number"
                value={enrollmentData.ssn}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, ssn: e.target.value })}
                placeholder="XXX-XX-XXXX"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={enrollmentData.dateOfBirth}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={enrollmentData.address}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={enrollmentData.city}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={enrollmentData.state}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, state: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={enrollmentData.zipCode}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, zipCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={enrollmentData.phone}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, phone: e.target.value })}
                placeholder="(XXX) XXX-XXXX"
              />
            </Grid>
          </Grid>
        );

      case 2:
        const client = clients.find(c => c.id === selectedClient);
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review the enrollment information before submitting.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                <Typography variant="body1">{client?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">SSN</Typography>
                <Typography variant="body1">***-**-{enrollmentData.ssn.slice(-4)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                <Typography variant="body1">{enrollmentData.dateOfBirth}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1">
                  {enrollmentData.address}<br />
                  {enrollmentData.city}, {enrollmentData.state} {enrollmentData.zipCode}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{enrollmentData.phone}</Typography>
              </Grid>
            </Grid>
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
            IDIQ Enrollment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enroll clients in the IDIQ credit monitoring system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Enroll New Client
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Enrollments</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {enrollments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {enrollments.filter(e => e.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {enrollments.filter(e => e.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Failed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {enrollments.filter(e => e.status === 'failed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enrollments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Enrollment History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Enrolled Date</TableCell>
                  <TableCell>Enrolled By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No enrollments yet. Click "Enroll New Client" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.clientName}</TableCell>
                      <TableCell>{enrollment.clientEmail}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(enrollment.status)}
                          label={enrollment.status}
                          color={getStatusColor(enrollment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {enrollment.createdAt?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>{enrollment.enrolledBy}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="View Details">
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" title="Refresh Status">
                          <RefreshCw size={18} />
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

      {/* Enrollment Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Enroll Client in IDIQ
        </DialogTitle>
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
            <Button variant="contained" onClick={handleEnroll}>
              Enroll
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

export default EnrollmentTab;
