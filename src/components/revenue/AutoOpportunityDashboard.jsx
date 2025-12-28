// ============================================================================
// AUTO OPPORTUNITY DASHBOARD - TOYOTA FINANCING LEADS
// ============================================================================
// Identify clients for auto loan/lease opportunities
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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  DirectionsCar,
  TrendingDown,
  Schedule,
  Star,
  Email,
  Phone,
  Sms,
  Refresh,
  Campaign,
  AttachMoney,
  Speed,
  CheckCircle,
  Warning,
  Send,
  PersonAdd,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Opportunity Type Badge
const OpportunityBadge = ({ type }) => {
  const config = {
    no_auto: { color: 'info', label: 'No Auto Loan', icon: <DirectionsCar /> },
    high_rate: { color: 'warning', label: 'High Rate', icon: <TrendingDown /> },
    nearing_maturity: { color: 'success', label: 'Nearing Maturity', icon: <Schedule /> },
    prime: { color: 'primary', label: 'Prime Credit', icon: <Star /> },
  };
  const cfg = config[type] || config.no_auto;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
};

// Stats Card
const StatsCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => (
  <Card
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {},
      borderLeft: `4px solid ${color}`,
    }}
    onClick={onClick}
  >
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

// Client Row Component
const ClientRow = ({ client, type, onContact, onAddToCampaign }) => (
  <TableRow hover>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.light' }}>
          {client.clientName?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">{client.clientName}</Typography>
          <Typography variant="caption" color="text.secondary">{client.email}</Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" fontWeight="bold" color={
          client.avgScore >= 700 ? 'success.main' :
          client.avgScore >= 650 ? 'warning.main' : 'error.main'
        }>
          {client.avgScore || 'N/A'}
        </Typography>
        {client.avgScore >= 700 && <Star sx={{ color: 'warning.main', fontSize: 18 }} />}
      </Box>
    </TableCell>
    <TableCell>
      <OpportunityBadge type={type} />
    </TableCell>
    <TableCell>
      <Typography variant="body2" sx={{ maxWidth: 300 }}>
        {client.reason}
      </Typography>
    </TableCell>
    <TableCell>
      {client.loans?.map((loan, idx) => (
        <Box key={idx} sx={{ mb: 0.5 }}>
          <Typography variant="caption" fontWeight="bold">{loan.creditor}</Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            ${loan.balance?.toLocaleString()} • {loan.monthsRemaining} months • ~{loan.estimatedRate}%
          </Typography>
        </Box>
      ))}
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Send Email">
          <IconButton size="small" color="primary" onClick={() => onContact(client, 'email')}>
            <Email fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Call">
          <IconButton size="small" color="success" onClick={() => onContact(client, 'phone')}>
            <Phone fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add to Campaign">
          <IconButton size="small" color="secondary" onClick={() => onAddToCampaign(client)}>
            <Campaign fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  </TableRow>
);

  const AutoOpportunityDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [campaignDialog, setCampaignDialog] = useState({ open: false, clients: [] });
  const [selectedClients, setSelectedClients] = useState([]);

  // Load opportunities
  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const operationsManager = httpsCallable(functions, 'operationsManager');
      const result = await operationsManager({
        action: 'scanAutoOpportunities'
      });
      if (result.data.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Load opportunities error, using Firestore fallback:', err);
      // Fallback: Load contacts directly and analyze for opportunities
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const contactsSnap = await getDocs(collection(db, 'contacts'));
        const contacts = contactsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Analyze contacts for auto opportunities
        const noAutoLoan = [];
        const highInterestAuto = [];
        const nearingMaturity = [];
        const primeClients = [];

        contacts.forEach(contact => {
          const avgScore = contact.creditScore || contact.avgScore || 0;
          const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
          const clientData = {
            clientId: contact.id,
            clientName: name,
            email: contact.email,
            phone: contact.phone,
            avgScore,
            loans: [],
            reason: ''
          };

          // Check for prime clients (700+ credit score)
          if (avgScore >= 700) {
            primeClients.push({
              ...clientData,
              reason: `Prime credit score of ${avgScore} - excellent auto financing candidate`
            });
          }

          // Check if they have auto loan data
          const autoLoans = contact.tradelines?.filter(t =>
            t.type?.toLowerCase().includes('auto') ||
            t.accountType?.toLowerCase().includes('auto')
          ) || [];

          if (autoLoans.length === 0 && avgScore >= 620) {
            noAutoLoan.push({
              ...clientData,
              reason: 'No auto loan on file - potential first-time auto buyer'
            });
          }
        });

        setData({
          success: true,
          results: {
            noAutoLoan,
            highInterestAuto,
            nearingMaturity,
            primeClients
          },
          summary: {
            noAutoLoan: noAutoLoan.length,
            highInterestAuto: highInterestAuto.length,
            nearingMaturity: nearingMaturity.length,
            primeClients: primeClients.length,
            totalOpportunities: noAutoLoan.length + highInterestAuto.length + nearingMaturity.length + primeClients.length
          }
        });
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        // Set empty data structure to prevent errors
        setData({
          success: true,
          results: {
            noAutoLoan: [],
            highInterestAuto: [],
            nearingMaturity: [],
            primeClients: []
          },
          summary: {
            noAutoLoan: 0,
            highInterestAuto: 0,
            nearingMaturity: 0,
            primeClients: 0,
            totalOpportunities: 0
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleContact = (client, method) => {
    if (method === 'email') {
      window.location.href = `mailto:${client.email}?subject=Auto Financing Opportunity`;
    } else if (method === 'phone') {
      window.location.href = `tel:${client.phone}`;
    }
  };

  const handleAddToCampaign = (client) => {
    setSelectedClients(prev => [...prev, client]);
    setCampaignDialog({ open: true, clients: [...selectedClients, client] });
  };

  const getTabData = () => {
    if (!data?.results) return [];
    switch (activeTab) {
      case 0: return data.results.noAutoLoan.map(c => ({ ...c, type: 'no_auto' }));
      case 1: return data.results.highInterestAuto.map(c => ({ ...c, type: 'high_rate' }));
      case 2: return data.results.nearingMaturity.map(c => ({ ...c, type: 'nearing_maturity' }));
      case 3: return data.results.primeClients.map(c => ({ ...c, type: 'prime' }));
      default: return [];
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <DirectionsCar sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Auto Financing Opportunities
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Toyota Franchise Lead Generation
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedClients.length > 0 && (
              <Button
                variant="contained"
                startIcon={<Campaign />}
                onClick={() => setCampaignDialog({ open: true, clients: selectedClients })}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
              >
                Campaign ({selectedClients.length})
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              onClick={loadOpportunities}
              disabled={loading}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              Scan Clients
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      {data && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={DirectionsCar}
              title="No Auto Loan"
              value={data.summary?.noAutoLoan || 0}
              subtitle="Potential new customers"
              color="#3b82f6"
              onClick={() => setActiveTab(0)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={TrendingDown}
              title="High Interest"
              value={data.summary?.highInterestAuto || 0}
              subtitle="Refinance opportunities"
              color="#f59e0b"
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={Schedule}
              title="Nearing Maturity"
              value={data.summary?.nearingMaturity || 0}
              subtitle="Upgrade opportunities"
              color="#22c55e"
              onClick={() => setActiveTab(2)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={Star}
              title="Prime Clients"
              value={data.summary?.primeClients || 0}
              subtitle="700+ credit score"
              color="#8b5cf6"
              onClick={() => setActiveTab(3)}
            />
          </Grid>
        </Grid>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Tabs & Table */}
      {data && !loading && (
        <>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
              <Tab
                icon={<Badge badgeContent={data.summary?.noAutoLoan || 0} color="primary"><DirectionsCar /></Badge>}
                label="No Auto Loan"
              />
              <Tab
                icon={<Badge badgeContent={data.summary?.highInterestAuto || 0} color="warning"><TrendingDown /></Badge>}
                label="High Interest"
              />
              <Tab
                icon={<Badge badgeContent={data.summary?.nearingMaturity || 0} color="success"><Schedule /></Badge>}
                label="Nearing Maturity"
              />
              <Tab
                icon={<Badge badgeContent={data.summary?.primeClients || 0} color="secondary"><Star /></Badge>}
                label="Prime Clients"
              />
            </Tabs>
          </Paper>

          <Paper>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Credit Score</TableCell>
                    <TableCell>Opportunity</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Current Loans</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTabData().map((client, idx) => (
                    <ClientRow
                      key={idx}
                      client={client}
                      type={client.type}
                      onContact={handleContact}
                      onAddToCampaign={handleAddToCampaign}
                    />
                  ))}
                  {getTabData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <DirectionsCar sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">
                          No opportunities found in this category
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Empty State */}
      {!data && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Click "Scan Clients" to find auto financing opportunities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The system will analyze client credit reports for refinancing and new vehicle opportunities
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
            Launch Auto Financing Campaign
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send personalized outreach to {campaignDialog.clients.length} selected clients
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Selected Clients:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {campaignDialog.clients.map((c, idx) => (
              <Chip
                key={idx}
                avatar={<Avatar>{c.clientName?.charAt(0)}</Avatar>}
                label={`${c.clientName} (${c.avgScore})`}
                onDelete={() => {
                  const updated = campaignDialog.clients.filter((_, i) => i !== idx);
                  setCampaignDialog({ ...campaignDialog, clients: updated });
                  setSelectedClients(updated);
                }}
              />
            ))}
          </Box>

          <TextField
            fullWidth
            label="Email Subject"
            defaultValue="Exclusive Auto Financing Offer for You!"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Email Message"
            defaultValue={`Hi [First Name],

As our valued client, we wanted to reach out about an exclusive opportunity. Based on your credit profile, you may qualify for competitive auto financing rates through our Toyota franchise partnership.

Whether you're looking for a new vehicle, want to refinance your current loan at a lower rate, or simply exploring your options, we're here to help.

Would you like to schedule a quick call to discuss your options?

Best regards,
Speedy Credit Repair Team`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCampaignDialog({ open: false, clients: [] });
            setSelectedClients([]);
          }}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Send />}>
            Send Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutoOpportunityDashboard;
