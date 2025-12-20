import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const RISK_LEVELS = {
  healthy: { color: 'success', icon: CheckIcon, label: 'Healthy', range: '0-29' },
  atRisk: { color: 'warning', icon: WarningIcon, label: 'At Risk', range: '30-59' },
  critical: { color: 'error', icon: ErrorIcon, label: 'Critical', range: '60-100' },
  pastDue: { color: 'error', icon: ErrorIcon, label: 'Past Due', range: 'Overdue' }
};

function RiskGauge({ score }) {
  const theme = useTheme();
  const getColor = () => {
    if (score < 30) return theme.palette.success.main;
    if (score < 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={80}
        thickness={8}
        sx={{ color: getColor() }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {score}
        </Typography>
      </Box>
    </Box>
  );
}

function ClientRow({ client, onContact }) {
  const theme = useTheme();
  const riskColor = client.riskScore >= 60 ? 'error' : client.riskScore >= 30 ? 'warning' : 'success';

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: `${riskColor}.main` }}>
            {client.clientName?.charAt(0) || 'C'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {client.clientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {client.clientEmail}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={`${client.riskScore}%`}
          color={riskColor}
        />
      </TableCell>
      <TableCell>
        ${client.monthlyAmount?.toLocaleString() || '0'}
      </TableCell>
      <TableCell>
        {client.daysPastDue > 0 ? (
          <Chip size="small" label={`${client.daysPastDue} days`} color="error" />
        ) : (
          <Typography variant="body2" color="text.secondary">On time</Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip size="small" label={`${client.failedPayments} failed`} variant="outlined" />
          <Chip size="small" label={`${client.latePayments} late`} variant="outlined" />
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ maxWidth: 200 }}>
          {client.recommendations?.slice(0, 2).map((rec, i) => (
            <Typography key={i} variant="caption" display="block" color="text.secondary">
              • {rec}
            </Typography>
          ))}
        </Box>
      </TableCell>
      <TableCell>
        <Tooltip title="Email">
          <IconButton size="small" onClick={() => onContact(client, 'email')}>
            <EmailIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Call">
          <IconButton size="small" onClick={() => onContact(client, 'phone')}>
            <PhoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default function PaymentHealthMonitor() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyzeHealth = httpsCallable(functions, 'analyzePaymentHealth');
      const result = await analyzeHealth({});
      setHealthData(result.data);
    } catch (err) {
      console.error('Error loading health data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (client, method) => {
    if (method === 'email') {
      window.location.href = `mailto:${client.clientEmail}?subject=Payment Reminder - Speedy Credit Repair`;
    } else {
      window.location.href = `tel:${client.clientPhone}`;
    }
  };

  const getActiveClients = () => {
    if (!healthData) return [];
    switch (activeTab) {
      case 0: return healthData.pastDue || [];
      case 1: return healthData.critical || [];
      case 2: return healthData.atRisk || [];
      case 3: return healthData.healthy || [];
      default: return [];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading payment health data: {error}
      </Alert>
    );
  }

  const summary = healthData?.summary || {};

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Payment Health Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Identify and address payment issues before they become problems
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadHealthData}
        >
          Refresh
        </Button>
      </Box>

      {/* Critical Alert */}
      {(summary.pastDue > 0 || summary.critical > 0) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Immediate Attention Required
          </Typography>
          <Typography variant="body2">
            {summary.pastDue} past due accounts and {summary.critical} critical risk accounts
            representing ${summary.atRiskRevenue?.toLocaleString()} in monthly revenue at risk.
          </Typography>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {summary.healthy || 0}
              </Typography>
              <Typography variant="body2">Healthy</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {summary.atRisk || 0}
              </Typography>
              <Typography variant="body2">At Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: 'error.50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ErrorIcon sx={{ color: 'error.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {summary.critical || 0}
              </Typography>
              <Typography variant="body2">Critical</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: 'grey.100' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon sx={{ color: 'error.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ${summary.atRiskRevenue?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2">Revenue at Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Health Distribution */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment Health Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ flex: summary.healthy || 1, bgcolor: 'success.main', height: 24, borderRadius: 1 }} />
          <Box sx={{ flex: summary.atRisk || 1, bgcolor: 'warning.main', height: 24, borderRadius: 1 }} />
          <Box sx={{ flex: summary.critical || 1, bgcolor: 'error.main', height: 24, borderRadius: 1 }} />
          <Box sx={{ flex: summary.pastDue || 1, bgcolor: 'error.dark', height: 24, borderRadius: 1 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
            <Typography variant="caption">Healthy ({summary.healthy || 0})</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 0.5 }} />
            <Typography variant="caption">At Risk ({summary.atRisk || 0})</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 0.5 }} />
            <Typography variant="caption">Critical ({summary.critical || 0})</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'error.dark', borderRadius: 0.5 }} />
            <Typography variant="caption">Past Due ({summary.pastDue || 0})</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Client Tables */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Past Due
                <Chip size="small" label={summary.pastDue || 0} color="error" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Critical
                <Chip size="small" label={summary.critical || 0} color="error" variant="outlined" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                At Risk
                <Chip size="small" label={summary.atRisk || 0} color="warning" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Healthy
                <Chip size="small" label={summary.healthy || 0} color="success" />
              </Box>
            }
          />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Monthly Amount</TableCell>
                <TableCell>Past Due</TableCell>
                <TableCell>Payment History</TableCell>
                <TableCell>Recommendations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getActiveClients().map((client, index) => (
                <ClientRow
                  key={client.subscriptionId || index}
                  client={client}
                  onContact={handleContact}
                />
              ))}
              {getActiveClients().length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {activeTab === 3 ? 'All clients are in good standing! 🎉' : 'No clients in this category'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Tips */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.50' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          💡 Payment Recovery Tips
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>At Risk (30-59):</strong> Reach out proactively with payment reminder and offer flexible payment date.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>Critical (60+):</strong> Immediate phone call recommended. Consider payment plan restructuring.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">
              <strong>Past Due:</strong> Multiple contact attempts, offer catch-up plan, consider pausing services.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
