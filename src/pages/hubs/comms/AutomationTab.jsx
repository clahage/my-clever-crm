// Path: /src/pages/hubs/comms/AutomationTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - AUTOMATION TAB
// ============================================================================
// Purpose: Trigger-based automation with event-driven workflows
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
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Zap,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const AUTOMATION_TRIGGERS = [
  { value: 'client_signup', label: 'Client Signup' },
  { value: 'milestone', label: 'Milestone Reached' },
  { value: 'inactive', label: 'Client Inactive' },
  { value: 'payment', label: 'Payment Received' },
  { value: 'birthday', label: 'Birthday' }
];

const AutomationTab = () => {
  const { userProfile } = useAuth();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'client_signup',
    status: 'active',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'automations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const automationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAutomations(automationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAutomations = useMemo(() => {
    return automations.filter(automation =>
      automation.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [automations, searchTerm]);

  const handleMenuOpen = (event, automation) => {
    setAnchorEl(event.currentTarget);
    setSelectedAutomation(automation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedAutomation(null);
    setFormData({ name: '', trigger: 'client_signup', status: 'active', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      name: selectedAutomation.name || '',
      trigger: selectedAutomation.trigger || 'client_signup',
      status: selectedAutomation.status || 'active',
      description: selectedAutomation.description || ''
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
      await deleteDoc(doc(db, 'automations', selectedAutomation.id));
      setSnackbar({ open: true, message: 'Automation deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedAutomation(null);
    } catch (error) {
      console.error('Error deleting automation:', error);
      setSnackbar({ open: true, message: 'Error deleting automation', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedAutomation?.id) {
        await updateDoc(doc(db, 'automations', selectedAutomation.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Automation updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'automations'), {
          ...formData,
          executions: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Automation created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedAutomation(null);
    } catch (error) {
      console.error('Error saving automation:', error);
      setSnackbar({ open: true, message: 'Error saving automation', severity: 'error' });
    }
  };

  const handleToggle = async (automation) => {
    try {
      const newStatus = automation.status === 'active' ? 'paused' : 'active';
      await updateDoc(doc(db, 'automations', automation.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setSnackbar({
        open: true,
        message: `Automation ${newStatus === 'active' ? 'activated' : 'paused'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling automation:', error);
      setSnackbar({ open: true, message: 'Error updating automation', severity: 'error' });
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
                placeholder="Search automations..."
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
                Create Automation
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredAutomations.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm
                    ? 'No automations match your search'
                    : 'No automations yet. Click "Create Automation" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredAutomations.map((automation) => (
            <Grid item xs={12} md={6} key={automation.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {automation.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          icon={<Zap size={14} />}
                          label={AUTOMATION_TRIGGERS.find(t => t.value === automation.trigger)?.label || automation.trigger}
                          size="small"
                        />
                        <Chip
                          label={automation.status}
                          color={automation.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {automation.description || 'No description'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Executions: {automation.executions || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        color={automation.status === 'active' ? 'warning' : 'success'}
                        onClick={() => handleToggle(automation)}
                      >
                        {automation.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, automation)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAutomation ? 'Edit Automation' : 'Create New Automation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Automation Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Trigger</InputLabel>
                <Select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  label="Trigger"
                >
                  {AUTOMATION_TRIGGERS.map(trigger => (
                    <MenuItem key={trigger.value} value={trigger.value}>{trigger.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'paused' })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedAutomation ? 'Update' : 'Create'} Automation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this automation? This action cannot be undone.
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

export default AutomationTab;
