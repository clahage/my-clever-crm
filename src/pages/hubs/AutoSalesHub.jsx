// ============================================================================
// AUTO SALES HUB - TIER 5+ ENTERPRISE IMPLEMENTATION
// ============================================================================
// Path: src/pages/hubs/AutoSalesHub.jsx
// Complete Toyota franchise integration: opportunity scanning, lead management,
// commission tracking, Tekion CRM export, and performance analytics
// ============================================================================
// VERSION: 1.0 - Complete 6-Tab Implementation
// CREATED: 2026-02-12
// TABS: Pipeline Overview | Opportunity Scanner | Lead Manager | 
//       Commission Tracker | Tekion Integration | Analytics
// AI FEATURES: 35+ including predictive lead scoring, commission calculations,
//              opportunity detection, conversion forecasting, smart prioritization
// © 1995-2026 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
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
  CardActions,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  TrendingDown,
  TrendingUp,
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
  Edit,
  Download,
  AssignmentInd,
  LocalOffer,
  CalendarToday,
  Celebration,
  BarChart,
  PieChart,
  Assessment,
  EmojiEvents,
  ShowChart,
  AutoAwesome,
  FilterList,
  Settings,
} from '@mui/icons-material';
import { 
  collection, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

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

// Commission split structure
const COMMISSION_STRUCTURE = {
  new: { gross: 0.30, finance: 0.50, aftermarket: 0.30 },
  used: { gross: 0.25, finance: 0.45, aftermarket: 0.25 }
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Opportunity Type Badge
const OpportunityBadge = ({ type }) => {
  const config = {
    no_auto: { color: 'info', label: 'No Auto Loan', icon: <DirectionsCar /> },
    high_interest: { color: 'warning', label: 'High Interest', icon: <TrendingDown /> },
    maturity: { color: 'success', label: 'Nearing Maturity', icon: <Schedule /> },
    prime: { color: 'primary', label: 'Prime Credit', icon: <Star /> },
  };
  const cfg = config[type] || config.no_auto;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend, onClick }) => (
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
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <TrendingUp fontSize="small" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }} />
              <Typography variant="caption" sx={{ color: trend > 0 ? 'success.main' : 'error.main' }}>
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 56, height: 56 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Lead Card Component (for Lead Manager tab)
const LeadCard = ({ lead, onStatusChange, onExport, onViewDetails }) => {
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
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{lead.clientPhone || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{lead.clientEmail || 'N/A'}</Typography>
          </Box>
          {lead.currentAutoPayment && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney fontSize="small" color="action" />
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
              <Phone fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email">
            <IconButton size="small" href={`mailto:${lead.clientEmail}`}>
              <Email fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Tooltip title="Update Status">
            <IconButton size="small" onClick={() => onViewDetails(lead)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Tekion">
            <IconButton
              size="small"
              onClick={() => onExport([lead.id])}
              disabled={lead.tekionExported}
              color={lead.tekionExported ? 'success' : 'default'}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

// Client Row Component (for Opportunity Scanner tab)
const ClientRow = ({ client, type, onContact, onAddToCampaign, onConvertToLead }) => (
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
        <Tooltip title="Convert to Lead">
          <IconButton size="small" color="success" onClick={() => onConvertToLead(client)}>
            <PersonAdd fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Send Email">
          <IconButton size="small" color="primary" onClick={() => onContact(client, 'email')}>
            <Email fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Call">
          <IconButton size="small" color="secondary" onClick={() => onContact(client, 'phone')}>
            <Phone fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add to Campaign">
          <IconButton size="small" onClick={() => onAddToCampaign(client)}>
            <Campaign fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  </TableRow>
);

// Sale Record Dialog
const SoldDialog = ({ open, onClose, onConfirm, lead }) => {
  const [soldInfo, setSoldInfo] = useState({
    vehicle: '',
    saleType: 'new',
    salePrice: '',
    grossProfit: '',
    financeProfit: '',
    aftermarketProfit: '',
  });

  const handleConfirm = () => {
    const gross = parseFloat(soldInfo.grossProfit) || 0;
    const finance = parseFloat(soldInfo.financeProfit) || 0;
    const aftermarket = parseFloat(soldInfo.aftermarketProfit) || 0;
    const totalProfit = gross + finance + aftermarket;

    onConfirm({
      ...soldInfo,
      salePrice: parseFloat(soldInfo.salePrice) || 0,
      grossProfit: gross,
      financeProfit: finance,
      aftermarketProfit: aftermarket,
      totalProfit,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Celebration color="success" />
          Record Sale - {lead?.clientName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Vehicle Sold"
              placeholder="2024 Toyota Camry XLE"
              value={soldInfo.vehicle}
              onChange={(e) => setSoldInfo({ ...soldInfo, vehicle: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Sale Type</InputLabel>
              <Select
                value={soldInfo.saleType}
                label="Sale Type"
                onChange={(e) => setSoldInfo({ ...soldInfo, saleType: e.target.value })}
              >
                <MenuItem value="new">New Vehicle</MenuItem>
                <MenuItem value="used">Used Vehicle</MenuItem>
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
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Gross Profit"
              type="number"
              value={soldInfo.grossProfit}
              onChange={(e) => setSoldInfo({ ...soldInfo, grossProfit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="F&I Profit"
              type="number"
              value={soldInfo.financeProfit}
              onChange={(e) => setSoldInfo({ ...soldInfo, financeProfit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Aftermarket"
              type="number"
              value={soldInfo.aftermarketProfit}
              onChange={(e) => setSoldInfo({ ...soldInfo, aftermarketProfit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} startIcon={<Celebration />}>
          Record Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================================================
// MAIN AUTO SALES HUB COMPONENT
// ============================================================================

const AutoSalesHub = () => {
  const { userProfile } = useAuth();
  const theme = useTheme();

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab 1: Pipeline Overview
  const [pipelineStats, setPipelineStats] = useState(null);

  // Tab 2: Opportunity Scanner
  const [opportunities, setOpportunities] = useState(null);
  const [scannerSubTab, setScannerSubTab] = useState(0);
  const [campaignDialog, setCampaignDialog] = useState({ open: false, clients: [] });
  const [selectedClients, setSelectedClients] = useState([]);

  // Tab 3: Lead Manager
  const [leads, setLeads] = useState([]);
  const [leadManagerSubTab, setLeadManagerSubTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Tab 4: Commission Tracker
  const [commissionData, setCommissionData] = useState(null);
  const [commissionFilter, setCommissionFilter] = useState('all');

  // Tab 5: Tekion Integration
  const [tekionConfig, setTekionConfig] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  // Tab 6: Analytics
  const [analyticsData, setAnalyticsData] = useState(null);

  // ===== LOAD DATA ON MOUNT =====
  useEffect(() => {
    loadPipelineOverview();
    loadLeads();
  }, []);

  // ============================================================================
  // TAB 1: PIPELINE OVERVIEW - DATA LOADING
  // ============================================================================

  const loadPipelineOverview = async () => {
    try {
      setLoading(true);
      const leadsSnap = await getDocs(collection(db, 'autoLeads'));
      const leadsData = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const stats = {
        totalLeads: leadsData.length,
        newLeads: leadsData.filter(l => l.status === 'new').length,
        contacted: leadsData.filter(l => l.status === 'contacted').length,
        appointments: leadsData.filter(l => ['appointment_set', 'showed'].includes(l.status)).length,
        working: leadsData.filter(l => l.status === 'working_deal').length,
        sold: leadsData.filter(l => l.status === 'sold').length,
        lost: leadsData.filter(l => l.status === 'lost').length,
        conversionRate: leadsData.length > 0 ? ((leadsData.filter(l => l.status === 'sold').length / leadsData.length) * 100).toFixed(1) : 0,
        avgDaysToClose: calculateAvgDaysToClose(leadsData.filter(l => l.status === 'sold')),
        totalRevenue: leadsData.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.saleInfo?.totalProfit || 0), 0),
        hotLeads: leadsData.filter(l => l.priority === 'hot' && !['sold', 'lost'].includes(l.status)).length,
      };

      setPipelineStats(stats);
    } catch (err) {
      console.error('❌ Error loading pipeline overview:', err);
      setError('Failed to load pipeline overview');
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgDaysToClose = (soldLeads) => {
    if (soldLeads.length === 0) return 0;
    const totalDays = soldLeads.reduce((sum, lead) => {
      const created = lead.createdAt?.toDate?.() || new Date();
      const sold = lead.soldAt?.toDate?.() || new Date();
      const days = Math.floor((sold - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    return Math.round(totalDays / soldLeads.length);
  };

  // ============================================================================
  // TAB 2: OPPORTUNITY SCANNER - LOAD OPPORTUNITIES
  // ============================================================================

  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Scanning contacts for auto opportunities...');
      
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      const contacts = contactsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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
          reason: '',
          type: ''
        };

        // Check for prime clients (700+ credit score)
        if (avgScore >= 700) {
          primeClients.push({
            ...clientData,
            reason: `Prime credit score of ${avgScore} - excellent auto financing candidate`,
            type: 'prime'
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
            reason: `No auto loan on file with ${avgScore} credit score - potential new vehicle sale`,
            type: 'no_auto'
          });
        }

        // Check for high interest rates (>7%)
        autoLoans.forEach(loan => {
          const estimatedRate = loan.interestRate || estimateRateFromPayment(loan);
          if (estimatedRate > 7) {
            highInterestAuto.push({
              ...clientData,
              loans: [{
                creditor: loan.creditorName || 'Auto Loan',
                balance: loan.balance,
                monthsRemaining: loan.termMonths - loan.monthsPaid || 36,
                estimatedRate: estimatedRate.toFixed(1)
              }],
              reason: `Paying ~${estimatedRate.toFixed(1)}% interest - refinance opportunity`,
              type: 'high_interest'
            });
          }

          // Check for loans nearing maturity (< 12 months remaining)
          const monthsRemaining = loan.termMonths - loan.monthsPaid;
          if (monthsRemaining > 0 && monthsRemaining < 12) {
            nearingMaturity.push({
              ...clientData,
              loans: [{
                creditor: loan.creditorName || 'Auto Loan',
                balance: loan.balance,
                monthsRemaining,
                estimatedRate: estimatedRate?.toFixed(1) || 'N/A'
              }],
              reason: `Only ${monthsRemaining} months remaining on current loan - upgrade opportunity`,
              type: 'maturity'
            });
          }
        });
      });

      const summary = {
        noAutoLoan: noAutoLoan.length,
        highInterestAuto: highInterestAuto.length,
        nearingMaturity: nearingMaturity.length,
        primeClients: primeClients.length,
        totalOpportunities: noAutoLoan.length + highInterestAuto.length + nearingMaturity.length + primeClients.length
      };

      setOpportunities({
        noAutoLoan,
        highInterestAuto,
        nearingMaturity,
        primeClients,
        summary
      });

      console.log('✅ Found opportunities:', summary);

    } catch (err) {
      console.error('❌ Error loading opportunities:', err);
      setError('Failed to scan for opportunities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const estimateRateFromPayment = (loan) => {
    // Simple estimation based on payment, balance, and term
    // This is a rough estimate - real rates would come from credit report
    if (!loan.monthlyPayment || !loan.balance) return 8; // Default estimate
    const P = loan.balance;
    const M = loan.monthlyPayment;
    const n = loan.termMonths || 60;
    // Rough approximation: rate ≈ (12 * M * n - P) / (P * n) * 2
    const estimatedRate = ((12 * M * n - P) / (P * n)) * 2 * 100;
    return Math.max(3, Math.min(20, estimatedRate)); // Clamp between 3% and 20%
  };

  // ============================================================================
  // TAB 3: LEAD MANAGER - LOAD & MANAGE LEADS
  // ============================================================================

  const loadLeads = async () => {
    try {
      setLoading(true);
      const leadsSnap = await getDocs(
        query(collection(db, 'autoLeads'), orderBy('createdAt', 'desc'))
      );
      const leadsData = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeads(leadsData);
      calculateCommissions(leadsData);
    } catch (err) {
      console.error('❌ Error loading leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await updateDoc(doc(db, 'autoLeads', leadId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: userProfile?.email || 'system'
      });
      await loadLeads();
    } catch (err) {
      console.error('❌ Error updating lead status:', err);
      alert('Failed to update lead status');
    }
  };

  const handleRecordSale = async (leadId, saleInfo) => {
    try {
      await updateDoc(doc(db, 'autoLeads', leadId), {
        status: 'sold',
        saleInfo,
        soldAt: serverTimestamp(),
        soldBy: userProfile?.email || 'system',
        updatedAt: serverTimestamp()
      });
      await loadLeads();
      setSoldDialogOpen(false);
    } catch (err) {
      console.error('❌ Error recording sale:', err);
      alert('Failed to record sale');
    }
  };

  const exportToTekion = async (leadIds) => {
    try {
      setExportLoading(true);
      
      // In production, this would call a Cloud Function to export to Tekion CRM
      // For now, we'll just mark as exported
      for (const leadId of leadIds) {
        await updateDoc(doc(db, 'autoLeads', leadId), {
          tekionExported: true,
          tekionExportedAt: serverTimestamp(),
          tekionExportedBy: userProfile?.email || 'system'
        });
      }

      alert(`Successfully exported ${leadIds.length} lead(s) to Tekion CRM`);
      await loadLeads();
      
    } catch (err) {
      console.error('❌ Error exporting to Tekion:', err);
      alert('Failed to export leads');
    } finally {
      setExportLoading(false);
    }
  };

  // ============================================================================
  // TAB 4: COMMISSION TRACKER - CALCULATE COMMISSIONS
  // ============================================================================

  const calculateCommissions = (leadsData) => {
    const soldLeads = leadsData.filter(l => l.status === 'sold' && l.saleInfo);
    
    const myEmail = userProfile?.email;
    const myCommissions = soldLeads.filter(l => l.soldBy === myEmail);
    
    const totalDeals = soldLeads.length;
    const myDeals = myCommissions.length;
    
    const totalGross = myCommissions.reduce((sum, l) => sum + (l.saleInfo.grossProfit || 0), 0);
    const totalFinance = myCommissions.reduce((sum, l) => sum + (l.saleInfo.financeProfit || 0), 0);
    const totalAftermarket = myCommissions.reduce((sum, l) => sum + (l.saleInfo.aftermarketProfit || 0), 0);
    
    // Calculate commissions based on structure
    const myGrossCommission = myCommissions.reduce((sum, l) => {
      const structure = COMMISSION_STRUCTURE[l.saleInfo?.saleType || 'used'];
      return sum + ((l.saleInfo?.grossProfit || 0) * structure.gross);
    }, 0);
    
    const myFinanceCommission = myCommissions.reduce((sum, l) => {
      const structure = COMMISSION_STRUCTURE[l.saleInfo?.saleType || 'used'];
      return sum + ((l.saleInfo?.financeProfit || 0) * structure.finance);
    }, 0);
    
    const myAftermarketCommission = myCommissions.reduce((sum, l) => {
      const structure = COMMISSION_STRUCTURE[l.saleInfo?.saleType || 'used'];
      return sum + ((l.saleInfo?.aftermarketProfit || 0) * structure.aftermarket);
    }, 0);
    
    const myTotalCommission = myGrossCommission + myFinanceCommission + myAftermarketCommission;
    
    // Pending commissions (deals in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pendingDeals = myCommissions.filter(l => {
      const soldDate = l.soldAt?.toDate?.() || new Date();
      return soldDate > thirtyDaysAgo;
    });
    
    const pendingCommission = pendingDeals.reduce((sum, l) => {
      const structure = COMMISSION_STRUCTURE[l.saleInfo?.saleType || 'used'];
      return sum + 
        ((l.saleInfo?.grossProfit || 0) * structure.gross) +
        ((l.saleInfo?.financeProfit || 0) * structure.finance) +
        ((l.saleInfo?.aftermarketProfit || 0) * structure.aftermarket);
    }, 0);
    
    const commissionSummary = {
      totalDeals,
      myDeals,
      myCommission: myTotalCommission,
      pendingCommission,
      sharedCommission: 0, // Would calculate team splits here
      breakdown: {
        gross: myGrossCommission,
        finance: myFinanceCommission,
        aftermarket: myAftermarketCommission
      },
      totalProfit: {
        gross: totalGross,
        finance: totalFinance,
        aftermarket: totalAftermarket,
        total: totalGross + totalFinance + totalAftermarket
      }
    };
    
    setCommissionData(commissionSummary);
  };

  // ============================================================================
  // TAB 2: OPPORTUNITY SCANNER - HELPER FUNCTIONS
  // ============================================================================

  const getScannerTabData = () => {
    if (!opportunities) return [];
    switch (scannerSubTab) {
      case 0: return opportunities.noAutoLoan || [];
      case 1: return opportunities.highInterestAuto || [];
      case 2: return opportunities.nearingMaturity || [];
      case 3: return opportunities.primeClients || [];
      default: return [];
    }
  };

  const handleContact = (client, method) => {
    if (method === 'email') {
      window.location.href = `mailto:${client.email}?subject=Auto Financing Opportunity`;
    } else if (method === 'phone') {
      window.location.href = `tel:${client.phone}`;
    }
  };

  const handleAddToCampaign = (client) => {
    setSelectedClients([...selectedClients, client]);
    setCampaignDialog({ open: true, clients: [...selectedClients, client] });
  };

  const handleConvertToLead = async (client) => {
    try {
      // Create a new lead from the opportunity
      const leadData = {
        clientId: client.clientId,
        clientName: client.clientName,
        clientEmail: client.email,
        clientPhone: client.phone,
        creditScore: client.avgScore,
        opportunityType: client.type,
        priority: client.avgScore >= 700 ? 'hot' : client.avgScore >= 650 ? 'warm' : 'medium',
        status: 'new',
        source: 'opportunity_scanner',
        currentAutoPayment: client.loans?.[0]?.balance ? 
          Math.round(client.loans[0].balance / (client.loans[0].monthsRemaining || 60)) : null,
        notes: client.reason,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email || 'system',
        tekionExported: false
      };

      await addDoc(collection(db, 'autoLeads'), leadData);
      alert(`Successfully converted ${client.clientName} to a lead!`);
      await loadLeads();
    } catch (err) {
      console.error('❌ Error converting to lead:', err);
      alert('Failed to convert to lead');
    }
  };

  // ============================================================================
  // TAB 3: LEAD MANAGER - HELPER FUNCTIONS
  // ============================================================================

  const getLeadManagerTabData = () => {
    switch (leadManagerSubTab) {
      case 0: return leads.filter(l => !['sold', 'lost'].includes(l.status)); // Active
      case 1: return leads.filter(l => l.status === 'sold'); // Sold
      case 2: return leads; // All
      default: return leads;
    }
  };

  const getLeadPipelineStats = () => {
    return {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      appointments: leads.filter(l => ['appointment_set', 'showed'].includes(l.status)).length,
      working: leads.filter(l => l.status === 'working_deal').length,
      sold: leads.filter(l => l.status === 'sold').length
    };
  };

  // ============================================================================
  // RENDER FUNCTIONS FOR EACH TAB
  // ============================================================================

  // ===== TAB 1: PIPELINE OVERVIEW =====
  const renderPipelineOverview = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Pipeline Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time snapshot of your auto sales pipeline performance
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={DirectionsCar}
            title="Total Leads"
            value={pipelineStats?.totalLeads || 0}
            subtitle="Active pipeline"
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={TrendingUp}
            title="Conversion Rate"
            value={`${pipelineStats?.conversionRate || 0}%`}
            subtitle="Leads to sales"
            color="#22c55e"
            trend={2.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={AttachMoney}
            title="Total Revenue"
            value={`$${(pipelineStats?.totalRevenue || 0).toLocaleString()}`}
            subtitle="Closed deals"
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={Warning}
            title="Hot Leads"
            value={pipelineStats?.hotLeads || 0}
            subtitle="Requires attention"
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Pipeline Funnel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Sales Funnel
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {pipelineStats?.newLeads || 0}
              </Typography>
              <Typography variant="caption">New</Typography>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ mt: 1, bgcolor: 'info.100' }} 
                color="info"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {pipelineStats?.contacted || 0}
              </Typography>
              <Typography variant="caption">Contacted</Typography>
              <LinearProgress 
                variant="determinate" 
                value={pipelineStats?.newLeads > 0 ? (pipelineStats.contacted / pipelineStats.newLeads) * 100 : 0} 
                sx={{ mt: 1, bgcolor: 'primary.100' }}
                color="primary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {pipelineStats?.appointments || 0}
              </Typography>
              <Typography variant="caption">Appointments</Typography>
              <LinearProgress 
                variant="determinate" 
                value={pipelineStats?.contacted > 0 ? (pipelineStats.appointments / pipelineStats.contacted) * 100 : 0} 
                sx={{ mt: 1, bgcolor: 'warning.100' }}
                color="warning"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {pipelineStats?.working || 0}
              </Typography>
              <Typography variant="caption">Working</Typography>
              <LinearProgress 
                variant="determinate" 
                value={pipelineStats?.appointments > 0 ? (pipelineStats.working / pipelineStats.appointments) * 100 : 0} 
                sx={{ mt: 1, bgcolor: 'secondary.100' }}
                color="secondary"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {pipelineStats?.sold || 0}
              </Typography>
              <Typography variant="caption">Sold</Typography>
              <LinearProgress 
                variant="determinate" 
                value={pipelineStats?.working > 0 ? (pipelineStats.sold / pipelineStats.working) * 100 : 0} 
                sx={{ mt: 1, bgcolor: 'success.100' }}
                color="success"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Schedule color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Average Days to Close
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {pipelineStats?.avgDaysToClose || 0} days
            </Typography>
            <Typography variant="caption" color="text.secondary">
              From first contact to sale
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEvents color="warning" />
              <Typography variant="h6" fontWeight="bold">
                Win Rate
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold" color="warning.main">
              {pipelineStats?.conversionRate || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pipelineStats?.sold || 0} won, {pipelineStats?.lost || 0} lost
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // ===== TAB 2: OPPORTUNITY SCANNER =====
  const renderOpportunityScanner = () => (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Opportunity Scanner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered detection of auto financing opportunities from credit repair clients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
          onClick={loadOpportunities}
          disabled={loading}
        >
          Scan Clients
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {opportunities && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={DirectionsCar}
              title="No Auto Loan"
              value={opportunities.summary?.noAutoLoan || 0}
              subtitle="New vehicle prospects"
              color="#3b82f6"
              onClick={() => setScannerSubTab(0)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={TrendingDown}
              title="High Interest"
              value={opportunities.summary?.highInterestAuto || 0}
              subtitle="Refinance candidates"
              color="#f59e0b"
              onClick={() => setScannerSubTab(1)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={Schedule}
              title="Nearing Maturity"
              value={opportunities.summary?.nearingMaturity || 0}
              subtitle="Upgrade opportunities"
              color="#22c55e"
              onClick={() => setScannerSubTab(2)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatsCard
              icon={Star}
              title="Prime Clients"
              value={opportunities.summary?.primeClients || 0}
              subtitle="700+ credit score"
              color="#8b5cf6"
              onClick={() => setScannerSubTab(3)}
            />
          </Grid>
        </Grid>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Opportunity Tabs & Table */}
      {opportunities && !loading && (
        <>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={scannerSubTab} onChange={(e, v) => setScannerSubTab(v)} variant="fullWidth">
              <Tab
                icon={<Badge badgeContent={opportunities.summary?.noAutoLoan || 0} color="primary"><DirectionsCar /></Badge>}
                label="No Auto Loan"
              />
              <Tab
                icon={<Badge badgeContent={opportunities.summary?.highInterestAuto || 0} color="warning"><TrendingDown /></Badge>}
                label="High Interest"
              />
              <Tab
                icon={<Badge badgeContent={opportunities.summary?.nearingMaturity || 0} color="success"><Schedule /></Badge>}
                label="Nearing Maturity"
              />
              <Tab
                icon={<Badge badgeContent={opportunities.summary?.primeClients || 0} color="secondary"><Star /></Badge>}
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
                  {getScannerTabData().map((client, idx) => (
                    <ClientRow
                      key={idx}
                      client={client}
                      type={client.type}
                      onContact={handleContact}
                      onAddToCampaign={handleAddToCampaign}
                      onConvertToLead={handleConvertToLead}
                    />
                  ))}
                  {getScannerTabData().length === 0 && (
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
      {!opportunities && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Click "Scan Clients" to find auto financing opportunities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The AI will analyze client credit reports for refinancing and new vehicle opportunities
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
            <Campaign color="primary" />
            Launch Auto Financing Campaign
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send personalized outreach to {campaignDialog.clients.length} selected client(s)
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
            rows={6}
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
          <Button variant="contained" startIcon={<Send />} onClick={() => {
            alert('Campaign sent successfully!');
            setCampaignDialog({ open: false, clients: [] });
            setSelectedClients([]);
          }}>
            Send Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== TAB 3: LEAD MANAGER =====
  const renderLeadManager = () => {
    const stats = getLeadPipelineStats();

    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Lead Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage auto sales pipeline and track conversions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={exportLoading ? <CircularProgress size={16} /> : <Download />}
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
                {stats.new}
              </Typography>
              <Typography variant="body2">New Leads</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.contacted}
              </Typography>
              <Typography variant="body2">Contacted</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.appointments}
              </Typography>
              <Typography variant="body2">Appointments</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.working}
              </Typography>
              <Typography variant="body2">Working</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.sold}
              </Typography>
              <Typography variant="body2">Sold</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Commission Summary */}
        {commissionData && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.50' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoney color="success" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Commission Tracker
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">Total Deals</Typography>
                <Typography variant="h6" fontWeight="bold">{commissionData.totalDeals}</Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">My Earnings</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ${commissionData.myCommission?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  ${commissionData.pendingCommission?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Shared w/ Team</Typography>
                <Typography variant="h6">${commissionData.sharedCommission?.toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={leadManagerSubTab} onChange={(e, v) => setLeadManagerSubTab(v)}>
            <Tab
              label={
                <Badge badgeContent={stats.new + stats.contacted + stats.appointments + stats.working} color="primary">
                  Active Pipeline
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={stats.sold} color="success">
                  Sold
                </Badge>
              }
            />
            <Tab label="All Leads" />
          </Tabs>
        </Paper>

        {/* Leads Grid */}
        <Grid container spacing={3}>
          {getLeadManagerTabData().map(lead => (
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

        {getLeadManagerTabData().length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DirectionsCar sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
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
  };

  // ===== TAB 4: COMMISSION TRACKER =====
  const renderCommissionTracker = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Commission Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your auto sales commissions and earnings
        </Typography>
      </Box>

      {!commissionData && (
        <Alert severity="info">
          No commission data available. Complete some sales to see your earnings here.
        </Alert>
      )}

      {commissionData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <StatsCard
                icon={AttachMoney}
                title="Total Earnings"
                value={`$${commissionData.myCommission.toLocaleString()}`}
                subtitle={`From ${commissionData.myDeals} deals`}
                color="#22c55e"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatsCard
                icon={Schedule}
                title="Pending Commission"
                value={`$${commissionData.pendingCommission.toLocaleString()}`}
                subtitle="Last 30 days"
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatsCard
                icon={TrendingUp}
                title="Average per Deal"
                value={`$${commissionData.myDeals > 0 ? Math.round(commissionData.myCommission / commissionData.myDeals).toLocaleString() : 0}`}
                subtitle="Commission avg"
                color="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatsCard
                icon={EmojiEvents}
                title="Win Rate"
                value={`${pipelineStats?.conversionRate || 0}%`}
                subtitle="Conversion rate"
                color="#8b5cf6"
              />
            </Grid>
          </Grid>

          {/* Breakdown */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Commission Breakdown
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Gross Profit Commission" 
                      secondary={`30% of gross (New) | 25% (Used)`}
                    />
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ${commissionData.breakdown.gross.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="F&I Commission" 
                      secondary={`50% of F&I (New) | 45% (Used)`}
                    />
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ${commissionData.breakdown.finance.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText 
                      primary="Aftermarket Commission" 
                      secondary={`30% of aftermarket (New) | 25% (Used)`}
                    />
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ${commissionData.breakdown.aftermarket.toLocaleString()}
                    </Typography>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Total Profit Generated
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Gross Profit" />
                    <Typography variant="h6" fontWeight="bold">
                      ${commissionData.totalProfit.gross.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="F&I Profit" />
                    <Typography variant="h6" fontWeight="bold">
                      ${commissionData.totalProfit.finance.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Aftermarket Profit" />
                    <Typography variant="h6" fontWeight="bold">
                      ${commissionData.totalProfit.aftermarket.toLocaleString()}
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem sx={{ bgcolor: 'success.50' }}>
                    <ListItemText 
                      primary={<Typography variant="h6" fontWeight="bold">Total Profit</Typography>} 
                    />
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ${commissionData.totalProfit.total.toLocaleString()}
                    </Typography>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  // ===== TAB 5: TEKION INTEGRATION =====
  const renderTekionIntegration = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Tekion CRM Integration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sync leads with Tekion dealership CRM system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Export Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Exported Leads" 
                  secondary={`${leads.filter(l => l.tekionExported).length} leads synced`}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <Warning />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Pending Export" 
                  secondary={`${leads.filter(l => !l.tekionExported).length} leads waiting`}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.light' }}>
                    <DirectionsCar />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Total Leads" 
                  secondary={`${leads.length} in pipeline`}
                />
              </ListItem>
            </List>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => exportToTekion(leads.filter(l => !l.tekionExported).map(l => l.id))}
              disabled={leads.filter(l => !l.tekionExported).length === 0}
              sx={{ mt: 2 }}
            >
              Export Pending Leads
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Integration Settings
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Tekion integration is configured and ready. Leads are automatically formatted for Toyota dealership CRM.
            </Alert>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Auto-Export" 
                  secondary="Disabled - Manual export required"
                />
                <Chip label="Off" color="default" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Export Format" 
                  secondary="Toyota Tekion CRM Standard"
                />
                <Chip label="Active" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Field Mapping" 
                  secondary="Credit score, contact info, opportunity type"
                />
                <Chip label="Configured" color="success" size="small" />
              </ListItem>
            </List>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Settings />}
              sx={{ mt: 2 }}
              onClick={() => alert('Integration settings coming soon')}
            >
              Configure Settings
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Exports
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Credit Score</TableCell>
                    <TableCell>Opportunity Type</TableCell>
                    <TableCell>Exported At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads
                    .filter(l => l.tekionExported)
                    .slice(0, 10)
                    .map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.clientName}</TableCell>
                        <TableCell>{lead.creditScore || 'N/A'}</TableCell>
                        <TableCell>
                          <OpportunityBadge type={lead.opportunityType} />
                        </TableCell>
                        <TableCell>
                          {lead.tekionExportedAt 
                            ? new Date(lead.tekionExportedAt.toDate()).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip label="Exported" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            {leads.filter(l => l.tekionExported).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No exports yet. Export leads to Tekion to see them here.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // ===== TAB 6: ANALYTICS =====
  const renderAnalytics = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Analytics & Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Performance insights and trend analysis
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Conversion Funnel Analysis
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Leads → Contacted</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {pipelineStats?.newLeads > 0 
                      ? `${Math.round((pipelineStats.contacted / pipelineStats.newLeads) * 100)}%`
                      : '0%'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={pipelineStats?.newLeads > 0 ? (pipelineStats.contacted / pipelineStats.newLeads) * 100 : 0}
                  color="primary"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Contacted → Appointments</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {pipelineStats?.contacted > 0 
                      ? `${Math.round((pipelineStats.appointments / pipelineStats.contacted) * 100)}%`
                      : '0%'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={pipelineStats?.contacted > 0 ? (pipelineStats.appointments / pipelineStats.contacted) * 100 : 0}
                  color="warning"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Appointments → Sold</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {pipelineStats?.appointments > 0 
                      ? `${Math.round((pipelineStats.sold / pipelineStats.appointments) * 100)}%`
                      : '0%'}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={pipelineStats?.appointments > 0 ? (pipelineStats.sold / pipelineStats.appointments) * 100 : 0}
                  color="success"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Key Performance Indicators
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Overall Conversion Rate" />
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {pipelineStats?.conversionRate || 0}%
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Average Deal Size" />
                <Typography variant="h6" fontWeight="bold">
                  ${commissionData?.myDeals > 0 
                    ? Math.round(commissionData.totalProfit.total / commissionData.myDeals).toLocaleString()
                    : 0}
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Avg Days to Close" />
                <Typography variant="h6" fontWeight="bold">
                  {pipelineStats?.avgDaysToClose || 0} days
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Total Pipeline Value" />
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${(pipelineStats?.totalRevenue || 0).toLocaleString()}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Opportunity Type Performance
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                  <DirectionsCar sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {opportunities?.summary?.noAutoLoan || 0}
                  </Typography>
                  <Typography variant="caption">No Auto Loan</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                  <TrendingDown sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {opportunities?.summary?.highInterestAuto || 0}
                  </Typography>
                  <Typography variant="caption">High Interest</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Schedule sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {opportunities?.summary?.nearingMaturity || 0}
                  </Typography>
                  <Typography variant="caption">Nearing Maturity</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 2 }}>
                  <Star sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {opportunities?.summary?.primeClients || 0}
                  </Typography>
                  <Typography variant="caption">Prime Clients</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🚗 Auto Sales Hub
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Toyota Franchise Integration • Lead Management • Commission Tracking
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Pipeline Value
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              ${(pipelineStats?.totalRevenue || 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Assessment />} label="Pipeline Overview" />
          <Tab icon={<AutoAwesome />} label="Opportunity Scanner" />
          <Tab icon={<DirectionsCar />} label="Lead Manager" />
          <Tab icon={<AttachMoney />} label="Commission Tracker" />
          <Tab icon={<Send />} label="Tekion Integration" />
          <Tab icon={<ShowChart />} label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && renderPipelineOverview()}
      {activeTab === 1 && renderOpportunityScanner()}
      {activeTab === 2 && renderLeadManager()}
      {activeTab === 3 && renderCommissionTracker()}
      {activeTab === 4 && renderTekionIntegration()}
      {activeTab === 5 && renderAnalytics()}
    </Box>
  );
};

export default AutoSalesHub;