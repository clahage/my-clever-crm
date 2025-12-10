// Path: /src/pages/hubs/comms/EmailTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - EMAIL MANAGER TAB
// ============================================================================
// Purpose: Send and manage emails with real-time tracking
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
  Tooltip
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Mail,
  Eye,
  Send,
  Clock,
  CheckCircle
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const EmailTab = () => {
  const { userProfile } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
    status: 'draft',
    scheduledFor: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Subscribe to emails
  useEffect(() => {
    const q = query(collection(db, 'emails'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emailsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmails(emailsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered and searched emails
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchesSearch =
        email.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || email.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [emails, searchTerm, statusFilter]);

  // Paginated emails
  const paginatedEmails = useMemo(() => {
    return filteredEmails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredEmails, page, rowsPerPage]);

  const handleMenuOpen = (event, email) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmail(email);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleComposeEmail = () => {
    setSelectedEmail(null);
    setFormData({ recipient: '', subject: '', body: '', status: 'draft', scheduledFor: null });
    setDialogOpen(true);
  };

  const handleEditEmail = () => {
    setFormData({
      recipient: selectedEmail.recipient || '',
      subject: selectedEmail.subject || '',
      body: selectedEmail.body || '',
      status: selectedEmail.status || 'draft',
      scheduledFor: selectedEmail.scheduledFor || null
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteEmail = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'emails', selectedEmail.id));
      setSnackbar({ open: true, message: 'Email deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedEmail(null);
    } catch (error) {
      console.error('Error deleting email:', error);
      setSnackbar({ open: true, message: 'Error deleting email', severity: 'error' });
    }
  };

  const handleSaveEmail = async () => {
    try {
      if (selectedEmail?.id) {
        // Update existing email
        await updateDoc(doc(db, 'emails', selectedEmail.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Email updated successfully', severity: 'success' });
      } else {
        // Add new email
        await addDoc(collection(db, 'emails'), {
          ...formData,
          opens: 0,
          clicks: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Email created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedEmail(null);
    } catch (error) {
      console.error('Error saving email:', error);
      setSnackbar({ open: true, message: 'Error saving email', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'draft': return 'default';
      case 'scheduled': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle size={16} />;
      case 'scheduled': return <Clock size={16} />;
      case 'draft': return <Edit size={16} />;
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
                placeholder="Search emails..."
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
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleComposeEmail}
              >
                Compose Email
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Emails Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Recipient</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Opens</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm || statusFilter !== 'all'
                        ? 'No emails match your filters'
                        : 'No emails yet. Click "Compose Email" to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmails.map((email) => (
                  <TableRow key={email.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Mail size={16} />
                        <Typography variant="body2">
                          {email.recipient || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {email.subject || 'No Subject'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(email.status)}
                        label={email.status || 'draft'}
                        color={getStatusColor(email.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Eye size={14} />
                        <Typography variant="body2">{email.opens || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{email.clicks || 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {email.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, email)}>
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
          count={filteredEmails.length}
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
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditEmail}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        {selectedEmail?.status === 'draft' && (
          <MenuItem onClick={() => { handleMenuClose(); }}>
            <Send size={16} style={{ marginRight: 8 }} />
            Send Now
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteEmail} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Compose/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEmail ? 'Edit Email' : 'Compose New Email'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipient Email"
                type="email"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Body"
                multiline
                rows={8}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="sent">Send Now</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEmail} variant="contained">
            {selectedEmail ? 'Update' : 'Save'} Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this email? This action cannot be undone.
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

export default EmailTab;
