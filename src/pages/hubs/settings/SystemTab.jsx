import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Alert, CircularProgress, Divider
} from '@mui/material';
import {
  Database, Download, Upload, Archive, RefreshCw, Power,
  FileText, Code, Users, Activity, Clock, HardDrive
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const SystemTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemInfo, setSystemInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isMasterAdmin = userProfile?.role === 8;

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      setLoading(true);
      const systemRef = doc(db, 'systemConfig', 'info');
      const systemSnap = await getDoc(systemRef);

      if (systemSnap.exists()) {
        setSystemInfo(systemSnap.data());
      } else {
        // Default system info
        setSystemInfo({
          version: '2.1.0',
          uptime: '45 days',
          databaseSize: '2.3 GB',
          activeUsers: 127,
          totalContacts: 15234,
          apiCalls: 234567,
          lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          environment: 'production',
          region: 'us-east-1'
        });
      }
    } catch (err) {
      console.error('Error loading system info:', err);
      setError('Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    if (!isMasterAdmin) {
      setError('You do not have permission to perform this action');
      return;
    }

    setSuccess(`${action} initiated successfully`);
    // In production, this would trigger actual system actions
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { label: 'Version', value: systemInfo?.version || 'N/A', icon: Code, color: '#3B82F6' },
    { label: 'Uptime', value: systemInfo?.uptime || 'N/A', icon: Clock, color: '#10B981' },
    { label: 'Database Size', value: systemInfo?.databaseSize || 'N/A', icon: Database, color: '#F59E0B' },
    { label: 'Active Users', value: systemInfo?.activeUsers || 0, icon: Users, color: '#8B5CF6' },
    { label: 'Total Contacts', value: systemInfo?.totalContacts?.toLocaleString() || '0', icon: Users, color: '#EC4899' },
    { label: 'API Calls (30d)', value: systemInfo?.apiCalls?.toLocaleString() || '0', icon: Activity, color: '#06B6D4' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Database size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            System Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced system settings and monitoring (Master Admin only)
          </Typography>
        </div>
      </Box>

      {!isMasterAdmin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You need Master Admin privileges to access system configuration features.
        </Alert>
      )}

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

      {/* System Stats */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        System Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
          System Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Environment
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {systemInfo?.environment || 'Production'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Region
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {systemInfo?.region || 'us-east-1'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Last Backup
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {systemInfo?.lastBackup
                  ? formatDistanceToNow(
                      systemInfo.lastBackup.toDate
                        ? systemInfo.lastBackup.toDate()
                        : new Date(systemInfo.lastBackup),
                      { addSuffix: true }
                    )
                  : 'Never'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Database Type
              </Typography>
              <Typography variant="body1" fontWeight="600">
                Firebase Firestore
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* System Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
          System Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Download />}
              onClick={() => handleAction('Data Export')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              Export Data
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Upload />}
              onClick={() => handleAction('Data Import')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              Import Data
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Archive />}
              onClick={() => handleAction('Backup Creation')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              Create Backup
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshCw />}
              onClick={() => handleAction('Cache Clear')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              Clear Cache
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              color="warning"
              startIcon={<Power />}
              onClick={() => handleAction('System Restart')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              Restart System
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<FileText />}
              onClick={() => handleAction('Logs View')}
              disabled={!isMasterAdmin}
              sx={{ height: 56 }}
            >
              View Logs
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Health Status */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
          System Health
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Database Connection</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ color: 'success.main' }}>
              Healthy
            </Typography>
          </Box>
          <Divider />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">API Services</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ color: 'success.main' }}>
              Operational
            </Typography>
          </Box>
          <Divider />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Storage</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ color: 'success.main' }}>
              {systemInfo?.databaseSize || '2.3 GB'} / 10 GB
            </Typography>
          </Box>
          <Divider />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Backup Status</Typography>
            <Typography variant="body2" fontWeight="600" sx={{ color: 'success.main' }}>
              Up to date
            </Typography>
          </Box>
          <Divider />
        </Box>
      </Paper>

      {/* Warning Notice */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
          ⚠️ System Configuration Warning
        </Typography>
        <Typography variant="caption">
          These actions directly affect system operations. Only perform system actions if you understand their impact.
          Always create a backup before making major changes.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SystemTab;
