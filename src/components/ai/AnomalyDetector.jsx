// ============================================================================
// CREDIT REPORT ANOMALY DETECTOR - AI ERROR DETECTION
// ============================================================================
// Finds errors, inconsistencies, and FCRA violations humans might miss
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  TextField,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BugReport,
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
  ExpandMore,
  Security,
  Gavel,
  Shield,
  Refresh,
  Download,
  ContentCopy,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, functions } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

// Severity Badge Component
const SeverityBadge = ({ severity }) => {
  const config = {
    critical: { color: 'error', icon: <ErrorIcon />, label: 'CRITICAL' },
    high: { color: 'warning', icon: <Warning />, label: 'HIGH' },
    medium: { color: 'info', icon: <Info />, label: 'MEDIUM' },
    low: { color: 'default', icon: <CheckCircle />, label: 'LOW' },
  };

  const cfg = config[severity] || config.low;

  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      color={cfg.color}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
};

// Anomaly Card Component
const AnomalyCard = ({ anomaly, index }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${getSeverityColor(anomaly.severity)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SeverityBadge severity={anomaly.severity} />
              <Chip
                label={anomaly.type?.replace(/_/g, ' ').toUpperCase()}
                size="small"
                variant="outlined"
              />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {anomaly.description}
            </Typography>
          </Box>
          {anomaly.estimatedScoreImpact && (
            <Chip
              label={`+${anomaly.estimatedScoreImpact} pts if resolved`}
              color="success"
              size="small"
            />
          )}
        </Box>

        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{ mt: 2, boxShadow: 'none', bgcolor: 'action.hover' }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2" color="primary">
              View Details & Recommended Action
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Legal Basis
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                  {anomaly.legalBasis || 'FCRA Accuracy Requirements'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recommended Action
                </Typography>
                <Typography variant="body2" sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                  {anomaly.recommendedAction || anomaly.recommendedDispute || 'File dispute with credit bureau'}
                </Typography>
              </Grid>
              {anomaly.affectedItems?.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Affected Items
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {anomaly.affectedItems.map((item, idx) => (
                      <Chip key={idx} label={item} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" startIcon={<Gavel />}>
                Generate Dispute
              </Button>
              <Button size="small" variant="outlined" startIcon={<ContentCopy />}>
                Copy Details
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Identity Theft Risk Card
const IdentityTheftRiskCard = ({ risk }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  if (!risk || risk.level === 'none') return null;

  return (
    <Alert
      severity={getRiskColor(risk.level)}
      icon={<Security />}
      sx={{ mb: 3 }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        Identity Theft Risk: {risk.level?.toUpperCase()}
      </Typography>
      {risk.indicators?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" gutterBottom>
            Indicators detected:
          </Typography>
          <List dense>
            {risk.indicators.map((indicator, idx) => (
              <ListItem key={idx} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Warning sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primary={indicator} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {risk.recommendedActions?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Recommended Actions:
          </Typography>
          {risk.recommendedActions.map((action, idx) => (
            <Chip key={idx} label={action} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
      )}
    </Alert>
  );
};

const AnomalyDetector = () => {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const contactsRef = collection(db, 'contacts');
        const q = query(contactsRef, orderBy('lastName'), limit(500));
        const snapshot = await getDocs(q);
        const clientList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          label: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || doc.data().email,
        }));
        setClients(clientList);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setClientsLoading(false);
      }
    };
    loadClients();
  }, []);

  // Run anomaly detection
  const runDetection = async () => {
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const detect = httpsCallable(functions, 'detectAnomalies');
      const result = await detect({
        clientId: selectedClient.id,
      });

      if (result.data.success) {
        setResults(result.data);
      } else {
        setError('Anomaly detection failed');
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError(err.message || 'Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  // Group anomalies by severity
  const groupedAnomalies = results?.anomalies?.reduce((acc, anomaly) => {
    const severity = anomaly.severity || 'low';
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(anomaly);
    return acc;
  }, {}) || {};

  const severityOrder = ['critical', 'high', 'medium', 'low'];

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <BugReport sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Credit Report Anomaly Detector
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                AI-powered error and inconsistency detection
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={clients}
              loading={clientsLoading}
              value={selectedClient}
              onChange={(e, newValue) => setSelectedClient(newValue)}
              getOptionLabel={(option) => option.label || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Client"
                  placeholder="Search by name..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {clientsLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={runDetection}
              disabled={loading || !selectedClient}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BugReport />}
              sx={{ height: 56, background: 'linear-gradient(45deg, #f093fb, #f5576c)' }}
            >
              {loading ? 'Scanning...' : 'Detect Anomalies'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: results.criticalIssues > 0 ? 'error.light' : 'success.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color={results.criticalIssues > 0 ? 'error.dark' : 'success.dark'}>
                    {results.criticalIssues || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Critical Issues
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    {results.totalAnomaliesFound || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Anomalies
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {results.overallReportQuality || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Report Quality
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="secondary.main" fontWeight="bold">
                    {Math.round((results.estimatedErrorRate || 0) * 100)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Error Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Identity Theft Risk */}
          <IdentityTheftRiskCard risk={results.identityTheftRisk} />

          {/* Prioritized Actions */}
          {results.prioritizedActions?.length > 0 && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Shield sx={{ mr: 1 }} />
                Prioritized Actions
              </Typography>
              <List>
                {results.prioritizedActions.map((action, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                        {idx + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Anomalies by Severity */}
          {severityOrder.map(severity => {
            const anomalies = groupedAnomalies[severity];
            if (!anomalies?.length) return null;

            return (
              <Box key={severity} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge badgeContent={anomalies.length} color={severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info'}>
                    <SeverityBadge severity={severity} />
                  </Badge>
                  <span style={{ marginLeft: 16 }}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority Issues
                  </span>
                </Typography>
                {anomalies.map((anomaly, idx) => (
                  <AnomalyCard key={idx} anomaly={anomaly} index={idx} />
                ))}
              </Box>
            );
          })}

          {/* No Anomalies */}
          {results.totalAnomaliesFound === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'success.light' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" color="success.dark" gutterBottom>
                No Anomalies Detected!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The credit report appears to be accurate and consistent.
              </Typography>
            </Paper>
          )}

          {/* Export Actions */}
          {results.totalAnomaliesFound > 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" startIcon={<Download />}>
                Export Report
              </Button>
              <Button variant="outlined" startIcon={<Gavel />}>
                Generate All Disputes
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <BugReport sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to scan for anomalies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI analyzes credit reports for errors humans might miss:
            duplicate accounts, impossible dates, mixed files, obsolete items,
            re-aged accounts, and identity theft indicators.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AnomalyDetector;
