import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Switch, FormControlLabel, TextField, Alert, CircularProgress, Divider
} from '@mui/material';
import { Smartphone, Save, Download, Bell, Lock, Wifi } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const MobileTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    enableMobileApp: true,
    enablePushNotifications: true,
    enableBiometric: true,
    enableOfflineMode: true,
    autoSync: true,
    syncInterval: 15,
    requirePinCode: false,
    pinCodeLength: 4,
    appVersion: '1.0.0',
    minSupportedVersion: '1.0.0',
    forceUpdate: false,
    maintenanceMode: false,
    maintenanceMessage: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configRef = doc(db, 'mobileConfig', 'main');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        setConfig({ ...config, ...configSnap.data() });
      }
    } catch (err) {
      console.error('Error loading mobile config:', err);
      setError('Failed to load mobile app configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const configRef = doc(db, 'mobileConfig', 'main');
      await setDoc(configRef, {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      }, { merge: true });

      setSuccess('Mobile app configuration saved successfully');
    } catch (err) {
      console.error('Error saving mobile config:', err);
      setError('Failed to save mobile app configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
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
        <Smartphone size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Mobile App Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure mobile app settings and features
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
        {/* App Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Smartphone size={20} />
                <Typography variant="h6" fontWeight="600">
                  App Status
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {config.enableMobileApp ? 'Active' : 'Disabled'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Version: {config.appVersion}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Download size={20} />
                <Typography variant="h6" fontWeight="600">
                  Total Downloads
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users: 892
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Wifi size={20} />
                <Typography variant="h6" fontWeight="600">
                  Sync Status
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                Online
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last sync: 2 minutes ago
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              General Settings
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableMobileApp}
                    onChange={(e) => handleChange('enableMobileApp', e.target.checked)}
                  />
                }
                label="Enable Mobile App"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />

              {config.maintenanceMode && (
                <TextField
                  fullWidth
                  label="Maintenance Message"
                  multiline
                  rows={3}
                  value={config.maintenanceMessage}
                  onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                  helperText="Message shown to users during maintenance"
                />
              )}

              <Divider />

              <TextField
                fullWidth
                label="Current Version"
                value={config.appVersion}
                onChange={(e) => handleChange('appVersion', e.target.value)}
                helperText="Current app version number"
              />

              <TextField
                fullWidth
                label="Minimum Supported Version"
                value={config.minSupportedVersion}
                onChange={(e) => handleChange('minSupportedVersion', e.target.value)}
                helperText="Oldest version that can still connect"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.forceUpdate}
                    onChange={(e) => handleChange('forceUpdate', e.target.checked)}
                  />
                }
                label="Force Update for Old Versions"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Bell size={20} />
              <Typography variant="h6" fontWeight="600">
                Features & Notifications
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enablePushNotifications}
                    onChange={(e) => handleChange('enablePushNotifications', e.target.checked)}
                  />
                }
                label="Enable Push Notifications"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableBiometric}
                    onChange={(e) => handleChange('enableBiometric', e.target.checked)}
                  />
                }
                label="Enable Biometric Authentication"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableOfflineMode}
                    onChange={(e) => handleChange('enableOfflineMode', e.target.checked)}
                  />
                }
                label="Enable Offline Mode"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.requirePinCode}
                    onChange={(e) => handleChange('requirePinCode', e.target.checked)}
                  />
                }
                label="Require PIN Code"
              />

              {config.requirePinCode && (
                <TextField
                  fullWidth
                  type="number"
                  label="PIN Code Length"
                  value={config.pinCodeLength}
                  onChange={(e) => handleChange('pinCodeLength', parseInt(e.target.value))}
                  helperText="Number of digits for PIN code"
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sync Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Wifi size={20} />
              <Typography variant="h6" fontWeight="600">
                Sync Settings
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoSync}
                      onChange={(e) => handleChange('autoSync', e.target.checked)}
                    />
                  }
                  label="Enable Auto-Sync"
                />
              </Grid>

              {config.autoSync && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sync Interval (minutes)"
                    value={config.syncInterval}
                    onChange={(e) => handleChange('syncInterval', parseInt(e.target.value))}
                    helperText="How often to sync data automatically"
                  />
                </Grid>
              )}
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Auto-sync helps keep mobile data up to date but may increase battery usage.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Download Links */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              App Distribution
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Download />}
                  sx={{ height: 56 }}
                >
                  Download for iOS
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Download />}
                  sx={{ height: 56 }}
                >
                  Download for Android
                </Button>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Mobile apps are available for iOS and Android devices. Distribute these links to your team.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>
    </Box>
  );
};

export default MobileTab;
