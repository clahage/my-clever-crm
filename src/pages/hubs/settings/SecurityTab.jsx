import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Switch,
  FormControlLabel, Alert, CircularProgress, Divider
} from '@mui/material';
import { Lock, Save, Shield, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const SecurityTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    require2FA: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    ipWhitelist: '',
    maxLoginAttempts: 5,
    enableAuditLog: true,
    requireStrongPassword: true,
    allowPasswordReset: true,
    enableEmailVerification: true,
    lockoutDuration: 30,
    passwordMinLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(db, 'securitySettings', 'main');
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        setSettings({ ...settings, ...settingsSnap.data() });
      }
    } catch (err) {
      console.error('Error loading security settings:', err);
      setError('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const settingsRef = doc(db, 'securitySettings', 'main');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid
      }, { merge: true });

      setSuccess('Security settings saved successfully');
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError('Failed to save security settings');
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
        <Lock size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Security & Compliance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure security settings and compliance tools
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
        {/* Authentication Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Shield size={20} />
              <Typography variant="h6" fontWeight="600">
                Authentication
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.require2FA}
                    onChange={(e) => handleChange('require2FA', e.target.checked)}
                  />
                }
                label="Require Two-Factor Authentication (2FA)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableEmailVerification}
                    onChange={(e) => handleChange('enableEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowPasswordReset}
                    onChange={(e) => handleChange('allowPasswordReset', e.target.checked)}
                  />
                }
                label="Allow Password Reset"
              />

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                helperText="Time before inactive sessions are automatically logged out"
              />

              <TextField
                fullWidth
                type="number"
                label="Password Expiry (days)"
                value={settings.passwordExpiry}
                onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                helperText="Users must change password after this many days (0 = never)"
              />

              <TextField
                fullWidth
                type="number"
                label="Max Login Attempts"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                helperText="Number of failed login attempts before account lockout"
              />

              <TextField
                fullWidth
                type="number"
                label="Lockout Duration (minutes)"
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
                helperText="How long accounts remain locked after max attempts"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Password Policy */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Lock size={20} />
              <Typography variant="h6" fontWeight="600">
                Password Policy
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireStrongPassword}
                    onChange={(e) => handleChange('requireStrongPassword', e.target.checked)}
                  />
                }
                label="Enforce Strong Password Policy"
              />

              <TextField
                fullWidth
                type="number"
                label="Minimum Password Length"
                value={settings.passwordMinLength}
                onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                disabled={!settings.requireStrongPassword}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireUppercase}
                    onChange={(e) => handleChange('requireUppercase', e.target.checked)}
                    disabled={!settings.requireStrongPassword}
                  />
                }
                label="Require Uppercase Letter"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireNumber}
                    onChange={(e) => handleChange('requireNumber', e.target.checked)}
                    disabled={!settings.requireStrongPassword}
                  />
                }
                label="Require Number"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireSpecialChar}
                    onChange={(e) => handleChange('requireSpecialChar', e.target.checked)}
                    disabled={!settings.requireStrongPassword}
                  />
                }
                label="Require Special Character"
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Strong password policy helps protect user accounts from unauthorized access.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* IP Whitelist */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AlertCircle size={20} />
              <Typography variant="h6" fontWeight="600">
                IP Whitelist
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Allowed IP Addresses (one per line)"
              value={settings.ipWhitelist}
              onChange={(e) => handleChange('ipWhitelist', e.target.value)}
              placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
              helperText="Leave empty to allow access from all IP addresses. Add one IP address per line."
            />
          </Paper>
        </Grid>

        {/* Audit & Compliance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Shield size={20} />
              <Typography variant="h6" fontWeight="600">
                Audit & Compliance
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAuditLog}
                    onChange={(e) => handleChange('enableAuditLog', e.target.checked)}
                  />
                }
                label="Enable Audit Logging"
              />

              <Alert severity="warning">
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                  Security Best Practices
                </Typography>
                <Typography variant="caption">
                  • Enable 2FA for all admin users<br />
                  • Regularly review audit logs for suspicious activity<br />
                  • Use strong password policies<br />
                  • Limit IP access when possible<br />
                  • Review user permissions regularly
                </Typography>
              </Alert>
            </Box>
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
          {saving ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default SecurityTab;
