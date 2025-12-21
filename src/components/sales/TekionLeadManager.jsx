import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Badge,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Download as ExportIcon,
  AssignmentInd as AssignIcon,
  LocalOffer as TagIcon,
  CalendarToday as CalendarIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'info' },
  { value: 'contacted', label: 'Contacted', color: 'primary' },
  { value: 'appointment_set', label: 'Appointment Set', color: 'warning' },
  { value: 'showed', label: 'Showed', color: 'secondary' },
  { value: 'working_deal', label: 'Working Deal', color: 'warning' },
  { value: 'sold', label: 'Sold', color: 'success' },
  { value: 'lost', label: 'Lost', color: 'error' }
];

const OPPORTUNITY_TYPES = [
  { value: 'no_auto', label: 'No Auto Loan', icon: '🆕', description: 'First-time auto buyer' },
  { value: 'high_interest', label: 'High Interest', icon: '📉', description: 'Refinance opportunity' },
  { value: 'maturity', label: 'Loan Maturity', icon: '📅', description: 'Ready for upgrade' },
  { value: 'prime', label: 'Prime Credit', icon: '⭐', description: 'Excellent credit' }
];

const PRIORITY_COLORS = {
  hot: 'error',
  warm: 'warning',
  medium: 'info',
  low: 'default'
};

