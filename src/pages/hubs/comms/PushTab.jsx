// Path: /src/pages/hubs/comms/PushTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - PUSH NOTIFICATIONS TAB
// ============================================================================
// Purpose: Mobile push notification management
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
  Grid,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Bell,
  Send
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const PushTab = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    status: 'draft'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'pushNotifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification =>
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications, searchTerm]);

  const paginatedNotifications = useMemo(() => {
    return filteredNotifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredNotifications, page, rowsPerPage]);

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedNotification(null);
    setFormData({ title: '', message: '', audience: 'all', status: 'draft' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      title: selectedNotification.title || '',
      message: selectedNotification.message || '',
      audience: selectedNotification.audience || 'all',
      status: selectedNotification.status || 'draft'
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'pushNotifications', selectedNotification.id));
      setSnackbar({ open: true, message: 'Notification deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({ open: true, message: 'Error deleting notification', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedNotification?.id) {
        await updateDoc(doc(db, 'pushNotifications', selectedNotification.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Notification updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'pushNotifications'), {
          ...formData,
          delivered: 0,
          clicked: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Notification created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error saving notification:', error);
      setSnackbar({ open: true, message: 'Error saving notification', severity: 'error' });
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
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
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleCreate}
              >
                Create Notification
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Audience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivered</TableCell>
                <TableCell>Clicked</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm
                        ? 'No notifications match your search'
                        : 'No notifications yet. Click "Create Notification" to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotifications.map((notification) => (
                  <TableRow key={notification.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Bell size={16} />
                        <Typography variant="body2" fontWeight={500}>
                          {notification.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {notification.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={notification.audience || 'all'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status || 'draft'}
                        color={notification.status === 'sent' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{notification.delivered || 0}</TableCell>
                    <TableCell>{notification.clicked || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, notification)}>
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
          count={filteredNotifications.length}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        {selectedNotification?.status === 'draft' && (
          <MenuItem onClick={() => { handleMenuClose(); }}>
            <Send size={16} style={{ marginRight: 8 }} />
            Send Now
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedNotification ? 'Edit Notification' : 'Create New Notification'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="all, active_clients, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedNotification ? 'Update' : 'Create'} Notification
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default PushTab;
