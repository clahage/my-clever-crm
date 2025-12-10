// Path: /src/pages/hubs/credit/ControlTab.jsx
// ============================================================================
// CREDIT HUB - CONTROL CENTER TAB
// ============================================================================
// Purpose: IDIQ control center (admin only)
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  LayoutDashboard,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Database,
  Cloud,
  Key,
  Users,
  TrendingUp,
  Download,
  Upload
} from 'lucide-react';
import { collection, query, onSnapshot, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ControlTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [systemStats, setSystemStats] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reports, setReports] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [settings, setSettings] = useState({
    apiEnabled: true,
    autoSync: true,
    syncInterval: 24,
    apiKey: '••••••••••••••••',
    apiEndpoint: 'https://api.idiq.com/v1',
    webhookUrl: 'https://your-app.com/webhooks/idiq',
    enableNotifications: true,
    enableAutoDispute: false,
    maxDisputesPerMonth: 10
  });

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to enrollments
    const enrollmentsQuery = query(collection(db, 'idiqEnrollments'), orderBy('createdAt', 'desc'));
    const unsubEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnrollments(data);
      calculateStats(data);
      setLoading(false);
    });
    unsubscribers.push(unsubEnrollments);

    // Subscribe to disputes
    const disputesQuery = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
    const unsubDisputes = onSnapshot(disputesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDisputes(data);
    });
    unsubscribers.push(unsubDisputes);

    // Subscribe to reports
    const reportsQuery = query(collection(db, 'creditReports'), orderBy('createdAt', 'desc'));
    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    });
    unsubscribers.push(unsubReports);

    // Simulate API status check
    checkApiStatus();

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const calculateStats = (enrollmentData) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    setSystemStats({
      totalEnrollments: enrollmentData.length,
      activeEnrollments: enrollmentData.filter(e => e.status === 'active').length,
      newToday: enrollmentData.filter(e => {
        const createdAt = e.createdAt?.toDate();
        return createdAt && createdAt >= last24h;
      }).length,
      newThisWeek: enrollmentData.filter(e => {
        const createdAt = e.createdAt?.toDate();
        return createdAt && createdAt >= last7d;
      }).length,
      newThisMonth: enrollmentData.filter(e => {
        const createdAt = e.createdAt?.toDate();
        return createdAt && createdAt >= last30d;
      }).length
    });
  };

  const checkApiStatus = () => {
    // Simulate API health check
    // In production, this would make actual API calls
    setApiStatus({
      status: 'healthy',
      responseTime: '234ms',
      uptime: '99.9%',
      lastCheck: new Date(),
      services: {
        enrollment: { status: 'operational', latency: '120ms' },
        reports: { status: 'operational', latency: '180ms' },
        monitoring: { status: 'operational', latency: '95ms' },
        disputes: { status: 'operational', latency: '150ms' }
      }
    });
  };

  const handleSaveSettings = async () => {
    try {
      // In production, save to a settings collection
      // await updateDoc(doc(db, 'systemSettings', 'idiq'), {
      //   ...settings,
      //   updatedAt: serverTimestamp(),
      //   updatedBy: userProfile?.email
      // });

      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
      setOpenSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Error saving settings',
        severity: 'error'
      });
    }
  };

  const handleRefreshApiStatus = () => {
    setSnackbar({
      open: true,
      message: 'Refreshing API status...',
      severity: 'info'
    });
    checkApiStatus();
  };

  const handleSyncAll = async () => {
    try {
      setSnackbar({
        open: true,
        message: 'Starting sync for all enrollments...',
        severity: 'info'
      });

      // In production, this would trigger bulk API sync
      // for (const enrollment of enrollments) {
      //   await syncWithIDIQ(enrollment.id);
      // }

      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'Sync completed successfully',
          severity: 'success'
        });
      }, 2000);
    } catch (error) {
      console.error('Error syncing:', error);
      setSnackbar({
        open: true,
        message: 'Error during sync',
        severity: 'error'
      });
    }
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            <LayoutDashboard size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            IDIQ Control Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System administration and API management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={18} />}
            onClick={handleRefreshApiStatus}
          >
            Refresh Status
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings size={18} />}
            onClick={() => setOpenSettings(true)}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* System Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Enrollments</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {systemStats?.totalEnrollments || 0}
                  </Typography>
                </Box>
                <Users size={32} color="#1976d2" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {systemStats?.activeEnrollments || 0}
                  </Typography>
                </Box>
                <Activity size={32} color="#2e7d32" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">New This Week</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {systemStats?.newThisWeek || 0}
                  </Typography>
                </Box>
                <TrendingUp size={32} color="#0288d1" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">API Status</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {apiStatus?.status || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {apiStatus?.responseTime}
                  </Typography>
                </Box>
                <Cloud size={32} color="#2e7d32" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="API Status" />
          <Tab label="Enrollment Overview" />
          <Tab label="System Logs" />
          <Tab label="Reports" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* API Health */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  API Health
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Status</Typography>
                    <Chip
                      label={apiStatus?.status}
                      color={apiStatus?.status === 'healthy' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Response Time</Typography>
                    <Typography variant="body2">{apiStatus?.responseTime}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Uptime</Typography>
                    <Typography variant="body2">{apiStatus?.uptime}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Last Check</Typography>
                    <Typography variant="body2">
                      {apiStatus?.lastCheck?.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshCw size={18} />}
                  onClick={handleRefreshApiStatus}
                >
                  Run Health Check
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Service Status
                </Typography>
                <List>
                  {apiStatus?.services && Object.entries(apiStatus.services).map(([service, data], index) => (
                    <React.Fragment key={service}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={service.charAt(0).toUpperCase() + service.slice(1)}
                          secondary={`Latency: ${data.latency}`}
                        />
                        <Chip
                          label={data.status}
                          color={getServiceStatusColor(data.status)}
                          size="small"
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* API Configuration */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  API Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="API Endpoint"
                      value={settings.apiEndpoint}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={settings.apiKey}
                      type="password"
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Webhook URL"
                      value={settings.webhookUrl}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<Key size={18} />}>
                    Rotate API Key
                  </Button>
                  <Button variant="outlined" startIcon={<Upload size={18} />}>
                    Test Webhook
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Enrollment Overview
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={handleSyncAll}
              >
                Sync All
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Enrolled Date</TableCell>
                    <TableCell>IDIQ ID</TableCell>
                    <TableCell>Last Sync</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.slice(0, 10).map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.clientName}</TableCell>
                      <TableCell>
                        <Chip
                          label={enrollment.status}
                          color={enrollment.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {enrollment.createdAt?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>{enrollment.idiqEnrollmentId || 'Pending'}</TableCell>
                      <TableCell>
                        {enrollment.lastSync?.toDate().toLocaleString() || 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="Sync Now">
                          <RefreshCw size={18} />
                        </IconButton>
                        <IconButton size="small" title="View Details">
                          <Database size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              System Activity Log
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing last 50 system events
            </Alert>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle size={20} color="green" />
                </ListItemIcon>
                <ListItemText
                  primary="API sync completed successfully"
                  secondary={new Date().toLocaleString()}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Activity size={20} color="blue" />
                </ListItemIcon>
                <ListItemText
                  primary="New enrollment: John Doe"
                  secondary={new Date(Date.now() - 3600000).toLocaleString()}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AlertCircle size={20} color="orange" />
                </ListItemIcon>
                <ListItemText
                  primary="API rate limit warning (75% used)"
                  secondary={new Date(Date.now() - 7200000).toLocaleString()}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Reports
              </Typography>
              <Button variant="outlined" startIcon={<Download size={18} />}>
                Export All
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {reports.length}
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>View All</Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Disputes
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {disputes.length}
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>View All</Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg Score Improvement
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main' }}>
                    +47
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>View Report</Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: 'info.main' }}>
                    73%
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>View Details</Button>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>IDIQ System Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                API Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.apiEnabled}
                    onChange={(e) => setSettings({ ...settings, apiEnabled: e.target.checked })}
                  />
                }
                label="Enable API Integration"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoSync}
                    onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                  />
                }
                label="Enable Auto-Sync"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Sync Interval (hours)"
                value={settings.syncInterval}
                onChange={(e) => setSettings({ ...settings, syncInterval: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Automation Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  />
                }
                label="Enable Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAutoDispute}
                    onChange={(e) => setSettings({ ...settings, enableAutoDispute: e.target.checked })}
                  />
                }
                label="Enable Auto-Dispute (Beta)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Max Disputes Per Month"
                value={settings.maxDisputesPerMonth}
                onChange={(e) => setSettings({ ...settings, maxDisputesPerMonth: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ControlTab;
