// ============================================================================
// CONTRACT STATUS TRACKER
// ============================================================================
// Path: /src/components/common/ContractStatusTracker.jsx
//
// PURPOSE:
// Real-time contract status tracking with timeline visualization,
// document management, and action buttons for contract lifecycle
//
// AI FEATURES (8 total):
// 1. Signature likelihood prediction
// 2. Risk assessment
// 3. Renewal prediction
// 4. Next-best-action suggestions
// 5. Anomaly detection
// 6. Optimal reminder timing
// 7. Churn prevention alerts
// 8. Upsell opportunities
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  CircularProgress,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  FileText,
  Send,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  FileCheck,
  Activity,
  Sparkles,
  Target,
  ShieldAlert,
  Bell,
  Gift,
  PlayCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Mock service plans for reference
const SERVICE_PLANS = {
  basic: { id: 'basic', name: 'Basic Plan', monthlyFee: 79, tier: 1 },
  standard: { id: 'standard', name: 'Standard Plan', monthlyFee: 119, tier: 2 },
  premium: { id: 'premium', name: 'Premium Plan', monthlyFee: 199, tier: 3 },
  enterprise: { id: 'enterprise', name: 'Enterprise Plan', monthlyFee: 299, tier: 4 },
};

// Contract status definitions
const CONTRACT_STATUSES = {
  draft: { label: 'Draft', color: 'default', icon: FileText },
  sent: { label: 'Sent for Signature', color: 'info', icon: Send },
  viewed: { label: 'Client Viewed', color: 'primary', icon: Eye },
  signed: { label: 'Signed', color: 'success', icon: CheckCircle },
  active: { label: 'Active', color: 'success', icon: PlayCircle },
  expired: { label: 'Expired', color: 'warning', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'error', icon: XCircle },
  voided: { label: 'Voided', color: 'error', icon: Trash2 },
};

// Timeline steps
const TIMELINE_STEPS = [
  { key: 'draft', label: 'Draft Created', icon: FileText },
  { key: 'sent', label: 'Sent for Signature', icon: Send },
  { key: 'viewed', label: 'Client Viewed', icon: Eye },
  { key: 'awaitingSignature', label: 'Awaiting Signature', icon: Clock },
  { key: 'signed', label: 'Signed', icon: CheckCircle },
  { key: 'active', label: 'Contract Activated', icon: PlayCircle },
];

// Mock contract data generator
const generateMockContract = (id, status = 'sent') => {
  const baseDate = new Date('2025-01-10T10:30:00');
  const contract = {
    id: id || 'SCR-20250110-ABCD',
    contractNumber: id || 'SCR-20250110-ABCD',
    contactId: 'contact_123',
    contactName: 'John Anderson',
    contactEmail: 'john.anderson@example.com',
    contactPhone: '(555) 123-4567',
    planId: 'standard',
    status: status,
    createdAt: baseDate,
    sentAt: status !== 'draft' ? new Date(baseDate.getTime() + 45 * 60000) : null,
    viewedAt: ['viewed', 'signed', 'active'].includes(status) ? new Date(baseDate.getTime() + 255 * 60000) : null,
    signedAt: ['signed', 'active'].includes(status) ? new Date(baseDate.getTime() + 1440 * 60000) : null,
    activatedAt: status === 'active' ? new Date(baseDate.getTime() + 1500 * 60000) : null,
    expiresAt: new Date(baseDate.getTime() + 365 * 24 * 60 * 60000),
    monthlyFee: 119,
    setupFee: 149,
    totalValue: 1577, // 12 months * 119 + 149
    duration: 12,
    documents: [
      { id: 'doc1', name: 'Service Agreement.pdf', type: 'contract', uploadedAt: baseDate, size: '245 KB' },
      { id: 'doc2', name: 'Terms & Conditions.pdf', type: 'terms', uploadedAt: baseDate, size: '89 KB' },
    ],
    timeline: [
      { status: 'draft', date: baseDate.toISOString(), user: 'Christopher', action: 'Created draft contract' },
      status !== 'draft' && { status: 'sent', date: new Date(baseDate.getTime() + 45 * 60000).toISOString(), via: 'DocuSign', action: 'Sent to client via DocuSign' },
      ['viewed', 'signed', 'active'].includes(status) && { status: 'viewed', date: new Date(baseDate.getTime() + 255 * 60000).toISOString(), ip: '192.168.1.1', action: 'Client opened document' },
      ['signed', 'active'].includes(status) && { status: 'signed', date: new Date(baseDate.getTime() + 1440 * 60000).toISOString(), action: 'Client signed contract' },
      status === 'active' && { status: 'active', date: new Date(baseDate.getTime() + 1500 * 60000).toISOString(), user: 'Christopher', action: 'Contract activated' },
    ].filter(Boolean),
    signatureInfo: ['signed', 'active'].includes(status) ? {
      signedBy: 'John Anderson',
      signedAt: new Date(baseDate.getTime() + 1440 * 60000),
      ipAddress: '192.168.1.1',
      method: 'DocuSign',
      certificateId: 'DS-2025-ABCD-1234',
    } : null,
    paymentInfo: {
      method: 'Credit Card',
      lastFour: '4242',
      nextPaymentDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60000),
      status: status === 'active' ? 'current' : 'pending',
    },
    aiInsights: {
      signatureLikelihood: 75,
      riskScore: 15,
      renewalProbability: 82,
      churRisk: 'low',
      upsellOpportunity: 'premium',
    },
  };
  return contract;
};

