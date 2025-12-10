// Path: /src/pages/hubs/comms/SMSTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - SMS MANAGER TAB
// ============================================================================
// Purpose: SMS messaging system with delivery tracking
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Snackbar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  MessageSquare,
  Phone,
  Send,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const SMSTab = () => {
  const { userProfile } = useAuth();
  const [smsMessages, setSmsMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSMS, setSelectedSMS] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    message: '',
    status: 'draft'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Character count for SMS (160 char limit)
  const charCount = formData.message.length;
  const maxChars = 160;
  const segmentCount = Math.ceil(charCount / maxChars);

  // Subscribe to SMS messages
  useEffect(() => {
    const q = query(collection(db, 'sms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const smsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSmsMessages(smsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered and searched SMS
  const filteredSMS = useMemo(() => {
    return smsMessages.filter(sms => {
      const matchesSearch =
        sms.phoneNumber?.includes(searchTerm) ||
        sms.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || sms.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [smsMessages, searchTerm, statusFilter]);

  // Paginated SMS
  const paginatedSMS = useMemo(() => {
    return filteredSMS.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredSMS, page, rowsPerPage]);

  const handleMenuOpen = (event, sms) => {
    setAnchorEl(event.currentTarget);
    setSelectedSMS(sms);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleComposeSMS = () => {
    setSelectedSMS(null);
    setFormData({ phoneNumber: '', message: '', status: 'draft' });
    setDialogOpen(true);
  };

  const handleEditSMS = () => {
    setFormData({
      phoneNumber: selectedSMS.phoneNumber || '',
      message: selectedSMS.message || '',
      status: selectedSMS.status || 'draft'
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteSMS = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'sms', selectedSMS.id));
      setSnackbar({ open: true, message: 'SMS deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedSMS(null);
    } catch (error) {
      console.error('Error deleting SMS:', error);
      setSnackbar({ open: true, message: 'Error deleting SMS', severity: 'error' });
    }
  };

  const handleSaveSMS = async () => {
    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s()-]/g, ''))) {
      setSnackbar({ open: true, message: 'Please enter a valid phone number', severity: 'error' });
      return;
    }

    try {
      if (selectedSMS?.id) {
        // Update existing SMS
        await updateDoc(doc(db, 'sms', selectedSMS.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'SMS updated successfully', severity: 'success' });
      } else {
        // Add new SMS
        await addDoc(collection(db, 'sms'), {
          ...formData,
          deliveryStatus: 'pending',
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'SMS created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedSMS(null);
    } catch (error) {
      console.error('Error saving SMS:', error);
      setSnackbar({ open: true, message: 'Error saving SMS', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'sent': return 'info';
      case 'draft': return 'default';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return null;
    }
  };

  return (
    <Box>
      {/* Header Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search SMS messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleComposeSMS}
              >
                Send SMS
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SMS Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Phone Number</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Segments</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSMS.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm || statusFilter !== 'all'
                        ? 'No SMS messages match your filters'
                        : 'No SMS messages yet. Click "Send SMS" to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSMS.map((sms) => (
                  <TableRow key={sms.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone size={16} />
                        <Typography variant="body2">
                          {sms.phoneNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {sms.message || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(sms.status)}
                        label={sms.status || 'draft'}
                        color={getStatusColor(sms.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Math.ceil((sms.message?.length || 0) / 160)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {sms.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, sms)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredSMS.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditSMS}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        {selectedSMS?.status === 'draft' && (
          <MenuItem onClick={() => { handleMenuClose(); }}>
            <Send size={16} style={{ marginRight: 8 }} />
            Send Now
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteSMS} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Compose/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSMS ? 'Edit SMS' : 'Send New SMS'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+1234567890"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                helperText={`${charCount}/${maxChars} characters (${segmentCount} segment${segmentCount !== 1 ? 's' : ''})`}
              />
              <LinearProgress
                variant="determinate"
                value={Math.min((charCount / maxChars) * 100, 100)}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                color={charCount > maxChars ? 'warning' : 'primary'}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                Standard SMS: 160 characters. Messages over 160 chars are split into multiple segments.
                Include "Reply STOP to unsubscribe" for compliance.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSMS} variant="contained">
            {selectedSMS ? 'Update' : 'Send'} SMS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this SMS? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SMSTab;
