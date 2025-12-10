// Path: /src/pages/hubs/credit/MonitoringTab.jsx
// ============================================================================
// CREDIT HUB - CREDIT MONITORING TAB
// ============================================================================
// Purpose: Real-time credit monitoring
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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { collection, query, onSnapshot, where, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MonitoringTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monitoringData, setMonitoringData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [alertSettings, setAlertSettings] = useState({
    scoreChanges: true,
    newAccounts: true,
    newInquiries: true,
    addressChanges: true,
    publicRecords: true,
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to monitoring data
    const clientId = userProfile?.role === 'client' ? userProfile.uid : null;
    const monitoringQuery = clientId
      ? query(collection(db, 'creditMonitoring'), where('clientId', '==', clientId))
      : query(collection(db, 'creditMonitoring'));

    const unsubMonitoring = onSnapshot(monitoringQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setMonitoringData({ id: snapshot.docs[0].id, ...data });
        setAlertSettings(prev => ({ ...prev, ...data.settings }));
      }
      setLoading(false);
    });
    unsubscribers.push(unsubMonitoring);

    // Subscribe to alerts
    const alertsQuery = clientId
      ? query(
          collection(db, 'creditAlerts'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'creditAlerts'), orderBy('createdAt', 'desc'));

    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(data);
    });
    unsubscribers.push(unsubAlerts);

    // Subscribe to score history
    const historyQuery = clientId
      ? query(
          collection(db, 'creditScoreHistory'),
          where('clientId', '==', clientId),
          orderBy('date', 'asc')
        )
      : query(collection(db, 'creditScoreHistory'), orderBy('date', 'asc'));

    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScoreHistory(data);
    });
    unsubscribers.push(unsubHistory);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile]);

  const handleSaveSettings = async () => {
    try {
      if (monitoringData?.id) {
        await updateDoc(doc(db, 'creditMonitoring', monitoringData.id), {
          settings: alertSettings,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'creditMonitoring'), {
          clientId: userProfile.uid,
          clientName: userProfile.displayName || userProfile.email,
          settings: alertSettings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

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

  const getAlertIcon = (type) => {
    switch (type) {
      case 'score_increase':
        return <TrendingUp size={20} color="green" />;
      case 'score_decrease':
        return <TrendingDown size={20} color="red" />;
      case 'new_account':
      case 'new_inquiry':
      case 'address_change':
        return <AlertCircle size={20} color="orange" />;
      default:
        return <Bell size={20} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'score_increase':
        return 'success';
      case 'score_decrease':
        return 'error';
      case 'new_account':
      case 'new_inquiry':
        return 'warning';
      default:
        return 'info';
    }
  };

  const chartData = {
    labels: scoreHistory.map(h => h.date?.toDate().toLocaleDateString() || ''),
    datasets: [
      {
        label: 'Equifax',
        data: scoreHistory.map(h => h.equifax || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Experian',
        data: scoreHistory.map(h => h.experian || 0),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'TransUnion',
        data: scoreHistory.map(h => h.transunion || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 300,
        max: 850
      }
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
            Credit Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track credit score changes and receive real-time alerts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Settings size={18} />}
          onClick={() => setOpenSettings(true)}
        >
          Alert Settings
        </Button>
      </Box>

      {/* Current Scores */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Equifax</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: 'error.main' }}>
                {monitoringData?.currentScores?.equifax || 'N/A'}
              </Typography>
              <Chip
                label={monitoringData?.scoreChanges?.equifax > 0 ? `+${monitoringData?.scoreChanges?.equifax}` : monitoringData?.scoreChanges?.equifax || '0'}
                size="small"
                color={monitoringData?.scoreChanges?.equifax > 0 ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Experian</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: 'info.main' }}>
                {monitoringData?.currentScores?.experian || 'N/A'}
              </Typography>
              <Chip
                label={monitoringData?.scoreChanges?.experian > 0 ? `+${monitoringData?.scoreChanges?.experian}` : monitoringData?.scoreChanges?.experian || '0'}
                size="small"
                color={monitoringData?.scoreChanges?.experian > 0 ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">TransUnion</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main' }}>
                {monitoringData?.currentScores?.transunion || 'N/A'}
              </Typography>
              <Chip
                label={monitoringData?.scoreChanges?.transunion > 0 ? `+${monitoringData?.scoreChanges?.transunion}` : monitoringData?.scoreChanges?.transunion || '0'}
                size="small"
                color={monitoringData?.scoreChanges?.transunion > 0 ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Score History Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Score History
          </Typography>
          {scoreHistory.length > 0 ? (
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          ) : (
            <Alert severity="info">
              No score history available yet. Score tracking will begin once monitoring is active.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Alerts
          </Typography>
          <List>
            {alerts.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No alerts yet"
                  secondary="You'll be notified here when credit changes are detected"
                />
              </ListItem>
            ) : (
              alerts.slice(0, 10).map((alert, index) => (
                <React.Fragment key={alert.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{alert.title}</Typography>
                          <Chip
                            label={alert.type}
                            size="small"
                            color={getAlertColor(alert.type)}
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{alert.message}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.createdAt?.toDate().toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {!alert.read && (
                      <IconButton size="small">
                        <CheckCircle size={18} />
                      </IconButton>
                    )}
                  </ListItem>
                </React.Fragment>
              ))
            )}
          </List>
        </CardContent>
      </Card>

      {/* Alert Settings Dialog */}
      <Dialog
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure which credit monitoring alerts you want to receive
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.scoreChanges}
                  onChange={(e) => setAlertSettings({ ...alertSettings, scoreChanges: e.target.checked })}
                />
              }
              label="Score Changes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.newAccounts}
                  onChange={(e) => setAlertSettings({ ...alertSettings, newAccounts: e.target.checked })}
                />
              }
              label="New Accounts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.newInquiries}
                  onChange={(e) => setAlertSettings({ ...alertSettings, newInquiries: e.target.checked })}
                />
              }
              label="New Inquiries"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.addressChanges}
                  onChange={(e) => setAlertSettings({ ...alertSettings, addressChanges: e.target.checked })}
                />
              }
              label="Address Changes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.publicRecords}
                  onChange={(e) => setAlertSettings({ ...alertSettings, publicRecords: e.target.checked })}
                />
              }
              label="Public Records"
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Notification Methods
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.emailNotifications}
                  onChange={(e) => setAlertSettings({ ...alertSettings, emailNotifications: e.target.checked })}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alertSettings.smsNotifications}
                  onChange={(e) => setAlertSettings({ ...alertSettings, smsNotifications: e.target.checked })}
                />
              }
              label="SMS Notifications"
            />
          </Box>
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

export default MonitoringTab;