function LeadCard({ lead, onStatusChange, onAssign, onExport, onViewDetails }) {
  const theme = useTheme();
  const status = LEAD_STATUSES.find(s => s.value === lead.status);
  const opportunityType = OPPORTUNITY_TYPES.find(t => t.value === lead.opportunityType);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {lead.clientName?.charAt(0) || 'C'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {lead.clientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Score: {lead.creditScore || 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={lead.priority}
            size="small"
            color={PRIORITY_COLORS[lead.priority] || 'default'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`${opportunityType?.icon} ${opportunityType?.label}`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={status?.label}
            color={status?.color}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{lead.clientPhone || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{lead.clientEmail || 'N/A'}</Typography>
          </Box>
          {lead.currentAutoPayment && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Current Payment: ${lead.currentAutoPayment}/mo
              </Typography>
            </Box>
          )}
        </Box>

        {lead.appointmentAt && (
          <Alert severity="info" sx={{ mt: 2, py: 0.5 }}>
            <Typography variant="caption">
              📅 Appointment: {new Date(lead.appointmentAt.toDate?.() || lead.appointmentAt).toLocaleDateString()}
            </Typography>
          </Alert>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box>
          <Tooltip title="Call">
            <IconButton size="small" href={`tel:${lead.clientPhone}`}>
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email">
            <IconButton size="small" href={`mailto:${lead.clientEmail}`}>
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title="Update Status">
            <IconButton size="small" onClick={() => onViewDetails(lead)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Tekion">
            <IconButton
              size="small"
              onClick={() => onExport([lead.id])}
              disabled={lead.tekionExported}
              color={lead.tekionExported ? 'success' : 'default'}
            >
              <ExportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
}

function SoldDialog({ open, onClose, onConfirm, lead }) {
  const [soldInfo, setSoldInfo] = useState({
    vehicle: '',
    saleType: 'new',
    salePrice: '',
    grossProfit: '',
    financeProfit: ''
  });

  const handleConfirm = () => {
    onConfirm({
      ...soldInfo,
      salePrice: parseFloat(soldInfo.salePrice) || 0,
      grossProfit: parseFloat(soldInfo.grossProfit) || 0,
      financeProfit: parseFloat(soldInfo.financeProfit) || 0,
      totalProfit: (parseFloat(soldInfo.grossProfit) || 0) + (parseFloat(soldInfo.financeProfit) || 0)
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CelebrationIcon color="success" />
          Record Sale - {lead?.clientName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Vehicle Sold"
              placeholder="e.g., 2024 Toyota Camry XSE"
              value={soldInfo.vehicle}
              onChange={(e) => setSoldInfo({ ...soldInfo, vehicle: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Sale Type</InputLabel>
              <Select
                value={soldInfo.saleType}
                label="Sale Type"
                onChange={(e) => setSoldInfo({ ...soldInfo, saleType: e.target.value })}
              >
                <MenuItem value="new">New Vehicle</MenuItem>
                <MenuItem value="used">Used Vehicle</MenuItem>
                <MenuItem value="lease">Lease</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Sale Price"
              type="number"
              value={soldInfo.salePrice}
              onChange={(e) => setSoldInfo({ ...soldInfo, salePrice: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Front Gross"
              type="number"
              value={soldInfo.grossProfit}
              onChange={(e) => setSoldInfo({ ...soldInfo, grossProfit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Finance/Back-End Profit"
              type="number"
              value={soldInfo.financeProfit}
              onChange={(e) => setSoldInfo({ ...soldInfo, financeProfit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleConfirm}>
          Record Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TekionLeadManager() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [commissionSummary, setCommissionSummary] = useState(null);

  useEffect(() => {
    loadLeads();
    loadCommissions();
  }, [statusFilter]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const getAutoLeads = httpsCallable(functions, 'getAutoLeads');
      const result = await getAutoLeads({ status: statusFilter || undefined });
      setLeads(result.data.leads || []);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCommissions = async () => {
    try {
      const getCommissionSummary = httpsCallable(functions, 'getCommissionSummary');
      const result = await getCommissionSummary({});
      setCommissionSummary(result.data.summary);
    } catch (err) {
      console.error('Error loading commissions:', err);
    }
  };

  const updateLeadStatus = async (leadId, status, additionalData = {}) => {
    try {
      const updateAutoLeadStatus = httpsCallable(functions, 'updateAutoLeadStatus');
      await updateAutoLeadStatus({
        leadId,
        status,
        ...additionalData
      });
      loadLeads();
      if (status === 'sold') {
        loadCommissions();
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  const handleRecordSale = (leadId, soldInfo) => {
    updateLeadStatus(leadId, 'sold', { soldInfo });
  };

  const exportToTekion = async (leadIds) => {
    setExportLoading(true);
    try {
      const exportFn = httpsCallable(functions, 'exportToTekion');
      const result = await exportFn({ leadIds });
      alert(`Successfully exported ${result.data.exportedCount} leads to Tekion format`);
      loadLeads();
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Error exporting leads');
    } finally {
      setExportLoading(false);
    }
  };

  const pipelineStats = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    appointments: leads.filter(l => ['appointment_set', 'showed'].includes(l.status)).length,
    working: leads.filter(l => l.status === 'working_deal').length,
    sold: leads.filter(l => l.status === 'sold').length
  };

  const filterLeadsByTab = () => {
    switch (activeTab) {
      case 0: return leads.filter(l => !['sold', 'lost'].includes(l.status));
      case 1: return leads.filter(l => l.status === 'sold');
      case 2: return leads; // All leads
      default: return leads;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Toyota Lead Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage auto leads from credit repair clients • Tekion CRM Integration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={exportLoading ? <CircularProgress size={16} /> : <ExportIcon />}
          onClick={() => exportToTekion(leads.filter(l => !l.tekionExported).map(l => l.id))}
          disabled={exportLoading || leads.every(l => l.tekionExported)}
        >
          Export All to Tekion
        </Button>
      </Box>

      {/* Pipeline Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {pipelineStats.new}
            </Typography>
            <Typography variant="body2">New Leads</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {pipelineStats.contacted}
            </Typography>
            <Typography variant="body2">Contacted</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {pipelineStats.appointments}
            </Typography>
            <Typography variant="body2">Appointments</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {pipelineStats.working}
            </Typography>
            <Typography variant="body2">Working</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {pipelineStats.sold}
            </Typography>
            <Typography variant="body2">Sold</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Commission Summary */}
      {commissionSummary && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="success" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Commission Tracker
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" color="text.secondary">Total Deals</Typography>
              <Typography variant="h6" fontWeight="bold">{commissionSummary.totalDeals}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" color="text.secondary">My Earnings</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                ${commissionSummary.myCommission?.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                ${commissionSummary.pendingCommission?.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Shared w/ Team</Typography>
              <Typography variant="h6">${commissionSummary.sharedCommission?.toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            label={
              <Badge badgeContent={pipelineStats.new + pipelineStats.contacted + pipelineStats.appointments + pipelineStats.working} color="primary">
                Active Pipeline
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={pipelineStats.sold} color="success">
                Sold
              </Badge>
            }
          />
          <Tab label="All Leads" />
        </Tabs>
      </Paper>

      {/* Leads Grid */}
      <Grid container spacing={3}>
        {filterLeadsByTab().map(lead => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={lead.id}>
            <LeadCard
              lead={lead}
              onStatusChange={updateLeadStatus}
              onExport={exportToTekion}
              onViewDetails={(lead) => {
                setSelectedLead(lead);
                if (lead.status !== 'sold') {
                  setDetailsOpen(true);
                }
              }}
            />
          </Grid>
        ))}
      </Grid>

      {filterLeadsByTab().length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No leads in this category
          </Typography>
        </Paper>
      )}

      {/* Status Update Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Lead - {selectedLead?.clientName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedLead?.status || ''}
              label="Status"
              onChange={(e) => {
                if (e.target.value === 'sold') {
                  setDetailsOpen(false);
                  setSoldDialogOpen(true);
                } else {
                  updateLeadStatus(selectedLead.id, e.target.value);
                  setDetailsOpen(false);
                }
              }}
            >
              {LEAD_STATUSES.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Sold Dialog */}
      <SoldDialog
        open={soldDialogOpen}
        onClose={() => setSoldDialogOpen(false)}
        onConfirm={(soldInfo) => handleRecordSale(selectedLead?.id, soldInfo)}
        lead={selectedLead}
      />
    </Box>
  );
}
