import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Switch, FormControlLabel, Alert, CircularProgress
} from '@mui/material';
import { Save, Settings } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const GeneralTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    companyName: 'Speedy Credit Repair',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyCity: '',
    companyState: '',
    companyZip: '',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    language: 'en',
    fiscalYearStart: '01',
    enableDarkMode: false,
    compactView: false,
    enableNotifications: true,
    enableEmailDigest: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'settings', 'general');
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        setSettings({ ...settings, ...settingsSnap.data() });
      }
    } catch (err) {
      console.error('Error loading general settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      }, { merge: true });

      setSuccess('General settings saved successfully');
    } catch (err) {
      console.error('Error saving general settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
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
        <Settings size={24} />
        <Typography variant="h5" fontWeight="bold">
          General Settings
        </Typography>
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
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Company Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
              />
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
              />
              <TextField
                fullWidth
                label="Company Phone"
                value={settings.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
              />
              <TextField
                fullWidth
                label="Address"
                value={settings.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={settings.companyCity}
                    onChange={(e) => handleChange('companyCity', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="State"
                    value={settings.companyState}
                    onChange={(e) => handleChange('companyState', e.target.value)}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="ZIP"
                    value={settings.companyZip}
                    onChange={(e) => handleChange('companyZip', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Regional Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Regional Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                  <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                  <MenuItem value="America/Phoenix">Arizona (MST)</MenuItem>
                  <MenuItem value="America/Anchorage">Alaska (AKT)</MenuItem>
                  <MenuItem value="Pacific/Honolulu">Hawaii (HST)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.dateFormat}
                  label="Date Format"
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Europe)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                  <MenuItem value="MMM DD, YYYY">MMM DD, YYYY</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Time Format</InputLabel>
                <Select
                  value={settings.timeFormat}
                  label="Time Format"
                  onChange={(e) => handleChange('timeFormat', e.target.value)}
                >
                  <MenuItem value="12h">12 Hour (3:00 PM)</MenuItem>
                  <MenuItem value="24h">24 Hour (15:00)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={settings.currency}
                  label="Currency"
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="CAD">CAD ($)</MenuItem>
                  <MenuItem value="AUD">AUD ($)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Fiscal Year Start</InputLabel>
                <Select
                  value={settings.fiscalYearStart}
                  label="Fiscal Year Start"
                  onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
                >
                  <MenuItem value="01">January</MenuItem>
                  <MenuItem value="02">February</MenuItem>
                  <MenuItem value="03">March</MenuItem>
                  <MenuItem value="04">April</MenuItem>
                  <MenuItem value="05">May</MenuItem>
                  <MenuItem value="06">June</MenuItem>
                  <MenuItem value="07">July</MenuItem>
                  <MenuItem value="08">August</MenuItem>
                  <MenuItem value="09">September</MenuItem>
                  <MenuItem value="10">October</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">December</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        {/* Appearance & Preferences */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Appearance & Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableDarkMode}
                      onChange={(e) => handleChange('enableDarkMode', e.target.checked)}
                    />
                  }
                  label="Enable Dark Mode"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactView}
                      onChange={(e) => handleChange('compactView', e.target.checked)}
                    />
                  }
                  label="Compact View"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableEmailDigest}
                      onChange={(e) => handleChange('enableEmailDigest', e.target.checked)}
                    />
                  }
                  label="Daily Email Digest"
                />
              </Grid>
            </Grid>
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
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default GeneralTab;
