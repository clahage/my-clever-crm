import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  IconButton, Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw, Code, Webhook
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return 'sk_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const APITab = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [webhookData, setWebhookData] = useState({ url: '', events: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = userProfile?.role >= 7;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadApiKeys(), loadWebhooks()]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load API data');
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      const keysQuery = query(
        collection(db, 'apiKeys'),
        orderBy('created', 'desc')
      );
      const snapshot = await getDocs(keysQuery);
      const keysData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApiKeys(keysData);
    } catch (err) {
      console.error('Error loading API keys:', err);
      setApiKeys([]);
    }
  };

  const loadWebhooks = async () => {
    try {
      const webhooksQuery = query(
        collection(db, 'webhooks'),
        orderBy('created', 'desc')
      );
      const snapshot = await getDocs(webhooksQuery);
      const webhooksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWebhooks(webhooksData);
    } catch (err) {
      console.error('Error loading webhooks:', err);
      setWebhooks([]);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.name) {
        setError('API key name is required');
        return;
      }

      const newKey = generateApiKey();
      await addDoc(collection(db, 'apiKeys'), {
        name: formData.name,
        description: formData.description,
        key: newKey,
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        status: 'active',
        createdBy: currentUser.uid
      });

      setSuccess('API key created successfully');
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      loadApiKeys();
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'apiKeys', keyId));
        setSuccess('API key revoked successfully');
        loadApiKeys();
      } catch (err) {
        console.error('Error deleting API key:', err);
        setError('Failed to revoke API key');
      }
    }
  };

  const handleCreateWebhook = async () => {
    try {
      setError('');
      setSuccess('');

      if (!webhookData.url) {
        setError('Webhook URL is required');
        return;
      }

      await addDoc(collection(db, 'webhooks'), {
        url: webhookData.url,
        events: webhookData.events || [],
        created: new Date(),
        status: 'active',
        createdBy: currentUser.uid
      });

      setSuccess('Webhook created successfully');
      setWebhookDialogOpen(false);
      setWebhookData({ url: '', events: [] });
      loadWebhooks();
    } catch (err) {
      console.error('Error creating webhook:', err);
      setError('Failed to create webhook');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Key size={24} />
          <div>
            <Typography variant="h5" fontWeight="bold">
              API Keys & Webhooks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage API credentials and webhook integrations
            </Typography>
          </div>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Webhook />}
            onClick={() => setWebhookDialogOpen(true)}
            disabled={!isAdmin}
          >
            Add Webhook
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => setDialogOpen(true)}
            disabled={!isAdmin}
          >
            Add API Key
          </Button>
        </Box>
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

      {/* API Keys Section */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        API Keys
      </Typography>

      {apiKeys.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Key size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No API keys created yet
          </Typography>
          <Button variant="contained" startIcon={<Plus />} onClick={() => setDialogOpen(true)} disabled={!isAdmin}>
            Create Your First API Key
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {apiKeys.map((apiKey) => (
            <Grid item xs={12} key={apiKey.id}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip label={apiKey.status} size="small" color="success" sx={{ textTransform: 'capitalize' }} />
                      <Typography variant="h6" fontWeight="600">
                        {apiKey.name}
                      </Typography>
                    </Box>

                    {apiKey.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {apiKey.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box
                        component="code"
                        sx={{
                          bgcolor: 'grey.100',
                          p: 1.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          flex: 1
                        }}
                      >
                        {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                      </Box>
                      <IconButton size="small" onClick={() => toggleKeyVisibility(apiKey.id)}>
                        {visibleKeys[apiKey.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                      <IconButton size="small" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy size={18} />
                      </IconButton>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Created</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {format(apiKey.created.toDate ? apiKey.created.toDate() : new Date(apiKey.created), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Last Used</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {formatDistanceToNow(apiKey.lastUsed.toDate ? apiKey.lastUsed.toDate() : new Date(apiKey.lastUsed), { addSuffix: true })}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Total Calls</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {apiKey.usageCount?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Typography variant="body2" fontWeight="600" sx={{ color: 'success.main' }}>
                          Active
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small" startIcon={<RefreshCw size={16} />} disabled={!isAdmin}>
                        Regenerate
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        disabled={!isAdmin}
                      >
                        Revoke
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Webhooks Section */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        Webhooks
      </Typography>

      {webhooks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Webhook size={48} style={{ color: '#9CA3AF', margin: '0 auto 16px' }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            No webhooks configured yet
          </Typography>
          <Button variant="outlined" startIcon={<Plus />} onClick={() => setWebhookDialogOpen(true)} disabled={!isAdmin}>
            Add Webhook
          </Button>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id} hover>
                    <TableCell>
                      <Box component="code" sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {webhook.url}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={webhook.events?.length || 'All'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={webhook.status} size="small" color="success" sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>
                      {format(webhook.created.toDate ? webhook.created.toDate() : new Date(webhook.created), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" disabled={!isAdmin}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
          Security Notice
        </Typography>
        <Typography variant="caption">
          Keep your API keys secure and never share them publicly. Rotate keys regularly for enhanced security.
        </Typography>
      </Alert>

      {/* Create API Key Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Key Name"
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateApiKey}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Webhook</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Webhook URL"
              value={webhookData.url}
              onChange={(e) => setWebhookData({ ...webhookData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateWebhook}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APITab;
