import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Chip,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, FormControlLabel
} from '@mui/material';
import {
  Zap, Shield, Phone, CreditCard, MessageSquare, Mail, Repeat,
  ExternalLink, Check
} from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const INTEGRATIONS = [
  {
    id: 'idiq',
    name: 'IDIQ Credit Reports',
    description: 'Credit report provider (Partner ID: 11981)',
    icon: Shield,
    status: 'connected',
    category: 'credit',
    color: '#3B82F6',
    fields: ['partnerId', 'apiKey', 'environment']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI-powered features and automation',
    icon: Zap,
    status: 'connected',
    category: 'ai',
    color: '#10B981',
    fields: ['apiKey', 'model', 'maxTokens']
  },
  {
    id: 'telnyx',
    name: 'Telnyx',
    description: 'Fax and telecommunications',
    icon: Phone,
    status: 'connected',
    category: 'communication',
    color: '#F59E0B',
    fields: ['apiKey', 'faxNumber', 'smsNumber']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing',
    icon: CreditCard,
    status: 'available',
    category: 'payment',
    color: '#8B5CF6',
    fields: ['publishableKey', 'secretKey', 'webhookSecret']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communications',
    icon: MessageSquare,
    status: 'available',
    category: 'communication',
    color: '#EC4899',
    fields: ['accountSid', 'authToken', 'phoneNumber']
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery service',
    icon: Mail,
    status: 'available',
    category: 'communication',
    color: '#06B6D4',
    fields: ['apiKey', 'fromEmail', 'fromName']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation',
    icon: Repeat,
    status: 'available',
    category: 'automation',
    color: '#FF4A00',
    fields: ['apiKey', 'webhookUrl']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications',
    icon: MessageSquare,
    status: 'available',
    category: 'notification',
    color: '#4A154B',
    fields: ['webhookUrl', 'channel', 'botToken']
  }
];

const IntegrationsTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configData, setConfigData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const integrationsQuery = query(collection(db, 'integrations'));
      const snapshot = await getDocs(integrationsQuery);

      const savedIntegrations = {};
      snapshot.docs.forEach(doc => {
        savedIntegrations[doc.id] = doc.data();
      });

      // Update integration statuses based on saved data
      const updated = INTEGRATIONS.map(integration => ({
        ...integration,
        status: savedIntegrations[integration.id]?.enabled ? 'connected' : integration.status,
        config: savedIntegrations[integration.id] || {}
      }));

      setIntegrations(updated);
    } catch (err) {
      console.error('Error loading integrations:', err);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (integration) => {
    setSelectedIntegration(integration);
    setConfigData(integration.config || {});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedIntegration(null);
    setConfigData({});
  };

  const handleSaveIntegration = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const integrationRef = doc(db, 'integrations', selectedIntegration.id);
      await setDoc(integrationRef, {
        ...configData,
        enabled: true,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      }, { merge: true });

      setSuccess(`${selectedIntegration.name} configured successfully`);
      handleCloseDialog();
      loadIntegrations();
    } catch (err) {
      console.error('Error saving integration:', err);
      setError('Failed to save integration configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (integrationId) => {
    if (window.confirm('Are you sure you want to disconnect this integration?')) {
      try {
        const integrationRef = doc(db, 'integrations', integrationId);
        await setDoc(integrationRef, {
          enabled: false,
          updatedAt: serverTimestamp(),
          updatedBy: currentUser.uid
        }, { merge: true });

        setSuccess('Integration disconnected successfully');
        loadIntegrations();
      } catch (err) {
        console.error('Error disconnecting integration:', err);
        setError('Failed to disconnect integration');
      }
    }
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Zap size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect external services to enhance your CRM
          </Typography>
        </div>
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

      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} sm={6} md={4} key={integration.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${integration.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <integration.icon size={24} style={{ color: integration.color }} />
                  </Box>
                  <Chip
                    label={integration.status}
                    size="small"
                    color={integration.status === 'connected' ? 'success' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>

                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  {integration.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {integration.description}
                </Typography>

                <Chip
                  label={integration.category}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2, textTransform: 'capitalize', alignSelf: 'flex-start' }}
                />

                {integration.status === 'connected' ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleOpenDialog(integration)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleOpenDialog(integration)}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Integration Configuration Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedIntegration?.name} Configuration
        </DialogTitle>
        <DialogContent>
          {selectedIntegration && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" icon={<integration.icon size={20} />}>
                <Typography variant="body2">
                  Configure your {selectedIntegration.name} integration settings below.
                </Typography>
              </Alert>

              {selectedIntegration.fields.map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  value={configData[field] || ''}
                  onChange={(e) => setConfigData({ ...configData, [field]: e.target.value })}
                  type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                />
              ))}

              <FormControlLabel
                control={
                  <Switch
                    checked={configData.enabled !== false}
                    onChange={(e) => setConfigData({ ...configData, enabled: e.target.checked })}
                  />
                }
                label="Enable this integration"
              />

              {selectedIntegration.status === 'connected' && (
                <Alert severity="success">
                  <Typography variant="caption">
                    This integration is currently active and connected.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveIntegration}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Check />}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationsTab;
