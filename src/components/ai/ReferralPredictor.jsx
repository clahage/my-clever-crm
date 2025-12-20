// ============================================================================
// AI REFERRAL PREDICTOR - IDENTIFY TOP REFERRAL CANDIDATES
// ============================================================================
// Predict which clients are most likely to refer new business
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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  People,
  Share,
  Star,
  TrendingUp,
  Email,
  Sms,
  Campaign,
  Refresh,
  CheckCircle,
  EmojiEvents,
  Handshake,
  LocalOffer,
  Send,
  ContentCopy,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Likelihood Badge
const LikelihoodBadge = ({ level }) => {
  const config = {
    high: { color: 'success', label: 'High', icon: <Star /> },
    medium: { color: 'warning', label: 'Medium', icon: <TrendingUp /> },
    low: { color: 'default', label: 'Low', icon: null },
  };
  const cfg = config[level] || config.low;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
};

// Stats Card
const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">{title}</Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ color }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const ReferralPredictor = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [campaignDialog, setCampaignDialog] = useState({ open: false, clients: [] });
  const [selectedClients, setSelectedClients] = useState([]);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const predict = httpsCallable(functions, 'predictReferralLikelihood');
      const result = await predict({ limit: 100 });
      if (result.data.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Referral prediction error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const launchCampaign = () => {
    const selected = data?.clients.filter(c => selectedClients.includes(c.clientId)) || [];
    setCampaignDialog({ open: true, clients: selected });
  };

  const highLikelihood = data?.clients?.filter(c => c.likelihood === 'high') || [];
  const mediumLikelihood = data?.clients?.filter(c => c.likelihood === 'medium') || [];

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <Share sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                AI Referral Predictor
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Identify clients most likely to refer new business
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Campaign />}
              onClick={launchCampaign}
              disabled={selectedClients.length === 0}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              Launch Campaign ({selectedClients.length})
            </Button>
            <IconButton onClick={loadPredictions} sx={{ color: 'white' }} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : data ? (
        <>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatsCard
                icon={People}
                title="Clients Analyzed"
                value={data.summary?.totalAnalyzed || 0}
                color="#06b6d4"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard
                icon={Star}
                title="High Likelihood"
                value={data.summary?.highLikelihood || 0}
                subtitle="Top referral candidates"
                color="#22c55e"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard
                icon={TrendingUp}
                title="Medium Likelihood"
                value={data.summary?.mediumLikelihood || 0}
                subtitle="Good potential"
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard
                icon={Handshake}
                title="Low Likelihood"
                value={data.summary?.lowLikelihood || 0}
                subtitle="Need nurturing"
                color="#94a3b8"
              />
            </Grid>
          </Grid>

          {/* Top Candidates Highlight */}
          {highLikelihood.length > 0 && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.main' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ color: 'success.main' }} />
                Top Referral Candidates
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {highLikelihood.slice(0, 5).map((client) => (
                  <Chip
                    key={client.clientId}
                    avatar={<Avatar>{client.clientName?.charAt(0)}</Avatar>}
                    label={`${client.clientName} (${client.referralScore}%)`}
                    color="success"
                    onClick={() => handleSelectClient(client.clientId)}
                    variant={selectedClients.includes(client.clientId) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Client Table */}
          <Paper>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClients(data.clients.map(c => c.clientId));
                          } else {
                            setSelectedClients([]);
                          }
                        }}
                        checked={selectedClients.length === data.clients.length}
                      />
                    </TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Referral Score</TableCell>
                    <TableCell>Likelihood</TableCell>
                    <TableCell>Success Rate</TableCell>
                    <TableCell>Past Referrals</TableCell>
                    <TableCell>Triggers</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.clients?.map((client) => (
                    <TableRow
                      key={client.clientId}
                      hover
                      selected={selectedClients.includes(client.clientId)}
                      sx={{
                        bgcolor: client.likelihood === 'high' ? 'success.lighter' :
                                 client.likelihood === 'medium' ? 'warning.lighter' : 'inherit'
                      }}
                    >
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.clientId)}
                          onChange={() => handleSelectClient(client.clientId)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{client.clientName}</Typography>
                          <Typography variant="caption" color="text.secondary">{client.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={client.referralScore}
                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                            color={client.likelihood === 'high' ? 'success' : client.likelihood === 'medium' ? 'warning' : 'inherit'}
                          />
                          <Typography variant="body2" fontWeight="bold">{client.referralScore}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <LikelihoodBadge level={client.likelihood} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {client.metrics?.disputeSuccessRate}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.metrics?.pastReferrals || 0}
                          size="small"
                          color={client.metrics?.pastReferrals > 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {client.triggers?.slice(0, 2).map((trigger, idx) => (
                            <Chip key={idx} label={trigger} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Send Email">
                          <IconButton size="small" color="primary">
                            <Email fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send SMS">
                          <IconButton size="small" color="secondary">
                            <Sms fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recommendations */}
          {data.recommendations?.length > 0 && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Campaign sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI Recommendations
              </Typography>
              {data.recommendations.map((rec, idx) => (
                <Alert
                  key={idx}
                  severity={rec.priority === 'high' ? 'success' : 'info'}
                  sx={{ mb: 1 }}
                  action={
                    <Button size="small" color="inherit">
                      Take Action
                    </Button>
                  }
                >
                  {rec.action}
                </Alert>
              ))}
            </Paper>
          )}
        </>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Share sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Click Refresh to analyze referral potential
          </Typography>
        </Paper>
      )}

      {/* Campaign Dialog */}
      <Dialog
        open={campaignDialog.open}
        onClose={() => setCampaignDialog({ open: false, clients: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Campaign sx={{ color: 'primary.main' }} />
            Launch Referral Campaign
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send personalized referral requests to {campaignDialog.clients.length} selected clients
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Selected Clients:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {campaignDialog.clients.map(c => (
              <Chip key={c.clientId} label={c.clientName} size="small" />
            ))}
          </Box>
          <TextField
            fullWidth
            label="Referral Incentive"
            placeholder="e.g., $50 credit for each referral"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Message (optional)"
            placeholder="Add a personal touch to the referral request..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog({ open: false, clients: [] })}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />}>
            Send Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReferralPredictor;
