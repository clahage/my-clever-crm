import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  IconButton, Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel
} from '@mui/material';
import {
  Zap, Plus, Edit, Trash2, Mail, MessageSquare, Bell, FileText,
  Users, Calendar, Database, Code
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ACTION_TYPES = [
  { id: 'email', name: 'Send Email', icon: Mail, color: '#3B82F6', description: 'Send automated emails' },
  { id: 'sms', name: 'Send SMS', icon: MessageSquare, color: '#10B981', description: 'Send text messages' },
  { id: 'notification', name: 'Push Notification', icon: Bell, color: '#F59E0B', description: 'Send push notifications' },
  { id: 'task', name: 'Create Task', icon: FileText, color: '#8B5CF6', description: 'Create automated tasks' },
  { id: 'update', name: 'Update Record', icon: Database, color: '#EC4899', description: 'Update database records' },
  { id: 'webhook', name: 'Webhook', icon: Code, color: '#06B6D4', description: 'Trigger external webhooks' },
  { id: 'assign', name: 'Assign User', icon: Users, color: '#F59E0B', description: 'Assign to team members' },
  { id: 'schedule', name: 'Schedule Event', icon: Calendar, color: '#10B981', description: 'Schedule calendar events' },
];

const ActionsTab = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    enabled: true,
    config: {}
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = userProfile?.role >= 7;

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      setLoading(true);
      const actionsQuery = query(
        collection(db, 'actions'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(actionsQuery);
      const actionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActions(actionsData);
    } catch (err) {
      console.error('Error loading actions:', err);
      setError('Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (action = null) => {
    if (action) {
      setSelectedAction(action);
      setFormData({
        name: action.name || '',
        description: action.description || '',
        type: action.type || 'email',
        enabled: action.enabled !== false,
        config: action.config || {}
      });
    } else {
      setSelectedAction(null);
      setFormData({
        name: '',
        description: '',
        type: 'email',
        enabled: true,
        config: {}
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAction(null);
  };

  const handleSaveAction = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.name) {
        setError('Action name is required');
        return;
      }

      if (selectedAction) {
        // Update existing action
        const actionRef = doc(db, 'actions', selectedAction.id);
        await updateDoc(actionRef, {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        });
        setSuccess('Action updated successfully');
      } else {
        // Create new action
        await addDoc(collection(db, 'actions'), {
          ...formData,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
          usageCount: 0
        });
        setSuccess('Action created successfully');
      }

      handleCloseDialog();
      loadActions();
    } catch (err) {
      console.error('Error saving action:', err);
      setError('Failed to save action');
    }
  };

  const handleDeleteAction = async (actionId) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await deleteDoc(doc(db, 'actions', actionId));
        setSuccess('Action deleted successfully');
        loadActions();
      } catch (err) {
        console.error('Error deleting action:', err);
        setError('Failed to delete action');
      }
    }
  };

  const handleToggleAction = async (action) => {
    try {
      const actionRef = doc(db, 'actions', action.id);
      await updateDoc(actionRef, {
        enabled: !action.enabled,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      });
      loadActions();
    } catch (err) {
      console.error('Error toggling action:', err);
      setError('Failed to toggle action');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getActionType = (typeId) => {
    return ACTION_TYPES.find(t => t.id === typeId) || ACTION_TYPES[0];
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Zap size={24} />
          <div>
            <Typography variant="h5" fontWeight="bold">
              Action Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automation actions and templates
            </Typography>
          </div>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => handleOpenDialog()}
          disabled={!isAdmin}
        >
          Create Action
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Action Types */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        Available Action Types
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {ACTION_TYPES.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${type.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <type.icon size={20} style={{ color: type.color }} />
                </Box>
                <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                  {type.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Created Actions */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        Your Actions ({actions.length})
      </Typography>

      {actions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Zap size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No actions created yet
          </Typography>
          <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpenDialog()} disabled={!isAdmin}>
            Create Your First Action
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {actions.map((action) => {
            const actionType = getActionType(action.type);
            return (
              <Grid item xs={12} sm={6} md={4} key={action.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: `${actionType.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <actionType.icon size={20} style={{ color: actionType.color }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(action)} disabled={!isAdmin}>
                          <Edit size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteAction(action.id)} disabled={!isAdmin}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                      {action.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {action.description || actionType.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={actionType.name}
                        size="small"
                        sx={{ bgcolor: `${actionType.color}20`, color: actionType.color }}
                      />
                      <Switch
                        checked={action.enabled !== false}
                        onChange={() => handleToggleAction(action)}
                        disabled={!isAdmin}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Used {action.usageCount || 0} times
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Action Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAction ? 'Edit Action' : 'Create New Action'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Action Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              fullWidth
              select
              label="Action Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              SelectProps={{ native: true }}
            >
              {ACTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="Enable this action"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAction}>
            {selectedAction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActionsTab;
