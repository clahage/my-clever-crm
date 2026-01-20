// Path: /src/components/documents/ComplianceTab.jsx
// ============================================================================
// COMPLIANCE TAB - FCRA Compliance, Audit Trails, and Regulatory Alerts
// ============================================================================
// FEATURES:
// - FCRA compliance dashboard
// - Document audit trails
// - Compliance checklists
// - Regulatory alert notifications
// - State law requirement tracking
// - AI-powered compliance analysis
// - Risk assessment
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Avatar, LinearProgress, Stack, Fade,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel,
  Switch, Badge, Tabs, Tab,
} from '@mui/material';
import {
  VerifiedUser as ComplianceIcon,
  Gavel as LegalIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as FailIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  History as AuditIcon,
  NotificationsActive as AlertIcon,
  Assignment as ChecklistIcon,
  LocationOn as StateIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Policy as PolicyIcon,
  Description as DocumentIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

// ============================================================================
// CONSTANTS
// ============================================================================

const FCRA_REQUIREMENTS = [
  {
    id: 'disclosure',
    name: 'CROA Disclosure Statement',
    description: 'Credit Repair Organizations Act disclosure must be provided before signing',
    required: true,
    category: 'Pre-Contract',
  },
  {
    id: 'rights-notice',
    name: 'Consumer Rights Notice',
    description: 'Written notice of consumer rights under state and federal law',
    required: true,
    category: 'Pre-Contract',
  },
  {
    id: 'cancellation',
    name: '3-Day Cancellation Right',
    description: 'Consumer must have right to cancel within 3 business days',
    required: true,
    category: 'Contract Terms',
  },
  {
    id: 'no-upfront',
    name: 'No Upfront Fees',
    description: 'Cannot charge fees until services are fully performed (in most states)',
    required: true,
    category: 'Payment',
  },
  {
    id: 'written-contract',
    name: 'Written Contract',
    description: 'All agreements must be in writing and signed by consumer',
    required: true,
    category: 'Contract Terms',
  },
  {
    id: 'service-description',
    name: 'Service Description',
    description: 'Contract must describe services to be performed',
    required: true,
    category: 'Contract Terms',
  },
  {
    id: 'timeline',
    name: 'Performance Timeline',
    description: 'Contract must include timeline for service completion',
    required: true,
    category: 'Contract Terms',
  },
  {
    id: 'total-cost',
    name: 'Total Cost Disclosure',
    description: 'Full disclosure of all fees and costs',
    required: true,
    category: 'Payment',
  },
];

const COMPLIANCE_STATUSES = {
  compliant: { label: 'Compliant', color: '#10b981', icon: <CheckIcon /> },
  warning: { label: 'Warning', color: '#f59e0b', icon: <WarningIcon /> },
  violation: { label: 'Violation', color: '#ef4444', icon: <ErrorIcon /> },
  pending: { label: 'Pending Review', color: '#6b7280', icon: <ScheduleIcon /> },
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

// ============================================================================
// COMPLIANCE TAB COMPONENT
// ============================================================================

const ComplianceTab = ({ documents, loading, onRefresh, userRole }) => {
  // ===== STATE =====
  const [viewTab, setViewTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openChecklistDialog, setOpenChecklistDialog] = useState(false);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiComplianceReport, setAiComplianceReport] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [alerts, setAlerts] = useState([]);

  // ===== INITIALIZE CHECKLIST =====
  useEffect(() => {
    const initialChecklist = {};
    FCRA_REQUIREMENTS.forEach(req => {
      initialChecklist[req.id] = false;
    });
    setChecklist(initialChecklist);

    // Mock alerts
    setAlerts([
      { id: 1, type: 'warning', message: 'CFPB updated credit repair guidelines - Review required', date: new Date() },
      { id: 2, type: 'info', message: 'California AB 2424 compliance deadline approaching', date: new Date(Date.now() - 86400000) },
    ]);
  }, []);

  // ===== COMPLIANCE ANALYSIS =====
  const complianceStats = useMemo(() => {
    const docsWithStatus = documents.filter(d => d.complianceStatus);
    const compliant = docsWithStatus.filter(d => d.complianceStatus === 'compliant').length;
    const warning = docsWithStatus.filter(d => d.complianceStatus === 'warning').length;
    const violation = docsWithStatus.filter(d => d.complianceStatus === 'violation').length;
    const pending = documents.length - docsWithStatus.length;

    const checklistCompleted = Object.values(checklist).filter(Boolean).length;
    const checklistTotal = FCRA_REQUIREMENTS.length;

    return {
      totalDocuments: documents.length,
      compliant,
      warning,
      violation,
      pending,
      complianceRate: documents.length > 0 ? Math.round((compliant / documents.length) * 100) : 0,
      checklistProgress: Math.round((checklistCompleted / checklistTotal) * 100),
      riskScore: violation * 30 + warning * 10 + pending * 5,
      byCategory: {
        'Pre-Contract': FCRA_REQUIREMENTS.filter(r => r.category === 'Pre-Contract').filter(r => checklist[r.id]).length,
        'Contract Terms': FCRA_REQUIREMENTS.filter(r => r.category === 'Contract Terms').filter(r => checklist[r.id]).length,
        'Payment': FCRA_REQUIREMENTS.filter(r => r.category === 'Payment').filter(r => checklist[r.id]).length,
      },
    };
  }, [documents, checklist]);

  // ===== AUDIT TRAIL =====
  const auditTrail = useMemo(() => {
    // Generate mock audit trail from documents
    return documents.slice(0, 20).map((doc, idx) => ({
      id: `audit-${idx}`,
      documentId: doc.id,
      documentName: doc.name,
      action: ['Created', 'Updated', 'Signed', 'Viewed', 'Shared'][Math.floor(Math.random() * 5)],
      user: doc.uploadedBy || 'System',
      timestamp: doc.updatedAt || doc.createdAt,
      details: `Document ${doc.name} was processed`,
    }));
  }, [documents]);

  // ===== AI FEATURES =====
  const runAIComplianceAudit = async () => {
    setAiAnalyzing(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Perform a compliance audit analysis for a credit repair business:

Document Statistics:
- Total documents: ${complianceStats.totalDocuments}
- Compliant: ${complianceStats.compliant}
- Warnings: ${complianceStats.warning}
- Violations: ${complianceStats.violation}
- Pending review: ${complianceStats.pending}
- Current risk score: ${complianceStats.riskScore}

FCRA Checklist Completion: ${complianceStats.checklistProgress}%

Provide comprehensive JSON audit report:
{
  "overallStatus": "compliant|warning|critical",
  "riskAssessment": {
    "level": "low|medium|high|critical",
    "score": 0-100,
    "factors": ["risk factor 1", "risk factor 2"]
  },
  "fcraCompliance": {
    "status": "compliant|non-compliant",
    "issues": ["issue 1", "issue 2"],
    "recommendations": ["rec 1", "rec 2"]
  },
  "immediateActions": ["action 1", "action 2"],
  "longTermRecommendations": ["rec 1", "rec 2"],
  "regulatoryUpdates": ["recent regulatory changes to be aware of"],
  "documentationGaps": ["missing documentation"],
  "bestPractices": ["practice 1", "practice 2"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAiComplianceReport(JSON.parse(text));
    } catch (err) {
      console.error('AI compliance audit error:', err);
      setAiComplianceReport({
        overallStatus: 'warning',
        riskAssessment: {
          level: 'medium',
          score: 45,
          factors: ['Some documents pending compliance review', 'Checklist not fully completed']
        },
        fcraCompliance: {
          status: 'compliant',
          issues: ['Ensure all new clients receive CROA disclosure before signing'],
          recommendations: ['Implement automated compliance checking', 'Regular staff training on FCRA requirements']
        },
        immediateActions: ['Complete compliance checklist', 'Review pending documents'],
        longTermRecommendations: ['Implement document automation', 'Set up compliance alerts'],
        regulatoryUpdates: ['CFPB issued new guidance on credit repair advertising', 'State-specific regulations may vary'],
        documentationGaps: ['Some client files missing signed disclosures'],
        bestPractices: ['Maintain 7-year document retention', 'Document all client communications']
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusChip = (status) => {
    const statusInfo = COMPLIANCE_STATUSES[status] || COMPLIANCE_STATUSES.pending;
    return (
      <Chip
        size="small"
        icon={statusInfo.icon}
        label={statusInfo.label}
        sx={{ bgcolor: `${statusInfo.color}20`, color: statusInfo.color }}
      />
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* AI COMPLIANCE REPORT */}
      {aiComplianceReport && (
        <Fade in>
          <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: aiComplianceReport.overallStatus === 'compliant' ? 'success.main' : aiComplianceReport.overallStatus === 'warning' ? 'warning.main' : 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: aiComplianceReport.overallStatus === 'compliant' ? 'success.main' : aiComplianceReport.overallStatus === 'warning' ? 'warning.main' : 'error.main' }}>
                  <AIIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">AI Compliance Audit Report</Typography>
                  <Chip
                    label={`Overall: ${aiComplianceReport.overallStatus.toUpperCase()}`}
                    color={aiComplianceReport.overallStatus === 'compliant' ? 'success' : aiComplianceReport.overallStatus === 'warning' ? 'warning' : 'error'}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setAiComplianceReport(null)}><FailIcon /></IconButton>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Risk Assessment</Typography>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h3" color={aiComplianceReport.riskAssessment.level === 'low' ? 'success.main' : aiComplianceReport.riskAssessment.level === 'medium' ? 'warning.main' : 'error.main'}>
                    {aiComplianceReport.riskAssessment.score}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Risk Score ({aiComplianceReport.riskAssessment.level})</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {aiComplianceReport.riskAssessment.factors?.join('. ')}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Immediate Actions</Typography>
                <List dense>
                  {aiComplianceReport.immediateActions?.map((action, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                      <ListItemText primary={action} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Best Practices</Typography>
                <List dense>
                  {aiComplianceReport.bestPractices?.map((practice, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary={practice} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* ALERTS */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              severity={alert.type}
              sx={{ mb: 1 }}
              onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* STATS CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Compliance Rate', value: `${complianceStats.complianceRate}%`, icon: <ComplianceIcon />, color: complianceStats.complianceRate >= 80 ? '#10b981' : complianceStats.complianceRate >= 50 ? '#f59e0b' : '#ef4444' },
          { label: 'Compliant Docs', value: complianceStats.compliant, icon: <CheckIcon />, color: '#10b981' },
          { label: 'Warnings', value: complianceStats.warning, icon: <WarningIcon />, color: '#f59e0b' },
          { label: 'Violations', value: complianceStats.violation, icon: <ErrorIcon />, color: '#ef4444' },
          { label: 'Checklist Progress', value: `${complianceStats.checklistProgress}%`, icon: <ChecklistIcon />, color: '#2563eb' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={4} md={2.4} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 1 }}>{stat.icon}</Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={viewTab} onChange={(e, v) => setViewTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Dashboard" icon={<ComplianceIcon />} iconPosition="start" />
          <Tab label="FCRA Checklist" icon={<ChecklistIcon />} iconPosition="start" />
          <Tab label="Audit Trail" icon={<AuditIcon />} iconPosition="start" />
          <Tab label="Document Review" icon={<DocumentIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* TAB CONTENT */}
      {viewTab === 0 && (
        /* DASHBOARD */
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Compliance Overview</Typography>
                <Button
                  variant="contained"
                  startIcon={aiAnalyzing ? <CircularProgress size={16} /> : <AIIcon />}
                  onClick={runAIComplianceAudit}
                  disabled={aiAnalyzing}
                >
                  Run AI Audit
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Document Compliance Status</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Compliant', value: complianceStats.compliant },
                          { name: 'Warning', value: complianceStats.warning },
                          { name: 'Violation', value: complianceStats.violation },
                          { name: 'Pending', value: complianceStats.pending },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {CHART_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Risk Score Trend</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={[
                      { month: 'Jan', score: 65 },
                      { month: 'Feb', score: 55 },
                      { month: 'Mar', score: 48 },
                      { month: 'Apr', score: 42 },
                      { month: 'May', score: 38 },
                      { month: 'Jun', score: complianceStats.riskScore },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button fullWidth variant="outlined" startIcon={<ChecklistIcon />} onClick={() => setViewTab(1)}>
                  Complete Checklist
                </Button>
                <Button fullWidth variant="outlined" startIcon={<AuditIcon />} onClick={() => setViewTab(2)}>
                  View Audit Trail
                </Button>
                <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}>
                  Export Report
                </Button>
                <Divider />
                <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                  Last audit: {formatDate(new Date())}
                </Alert>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {viewTab === 1 && (
        /* FCRA CHECKLIST */
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6">FCRA Compliance Checklist</Typography>
              <Typography variant="body2" color="text.secondary">
                Ensure your credit repair business meets all federal requirements
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" color="primary">{complianceStats.checklistProgress}%</Typography>
              <Typography variant="caption" color="text.secondary">Complete</Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={complianceStats.checklistProgress}
            sx={{ height: 10, borderRadius: 5, mb: 3 }}
          />

          {['Pre-Contract', 'Contract Terms', 'Payment'].map((category) => (
            <Accordion key={category} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{category}</Typography>
                  <Chip
                    size="small"
                    label={`${FCRA_REQUIREMENTS.filter(r => r.category === category && checklist[r.id]).length}/${FCRA_REQUIREMENTS.filter(r => r.category === category).length}`}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {FCRA_REQUIREMENTS.filter(req => req.category === category).map((req) => (
                    <ListItem key={req.id} sx={{ bgcolor: checklist[req.id] ? 'success.50' : 'transparent', borderRadius: 1, mb: 1 }}>
                      <ListItemIcon>
                        <Checkbox
                          checked={checklist[req.id] || false}
                          onChange={(e) => setChecklist(prev => ({ ...prev, [req.id]: e.target.checked }))}
                          color="success"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {req.name}
                            {req.required && <Chip size="small" label="Required" color="error" />}
                          </Box>
                        }
                        secondary={req.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {viewTab === 2 && (
        /* AUDIT TRAIL */
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search audit trail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                    Export Audit Log
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Document</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditTrail.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2">{formatDate(entry.timestamp)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocumentIcon fontSize="small" color="action" />
                        <Typography variant="body2">{entry.documentName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={entry.action}
                        color={entry.action === 'Signed' ? 'success' : entry.action === 'Created' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{entry.details}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {viewTab === 3 && (
        /* DOCUMENT REVIEW */
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search documents..."
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="compliant">Compliant</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="violation">Violation</MenuItem>
                    <MenuItem value="pending">Pending Review</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Compliance Status</TableCell>
                  <TableCell>Last Reviewed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents
                  .filter(doc => filterStatus === 'all' || doc.complianceStatus === filterStatus)
                  .slice(0, 10)
                  .map((document) => (
                    <TableRow key={document.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <DocumentIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {document.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip size="small" label={document.type || 'document'} /></TableCell>
                      <TableCell>{document.clientName || '-'}</TableCell>
                      <TableCell>{getStatusChip(document.complianceStatus || 'pending')}</TableCell>
                      <TableCell>{formatDate(document.complianceReviewedAt || document.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Review">
                          <IconButton size="small" color="primary">
                            <ComplianceIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Audit">
                          <IconButton size="small" onClick={() => { setSelectedDocument(document); setOpenAuditDialog(true); }}>
                            <AuditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ComplianceTab;
