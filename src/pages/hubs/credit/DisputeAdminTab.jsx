// Path: /src/pages/hubs/credit/DisputeAdminTab.jsx
// ============================================================================
// CREDIT HUB - DISPUTE ADMIN TAB
// ============================================================================
// Purpose: Admin dispute panel
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Tabs,
  Tab
} from '@mui/material';
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Send,
  Download,
  Filter
} from 'lucide-react';
import { collection, query, onSnapshot, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const DisputeAdminTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [bureauTab, setBureauTab] = useState(0);
  const [selectedDisputes, setSelectedDisputes] = useState([]);

  // Form state for updating dispute
  const [updateForm, setUpdateForm] = useState({
    status: '',
    equifaxStatus: '',
    experianStatus: '',
    transunionStatus: '',
    adminNotes: '',
    bureauResponse: ''
  });

  useEffect(() => {
    // Subscribe to all disputes (admin view)
    const disputesQuery = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
    const unsubDisputes = onSnapshot(disputesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDisputes(data);
      setLoading(false);
    });

    return () => unsubDisputes();
  }, []);

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute);
    setUpdateForm({
      status: dispute.status || 'pending',
      equifaxStatus: dispute.bureaus?.equifax || 'pending',
      experianStatus: dispute.bureaus?.experian || 'pending',
      transunionStatus: dispute.bureaus?.transunion || 'pending',
      adminNotes: dispute.adminNotes || '',
      bureauResponse: dispute.bureauResponse || ''
    });
    setOpenDialog(true);
  };

  const handleUpdateDispute = async () => {
    try {
      await updateDoc(doc(db, 'disputes', selectedDispute.id), {
        status: updateForm.status,
        bureaus: {
          equifax: updateForm.equifaxStatus,
          experian: updateForm.experianStatus,
          transunion: updateForm.transunionStatus
        },
        adminNotes: updateForm.adminNotes,
        bureauResponse: updateForm.bureauResponse,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile?.email || 'Unknown'
      });

      setSnackbar({
        open: true,
        message: 'Dispute updated successfully',
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating dispute:', error);
      setSnackbar({
        open: true,
        message: 'Error updating dispute',
        severity: 'error'
      });
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const promises = selectedDisputes.map(disputeId =>
        updateDoc(doc(db, 'disputes', disputeId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email || 'Unknown'
        })
      );

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: `Updated ${selectedDisputes.length} disputes`,
        severity: 'success'
      });
      setSelectedDisputes([]);
    } catch (error) {
      console.error('Error bulk updating disputes:', error);
      setSnackbar({
        open: true,
        message: 'Error updating disputes',
        severity: 'error'
      });
    }
  };

  const toggleDisputeSelection = (disputeId) => {
    if (selectedDisputes.includes(disputeId)) {
      setSelectedDisputes(selectedDisputes.filter(id => id !== disputeId));
    } else {
      setSelectedDisputes([...selectedDisputes, disputeId]);
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

  const filteredDisputes = filterStatus === 'all'
    ? disputes
    : disputes.filter(d => d.status === filterStatus);

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
            <Shield size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Dispute Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all client disputes across all bureaus
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter Status"
            >
              <MenuItem value="all">All Disputes</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
              <Typography variant="body2" color="text.secondary">Pending Review</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {disputes.filter(d => d.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {disputes.filter(d => d.status === 'in_progress').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Resolved This Month</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {disputes.filter(d => {
                  if (d.status !== 'resolved') return false;
                  const updatedAt = d.updatedAt?.toDate();
                  if (!updatedAt) return false;
                  const now = new Date();
                  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return updatedAt >= firstDayOfMonth;
                }).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bulk Actions */}
      {selectedDisputes.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {selectedDisputes.length} dispute(s) selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkStatusChange('in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleBulkStatusChange('resolved')}
                >
                  Mark Resolved
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleBulkStatusChange('rejected')}
                >
                  Mark Rejected
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Disputes Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            All Disputes ({filteredDisputes.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDisputes.length === filteredDisputes.length && filteredDisputes.length > 0}
                      indeterminate={selectedDisputes.length > 0 && selectedDisputes.length < filteredDisputes.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDisputes(filteredDisputes.map(d => d.id));
                        } else {
                          setSelectedDisputes([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bureaus</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDisputes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No disputes found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <TableRow
                      key={dispute.id}
                      hover
                      selected={selectedDisputes.includes(dispute.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedDisputes.includes(dispute.id)}
                          onChange={() => toggleDisputeSelection(dispute.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{dispute.clientName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dispute.clientEmail}
                        </Typography>
                      </TableCell>
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
                          <Chip
                            label="EQ"
                            size="small"
                            color={getStatusColor(dispute.bureaus?.equifax)}
                          />
                          <Chip
                            label="EX"
                            size="small"
                            color={getStatusColor(dispute.bureaus?.experian)}
                          />
                          <Chip
                            label="TU"
                            size="small"
                            color={getStatusColor(dispute.bureaus?.transunion)}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDispute(dispute)} title="View & Update">
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" title="View Documents">
                          <FileText size={18} />
                        </IconButton>
                        <IconButton size="small" title="Download">
                          <Download size={18} />
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

      {/* Update Dispute Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Update Dispute
          {selectedDispute && (
            <Typography variant="caption" display="block" color="text.secondary">
              Client: {selectedDispute.clientName} • Created: {selectedDispute.createdAt?.toDate().toLocaleDateString()}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Overall Status</InputLabel>
                <Select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  label="Overall Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Bureau Status
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Equifax</InputLabel>
                <Select
                  value={updateForm.equifaxStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, equifaxStatus: e.target.value })}
                  label="Equifax"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Experian</InputLabel>
                <Select
                  value={updateForm.experianStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, experianStatus: e.target.value })}
                  label="Experian"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>TransUnion</InputLabel>
                <Select
                  value={updateForm.transunionStatus}
                  onChange={(e) => setUpdateForm({ ...updateForm, transunionStatus: e.target.value })}
                  label="TransUnion"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={updateForm.adminNotes}
                onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                placeholder="Internal notes about this dispute..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bureau Response"
                value={updateForm.bureauResponse}
                onChange={(e) => setUpdateForm({ ...updateForm, bureauResponse: e.target.value })}
                placeholder="Response received from credit bureaus..."
              />
            </Grid>

            {selectedDispute && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Dispute Reason:</strong> {selectedDispute.reason}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {selectedDispute.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Items:</strong> {selectedDispute.items?.length || 0} items
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<Send size={18} />}
          >
            Send Update to Client
          </Button>
          <Button variant="contained" onClick={handleUpdateDispute}>
            Save Changes
          </Button>
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

export default DisputeAdminTab;