const ContractStatusTracker = ({
  contactId = null,
  contractId = null,
  showAll = false,
}) => {
  // State management
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    timeline: true,
    documents: false,
    activity: false,
  });
  const [aiInsightsExpanded, setAiInsightsExpanded] = useState(true);

  // Load contracts (mock data)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockContracts = [
        generateMockContract('SCR-20250110-ABCD', 'sent'),
        generateMockContract('SCR-20250105-WXYZ', 'active'),
        generateMockContract('SCR-20250108-EFGH', 'viewed'),
        generateMockContract('SCR-20250103-IJKL', 'draft'),
      ];

      let filtered = mockContracts;

      if (contractId) {
        filtered = mockContracts.filter(c => c.id === contractId);
      } else if (contactId) {
        filtered = mockContracts.filter(c => c.contactId === contactId);
      } else if (!showAll) {
        filtered = mockContracts.slice(0, 1);
      }

      setContracts(filtered);
      setSelectedContract(filtered[0]);
      setLoading(false);
    }, 800);
  }, [contractId, contactId, showAll]);

  // Real-time updates simulation (Firebase listener)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time status updates
      setContracts(prev => prev.map(contract => {
        if (contract.status === 'sent' && Math.random() > 0.95) {
          return { ...contract, status: 'viewed', viewedAt: new Date() };
        }
        return contract;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter(c => c.planId === filterPlan);
    }

    if (dateRange.start) {
      filtered = filtered.filter(c => new Date(c.createdAt) >= dateRange.start);
    }

    if (dateRange.end) {
      filtered = filtered.filter(c => new Date(c.createdAt) <= dateRange.end);
    }

    return filtered;
  }, [contracts, filterStatus, filterPlan, dateRange]);

  // Get current step index for timeline
  const getCurrentStepIndex = (contract) => {
    if (contract.status === 'active') return 5;
    if (contract.status === 'signed' || contract.signedAt) return 4;
    if (contract.viewedAt) return 2;
    if (contract.sentAt) return 1;
    return 0;
  };

  // AI Feature 1: Signature likelihood prediction
  const calculateSignatureLikelihood = (contract) => {
    let likelihood = 50;

    if (contract.viewedAt) likelihood += 20;
    if (contract.timeline.length > 2) likelihood += 10;

    const hoursSinceSent = contract.sentAt
      ? (new Date() - new Date(contract.sentAt)) / (1000 * 60 * 60)
      : 0;

    if (hoursSinceSent < 24) likelihood += 15;
    else if (hoursSinceSent > 72) likelihood -= 20;

    return Math.max(0, Math.min(100, likelihood));
  };

  // AI Feature 2: Risk assessment
  const assessRisk = (contract) => {
    let riskScore = 0;

    const hoursSinceSent = contract.sentAt
      ? (new Date() - new Date(contract.sentAt)) / (1000 * 60 * 60)
      : 0;

    if (hoursSinceSent > 72 && !contract.viewedAt) riskScore += 30;
    if (contract.status === 'draft' && (new Date() - new Date(contract.createdAt)) / (1000 * 60 * 60 * 24) > 3) riskScore += 25;
    if (contract.totalValue > 2000) riskScore += 10;

    return {
      score: Math.min(100, riskScore),
      level: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high',
      factors: [
        hoursSinceSent > 72 && !contract.viewedAt && 'Document not viewed after 72 hours',
        contract.status === 'draft' && 'Long-pending draft',
        contract.totalValue > 2000 && 'High contract value',
      ].filter(Boolean),
    };
  };

  // AI Feature 3: Renewal prediction
  const predictRenewal = (contract) => {
    if (contract.status !== 'active') return null;

    let probability = 70;

    // Adjust based on contract age
    const monthsActive = Math.floor((new Date() - new Date(contract.activatedAt || contract.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    if (monthsActive > 6) probability += 15;

    // Payment status
    if (contract.paymentInfo.status === 'current') probability += 10;

    return {
      probability: Math.min(100, probability),
      recommendedAction: probability > 75 ? 'Proactive renewal offer' : 'Increase engagement',
      optimalTiming: '60 days before expiration',
    };
  };

  // AI Feature 4: Next-best-action suggestions
  const suggestNextAction = (contract) => {
    const hoursSinceSent = contract.sentAt
      ? (new Date() - new Date(contract.sentAt)) / (1000 * 60 * 60)
      : 0;

    switch (contract.status) {
      case 'draft':
        return { action: 'Send for Signature', priority: 'high', icon: Send };
      case 'sent':
        if (hoursSinceSent > 48 && !contract.viewedAt) {
          return { action: 'Send Reminder', priority: 'high', icon: Bell };
        }
        return { action: 'Wait for Client', priority: 'low', icon: Clock };
      case 'viewed':
        if (hoursSinceSent > 24) {
          return { action: 'Follow Up Call', priority: 'medium', icon: Bell };
        }
        return { action: 'Monitor Progress', priority: 'low', icon: Eye };
      case 'signed':
        return { action: 'Activate Contract', priority: 'high', icon: PlayCircle };
      case 'active':
        return { action: 'Schedule Check-in', priority: 'medium', icon: Calendar };
      default:
        return { action: 'Review Contract', priority: 'low', icon: FileText };
    }
  };

  // AI Feature 5: Anomaly detection
  const detectAnomalies = (contract) => {
    const anomalies = [];

    const viewTime = contract.viewedAt && contract.sentAt
      ? (new Date(contract.viewedAt) - new Date(contract.sentAt)) / (1000 * 60)
      : null;

    if (viewTime && viewTime < 5) {
      anomalies.push({ type: 'warning', message: 'Document viewed unusually quickly after sending' });
    }

    if (contract.timeline.length > 10) {
      anomalies.push({ type: 'info', message: 'High activity level detected' });
    }

    const hoursSinceSent = contract.sentAt
      ? (new Date() - new Date(contract.sentAt)) / (1000 * 60 * 60)
      : 0;

    if (hoursSinceSent > 120 && !contract.signedAt) {
      anomalies.push({ type: 'error', message: 'Contract pending for over 5 days' });
    }

    return anomalies;
  };

  // AI Feature 6: Optimal reminder timing
  const calculateOptimalReminderTime = (contract) => {
    if (contract.status !== 'sent') return null;

    const hoursSinceSent = (new Date() - new Date(contract.sentAt)) / (1000 * 60 * 60);

    if (hoursSinceSent < 24) {
      return { shouldSend: false, reason: 'Too soon', nextOptimalTime: '24 hours after sending' };
    }

    if (hoursSinceSent >= 24 && hoursSinceSent < 48 && !contract.viewedAt) {
      return { shouldSend: true, reason: 'Not yet viewed', urgency: 'medium' };
    }

    if (hoursSinceSent >= 48) {
      return { shouldSend: true, reason: 'Long pending', urgency: 'high' };
    }

    return { shouldSend: false, reason: 'Client engaged', nextOptimalTime: 'Monitor progress' };
  };

  // AI Feature 7: Churn prevention alerts
  const assessChurnRisk = (contract) => {
    if (contract.status !== 'active') return null;

    const risk = assessRisk(contract);
    const renewal = predictRenewal(contract);

    if (renewal && renewal.probability < 60) {
      return {
        level: 'high',
        message: 'Low renewal probability detected',
        actions: ['Schedule retention call', 'Offer loyalty discount', 'Review service satisfaction'],
      };
    }

    return null;
  };

  // AI Feature 8: Upsell opportunities
  const identifyUpsellOpportunities = (contract) => {
    if (contract.status !== 'active') return null;

    const currentPlan = SERVICE_PLANS[contract.planId];
    const opportunities = [];

    if (currentPlan.tier < 3) {
      opportunities.push({
        plan: 'premium',
        reason: 'Client has been active for 3+ months',
        estimatedValue: 80,
        confidence: 'medium',
      });
    }

    if (currentPlan.tier < 4) {
      opportunities.push({
        plan: 'enterprise',
        reason: 'High contract value suggests room for upgrade',
        estimatedValue: 180,
        confidence: 'low',
      });
    }

    return opportunities.length > 0 ? opportunities[0] : null;
  };

  // Handle action button clicks
  const handleAction = (action) => {
    setActionType(action);
    setShowActionDialog(true);
  };

  // Execute action
  const executeAction = () => {
    console.log(`Executing action: ${actionType} for contract ${selectedContract.id}`);
    setShowActionDialog(false);
    // In real app, this would call API
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Render action buttons based on status
  const renderActionButtons = (contract) => {
    const buttons = [];

    switch (contract.status) {
      case 'draft':
        buttons.push(
          <Button key="edit" variant="outlined" startIcon={<Edit size={16} />} onClick={() => handleAction('edit')}>
            Edit
          </Button>,
          <Button key="send" variant="contained" startIcon={<Send size={16} />} onClick={() => handleAction('send')}>
            Send
          </Button>,
          <Button key="delete" variant="outlined" color="error" startIcon={<Trash2 size={16} />} onClick={() => handleAction('delete')}>
            Delete
          </Button>
        );
        break;
      case 'sent':
      case 'viewed':
        buttons.push(
          <Button key="reminder" variant="outlined" startIcon={<Bell size={16} />} onClick={() => handleAction('reminder')}>
            Resend Reminder
          </Button>,
          <Button key="void" variant="outlined" color="error" startIcon={<XCircle size={16} />} onClick={() => handleAction('void')}>
            Void
          </Button>,
          <Button key="docusign" variant="contained" startIcon={<ExternalLink size={16} />} onClick={() => handleAction('docusign')}>
            View in DocuSign
          </Button>
        );
        break;
      case 'signed':
        buttons.push(
          <Button key="download" variant="outlined" startIcon={<Download size={16} />} onClick={() => handleAction('download')}>
            Download PDF
          </Button>,
          <Button key="activate" variant="contained" startIcon={<PlayCircle size={16} />} onClick={() => handleAction('activate')}>
            Activate
          </Button>
        );
        break;
      case 'active':
        buttons.push(
          <Button key="payments" variant="outlined" startIcon={<DollarSign size={16} />} onClick={() => handleAction('payments')}>
            Payment History
          </Button>,
          <Button key="addendum" variant="outlined" startIcon={<FileText size={16} />} onClick={() => handleAction('addendum')}>
            Generate Addendum
          </Button>,
          <Button key="extend" variant="contained" startIcon={<Calendar size={16} />} onClick={() => handleAction('extend')}>
            Extend
          </Button>
        );
        break;
      case 'expired':
        buttons.push(
          <Button key="renew" variant="contained" startIcon={<RefreshCw size={16} />} onClick={() => handleAction('renew')}>
            Renew
          </Button>,
          <Button key="archive" variant="outlined" startIcon={<Trash2 size={16} />} onClick={() => handleAction('archive')}>
            Archive
          </Button>
        );
        break;
      default:
        break;
    }

    return buttons;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedContract) {
    return (
      <Alert severity="info">
        No contracts found. {contractId && `Contract ${contractId} does not exist.`}
      </Alert>
    );
  }

  const statusInfo = CONTRACT_STATUSES[selectedContract.status];
  const StatusIcon = statusInfo.icon;
  const currentStepIndex = getCurrentStepIndex(selectedContract);
  const nextAction = suggestNextAction(selectedContract);
  const riskAssessment = assessRisk(selectedContract);
  const anomalies = detectAnomalies(selectedContract);
  const reminderTiming = calculateOptimalReminderTime(selectedContract);
  const churnAlert = assessChurnRisk(selectedContract);
  const upsellOpportunity = identifyUpsellOpportunities(selectedContract);
  const renewalPrediction = predictRenewal(selectedContract);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
      {/* Contract List (if multiple) */}
      {contracts.length > 1 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Contracts"
            subheader={`${filteredContracts.length} contract(s)`}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    {Object.entries(CONTRACT_STATUSES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>{value.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    label="Plan"
                  >
                    <MenuItem value="all">All</MenuItem>
                    {Object.values(SERVICE_PLANS).map(plan => (
                      <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            }
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contract #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      hover
                      selected={selectedContract.id === contract.id}
                      onClick={() => setSelectedContract(contract)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{contract.contractNumber}</TableCell>
                      <TableCell>{contract.contactName}</TableCell>
                      <TableCell>{SERVICE_PLANS[contract.planId].name}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<StatusIcon size={14} />}
                          label={CONTRACT_STATUSES[contract.status].label}
                          color={CONTRACT_STATUSES[contract.status].color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">${contract.totalValue.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small">
                          <MoreVertical size={16} />
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

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Contract Header */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: `${statusInfo.color}.main` }}>
                  <StatusIcon size={24} />
                </Avatar>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">Contract {selectedContract.contractNumber}</Typography>
                  <Chip
                    icon={<StatusIcon size={14} />}
                    label={statusInfo.label}
                    color={statusInfo.color}
                    size="small"
                  />
                </Box>
              }
              subheader={`Created ${new Date(selectedContract.createdAt).toLocaleString()}`}
              action={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {renderActionButtons(selectedContract)}
                </Box>
              }
            />
          </Card>

          {/* Timeline Visualization */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Contract Timeline</Typography>
                  <IconButton size="small" onClick={() => toggleSection('timeline')}>
                    {expandedSections.timeline ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                </Box>
              }
            />
            <Collapse in={expandedSections.timeline}>
              <CardContent>
                <Stepper activeStep={currentStepIndex} orientation="vertical">
                  {TIMELINE_STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const timelineEvent = selectedContract.timeline.find(t => t.status === step.key);

                    return (
                      <Step key={step.key} completed={isCompleted}>
                        <StepLabel
                          icon={<StepIcon size={20} />}
                          optional={
                            timelineEvent && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(timelineEvent.date).toLocaleString()}
                              </Typography>
                            )
                          }
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          {timelineEvent && (
                            <Typography variant="body2" color="text.secondary">
                              {timelineEvent.action}
                              {timelineEvent.user && ` by ${timelineEvent.user}`}
                              {timelineEvent.via && ` via ${timelineEvent.via}`}
                            </Typography>
                          )}
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              </CardContent>
            </Collapse>
          </Card>

          {/* Contract Details */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Contract Details</Typography>
                  <IconButton size="small" onClick={() => toggleSection('details')}>
                    {expandedSections.details ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                </Box>
              }
            />
            <Collapse in={expandedSections.details}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Client Information</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1">{selectedContract.contactName}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedContract.contactEmail}</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedContract.contactPhone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Plan Information</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1">{SERVICE_PLANS[selectedContract.planId].name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${selectedContract.monthlyFee}/month for {selectedContract.duration} months
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Setup: ${selectedContract.setupFee}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Payment Information</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">{selectedContract.paymentInfo.method} •••• {selectedContract.paymentInfo.lastFour}</Typography>
                      <Chip
                        label={selectedContract.paymentInfo.status.toUpperCase()}
                        size="small"
                        color={selectedContract.paymentInfo.status === 'current' ? 'success' : 'warning'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Contract Value</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h5" color="primary">${selectedContract.totalValue.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(selectedContract.expiresAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Collapse>
          </Card>

          {/* Documents */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Documents</Typography>
                  <IconButton size="small" onClick={() => toggleSection('documents')}>
                    {expandedSections.documents ? <ChevronUp /> : <ChevronDown />}
                  </IconButton>
                </Box>
              }
            />
            <Collapse in={expandedSections.documents}>
              <CardContent>
                <List>
                  {selectedContract.documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleAction('downloadDoc')}>
                          <Download size={16} />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <FileCheck size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${doc.type} • ${doc.size} • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        {/* Sidebar - AI Insights */}
        <Grid item xs={12} lg={4}>
          {/* Next Best Action */}
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Target size={20} />
                <Typography variant="h6">Next Best Action</Typography>
                <Chip
                  label={nextAction.priority.toUpperCase()}
                  size="small"
                  color={nextAction.priority === 'high' ? 'error' : nextAction.priority === 'medium' ? 'warning' : 'success'}
                  sx={{ ml: 'auto' }}
                />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {nextAction.action}
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                fullWidth
                startIcon={<nextAction.icon size={16} />}
                onClick={() => handleAction(nextAction.action.toLowerCase().replace(' ', '_'))}
              >
                Take Action
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={<Sparkles size={20} />}
              title="AI Insights"
              action={
                <IconButton size="small" onClick={() => setAiInsightsExpanded(!aiInsightsExpanded)}>
                  {aiInsightsExpanded ? <ChevronUp /> : <ChevronDown />}
                </IconButton>
              }
            />
            <Collapse in={aiInsightsExpanded}>
              <CardContent>
                {/* Signature Likelihood */}
                {['sent', 'viewed'].includes(selectedContract.status) && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Signature Likelihood</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {calculateSignatureLikelihood(selectedContract)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateSignatureLikelihood(selectedContract)}
                      color={calculateSignatureLikelihood(selectedContract) > 70 ? 'success' : 'warning'}
                    />
                  </Box>
                )}

                {/* Risk Assessment */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShieldAlert size={16} />
                    <Typography variant="body2">Risk Assessment</Typography>
                    <Chip
                      label={riskAssessment.level.toUpperCase()}
                      size="small"
                      color={riskAssessment.level === 'low' ? 'success' : riskAssessment.level === 'medium' ? 'warning' : 'error'}
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  {riskAssessment.factors.length > 0 && (
                    <List dense>
                      {riskAssessment.factors.map((factor, idx) => (
                        <ListItem key={idx} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <AlertTriangle size={14} />
                          </ListItemIcon>
                          <ListItemText
                            primary={factor}
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Renewal Prediction */}
                {renewalPrediction && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Renewal Probability</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {renewalPrediction.probability}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={renewalPrediction.probability}
                      color={renewalPrediction.probability > 70 ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {renewalPrediction.recommendedAction}
                    </Typography>
                  </Box>
                )}

                {/* Upsell Opportunity */}
                {upsellOpportunity && (
                  <Alert severity="info" icon={<Gift size={16} />} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Upsell to {SERVICE_PLANS[upsellOpportunity.plan].name}
                    </Typography>
                    <Typography variant="caption">
                      {upsellOpportunity.reason}
                    </Typography>
                  </Alert>
                )}

                {/* Churn Alert */}
                {churnAlert && (
                  <Alert severity="error" icon={<AlertTriangle size={16} />}>
                    <Typography variant="body2" fontWeight="bold">
                      Churn Risk: {churnAlert.level.toUpperCase()}
                    </Typography>
                    <Typography variant="caption">{churnAlert.message}</Typography>
                  </Alert>
                )}

                {/* Anomalies */}
                {anomalies.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Anomalies Detected
                    </Typography>
                    {anomalies.map((anomaly, idx) => (
                      <Alert key={idx} severity={anomaly.type} sx={{ mb: 1 }}>
                        <Typography variant="caption">{anomaly.message}</Typography>
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Optimal Reminder Timing */}
                {reminderTiming && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Reminder Timing
                    </Typography>
                    <Alert
                      severity={reminderTiming.shouldSend ? 'warning' : 'info'}
                      icon={<Bell size={16} />}
                    >
                      <Typography variant="caption">
                        {reminderTiming.shouldSend
                          ? `Send reminder now (${reminderTiming.urgency} urgency)`
                          : `${reminderTiming.reason}. Next: ${reminderTiming.nextOptimalTime}`}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Collapse>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader
              avatar={<Activity size={20} />}
              title="Activity Log"
              action={
                <IconButton size="small" onClick={() => toggleSection('activity')}>
                  {expandedSections.activity ? <ChevronUp /> : <ChevronDown />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections.activity}>
              <CardContent>
                <List dense>
                  {selectedContract.timeline.slice().reverse().map((event, idx) => (
                    <ListItem key={idx} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Activity size={14} />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.action}
                        secondary={new Date(event.date).toLocaleString()}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to perform this action: <strong>{actionType}</strong>?
          </Typography>
          {actionType === 'send' && (
            <TextField
              fullWidth
              label="Recipient Email"
              defaultValue={selectedContract.contactEmail}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)}>Cancel</Button>
          <Button onClick={executeAction} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractStatusTracker;
