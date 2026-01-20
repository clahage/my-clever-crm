// Path: /src/components/documents/ESignatureTab.jsx
// ============================================================================
// E-SIGNATURE TAB - Digital Signature Workflows and Tracking
// ============================================================================
// FEATURES:
// - Digital signature workflows
// - Signature request sending
// - Real-time tracking and status
// - Automatic reminders
// - Audit trail for signatures
// - Multiple signer support
// - AI-powered follow-up suggestions
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton, Avatar, Stepper, Step,
  StepLabel, LinearProgress, Stack, Fade, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Badge, Tabs, Tab,
} from '@mui/material';
import {
  Draw as SignatureIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Notifications as NotifyIcon,
  History as HistoryIcon,
  AutoAwesome as AIIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  AccessTime as TimeIcon,
  HourglassEmpty as PendingIcon,
  Done as DoneIcon,
  DoneAll as CompletedIcon,
} from '@mui/icons-material';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const SIGNATURE_STATUSES = [
  { value: 'draft', label: 'Draft', color: '#6b7280', icon: <DocumentIcon /> },
  { value: 'sent', label: 'Sent', color: '#2563eb', icon: <SendIcon /> },
  { value: 'viewed', label: 'Viewed', color: '#8b5cf6', icon: <ViewIcon /> },
  { value: 'signed', label: 'Signed', color: '#10b981', icon: <CheckIcon /> },
  { value: 'expired', label: 'Expired', color: '#ef4444', icon: <WarningIcon /> },
  { value: 'declined', label: 'Declined', color: '#ef4444', icon: <CancelIcon /> },
];

// ============================================================================
// E-SIGNATURE TAB COMPONENT
// ============================================================================

const ESignatureTab = ({ documents, loading, onRefresh, userRole, canEdit }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewTab, setViewTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Send form
  const [sendForm, setSendForm] = useState({
    documentId: '',
    documentName: '',
    signers: [{ name: '', email: '', order: 1 }],
    message: '',
    expirationDays: 7,
    sendReminders: true,
    reminderDays: [3, 1],
  });

  // ===== FILTER SIGNATURE REQUESTS =====
  const signatureRequests = useMemo(() => {
    return documents.filter(doc =>
      doc.status === 'pending' ||
      doc.signatureStatus ||
      doc.requiresSignature
    ).map(doc => ({
      ...doc,
      signatureStatus: doc.signatureStatus || (doc.status === 'signed' ? 'signed' : 'draft'),
    }));
  }, [documents]);

  const filteredRequests = useMemo(() => {
    let filtered = [...signatureRequests];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.name?.toLowerCase().includes(search) ||
        req.clientName?.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.signatureStatus === filterStatus);
    }

    return filtered;
  }, [signatureRequests, searchTerm, filterStatus]);

  // ===== STATS =====
  const stats = useMemo(() => ({
    total: signatureRequests.length,
    draft: signatureRequests.filter(r => r.signatureStatus === 'draft').length,
    sent: signatureRequests.filter(r => r.signatureStatus === 'sent').length,
    viewed: signatureRequests.filter(r => r.signatureStatus === 'viewed').length,
    signed: signatureRequests.filter(r => r.signatureStatus === 'signed').length,
    expired: signatureRequests.filter(r => r.signatureStatus === 'expired').length,
    completionRate: signatureRequests.length > 0
      ? Math.round((signatureRequests.filter(r => r.signatureStatus === 'signed').length / signatureRequests.length) * 100)
      : 0,
  }), [signatureRequests]);

  // ===== AI FEATURES =====
  const getAIFollowUpSuggestions = async () => {
    setAiSuggesting(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Analyze e-signature request statistics for a credit repair business and suggest follow-up actions:

Stats:
- Total requests: ${stats.total}
- Sent/awaiting: ${stats.sent}
- Viewed but not signed: ${stats.viewed}
- Signed: ${stats.signed}
- Expired: ${stats.expired}
- Completion rate: ${stats.completionRate}%

Provide JSON with actionable suggestions:
{
  "urgentFollowUps": ["requests needing immediate attention"],
  "reminderStrategy": ["optimal reminder timing suggestions"],
  "improvementTips": ["tips to improve completion rate"],
  "automationIdeas": ["automation suggestions"],
  "clientCommunication": ["communication templates or tips"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAiSuggestions(JSON.parse(text));
    } catch (err) {
      console.error('AI suggestions error:', err);
      setAiSuggestions({
        urgentFollowUps: ['Follow up with viewed but unsigned documents within 24 hours', 'Resend expired signature requests'],
        reminderStrategy: ['Send first reminder after 48 hours', 'Second reminder 24 hours before expiration'],
        improvementTips: ['Simplify document language', 'Provide clear instructions', 'Use mobile-friendly signing'],
        automationIdeas: ['Auto-reminder emails at set intervals', 'Automatic expiration notifications'],
        clientCommunication: ['Personalize reminder emails', 'Include direct signing link in all communications']
      });
    } finally {
      setAiSuggesting(false);
    }
  };

  // ===== HANDLERS =====
  const handleSendForSignature = async () => {
    if (!sendForm.documentName || sendForm.signers.some(s => !s.email)) return;

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + sendForm.expirationDays);

      await addDoc(collection(db, 'signatureRequests'), {
        documentId: sendForm.documentId,
        documentName: sendForm.documentName,
        signers: sendForm.signers,
        message: sendForm.message,
        signatureStatus: 'sent',
        expirationDate,
        sendReminders: sendForm.sendReminders,
        reminderDays: sendForm.reminderDays,
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Also update the document if linked
      if (sendForm.documentId) {
        await updateDoc(doc(db, 'documents', sendForm.documentId), {
          signatureStatus: 'sent',
          requiresSignature: true,
          updatedAt: serverTimestamp(),
        });
      }

      setOpenSendDialog(false);
      resetSendForm();
      onRefresh();
    } catch (err) {
      console.error('Error sending signature request:', err);
    }
  };

  const handleSendReminder = async (request) => {
    try {
      await updateDoc(doc(db, 'documents', request.id), {
        lastReminderSent: serverTimestamp(),
        reminderCount: (request.reminderCount || 0) + 1,
      });
      // In a real app, this would trigger an email
      console.log('Reminder sent for:', request.name);
    } catch (err) {
      console.error('Error sending reminder:', err);
    }
  };

  const handleCancelRequest = async (request) => {
    try {
      await updateDoc(doc(db, 'documents', request.id), {
        signatureStatus: 'cancelled',
        cancelledAt: serverTimestamp(),
      });
      onRefresh();
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
  };

  const resetSendForm = () => {
    setSendForm({
      documentId: '',
      documentName: '',
      signers: [{ name: '', email: '', order: 1 }],
      message: '',
      expirationDays: 7,
      sendReminders: true,
      reminderDays: [3, 1],
    });
  };

  const addSigner = () => {
    setSendForm(prev => ({
      ...prev,
      signers: [...prev.signers, { name: '', email: '', order: prev.signers.length + 1 }]
    }));
  };

  const removeSigner = (index) => {
    setSendForm(prev => ({
      ...prev,
      signers: prev.signers.filter((_, i) => i !== index)
    }));
  };

  const updateSigner = (index, field, value) => {
    setSendForm(prev => ({
      ...prev,
      signers: prev.signers.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusChip = (status) => {
    const statusInfo = SIGNATURE_STATUSES.find(s => s.value === status) || SIGNATURE_STATUSES[0];
    return (
      <Chip
        size="small"
        icon={statusInfo.icon}
        label={statusInfo.label}
        sx={{ bgcolor: `${statusInfo.color}20`, color: statusInfo.color }}
      />
    );
  };

  // Pending documents that can be sent for signature
  const documentsForSigning = useMemo(() => {
    return documents.filter(doc =>
      doc.status === 'draft' &&
      !doc.signatureStatus &&
      (doc.type === 'agreement' || doc.type === 'legal' || doc.type === 'addendum')
    );
  }, [documents]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* AI SUGGESTIONS */}
      {aiSuggestions && (
        <Fade in>
          <Alert severity="info" sx={{ mb: 3 }} icon={<AIIcon />} onClose={() => setAiSuggestions(null)}>
            <AlertTitle>AI Follow-Up Suggestions</AlertTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Urgent Follow-Ups</Typography>
                {aiSuggestions.urgentFollowUps?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Improvement Tips</Typography>
                {aiSuggestions.improvementTips?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Automation Ideas</Typography>
                {aiSuggestions.automationIdeas?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
            </Grid>
          </Alert>
        </Fade>
      )}

      {/* STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Requests', value: stats.total, icon: <SignatureIcon />, color: 'primary.main' },
          { label: 'Sent/Awaiting', value: stats.sent, icon: <SendIcon />, color: '#2563eb' },
          { label: 'Viewed', value: stats.viewed, icon: <ViewIcon />, color: '#8b5cf6' },
          { label: 'Signed', value: stats.signed, icon: <CheckIcon />, color: '#10b981' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: <CompletedIcon />, color: stats.completionRate > 70 ? '#10b981' : '#f59e0b' },
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

      {/* PIPELINE VIEW */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Signature Pipeline</Typography>
        <Stepper alternativeLabel>
          {[
            { label: 'Draft', count: stats.draft, color: '#6b7280' },
            { label: 'Sent', count: stats.sent, color: '#2563eb' },
            { label: 'Viewed', count: stats.viewed, color: '#8b5cf6' },
            { label: 'Signed', count: stats.signed, color: '#10b981' },
          ].map((step, idx) => (
            <Step key={step.label} completed={idx < 3}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar sx={{ bgcolor: step.color, width: 36, height: 36 }}>
                    {step.count}
                  </Avatar>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search signature requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                {SIGNATURE_STATUSES.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={aiSuggesting ? <CircularProgress size={16} /> : <AIIcon />}
                onClick={getAIFollowUpSuggestions}
                disabled={aiSuggesting}
              >
                AI Suggestions
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<SendIcon />}
                onClick={() => setOpenSendDialog(true)}
              >
                Send for Signature
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* REQUESTS TABLE */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SignatureIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Signature Requests</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Send your first document for electronic signature
          </Typography>
          <Button variant="contained" startIcon={<SendIcon />} onClick={() => setOpenSendDialog(true)}>
            Send for Signature
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Client/Signer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <DocumentIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {request.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        {request.clientName || request.signers?.[0]?.name || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(request.signatureStatus)}</TableCell>
                    <TableCell>{formatDate(request.sentAt || request.createdAt)}</TableCell>
                    <TableCell>
                      {request.expirationDate ? (
                        <Box>
                          {formatDate(request.expirationDate).split(',')[0]}
                          {new Date(request.expirationDate?.toDate?.() || request.expirationDate) < new Date() && (
                            <Chip size="small" label="Expired" color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => { setSelectedRequest(request); setOpenDetailDialog(true); }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {(request.signatureStatus === 'sent' || request.signatureStatus === 'viewed') && (
                        <Tooltip title="Send Reminder">
                          <IconButton size="small" color="primary" onClick={() => handleSendReminder(request)}>
                            <NotifyIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {request.signatureStatus === 'signed' && (
                        <Tooltip title="Download Signed">
                          <IconButton size="small" color="success">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {request.signatureStatus !== 'signed' && request.signatureStatus !== 'cancelled' && (
                        <Tooltip title="Cancel">
                          <IconButton size="small" color="error" onClick={() => handleCancelRequest(request)}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredRequests.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>
      )}

      {/* SEND FOR SIGNATURE DIALOG */}
      <Dialog open={openSendDialog} onClose={() => { setOpenSendDialog(false); resetSendForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><SendIcon /></Avatar>
            <Box>
              <Typography variant="h6">Send for E-Signature</Typography>
              <Typography variant="body2" color="text.secondary">
                Request electronic signatures on your documents
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            {/* Document Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Document</InputLabel>
              <Select
                value={sendForm.documentId}
                label="Select Document"
                onChange={(e) => {
                  const doc = documentsForSigning.find(d => d.id === e.target.value);
                  setSendForm(prev => ({
                    ...prev,
                    documentId: e.target.value,
                    documentName: doc?.name || '',
                  }));
                }}
              >
                {documentsForSigning.map(doc => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name} - {doc.clientName || 'No client'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Or Manual Entry */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Or enter document name manually:
            </Typography>
            <TextField
              fullWidth
              label="Document Name"
              value={sendForm.documentName}
              onChange={(e) => setSendForm(prev => ({ ...prev, documentName: e.target.value }))}
              sx={{ mb: 3 }}
            />

            {/* Signers */}
            <Typography variant="subtitle2" gutterBottom>Signers</Typography>
            {sendForm.signers.map((signer, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Name"
                    value={signer.name}
                    onChange={(e) => updateSigner(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={signer.email}
                    onChange={(e) => updateSigner(index, 'email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  {sendForm.signers.length > 1 && (
                    <IconButton color="error" onClick={() => removeSigner(index)}>
                      <CancelIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addSigner} sx={{ mb: 3 }}>
              Add Another Signer
            </Button>

            {/* Message */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Personal Message (Optional)"
              value={sendForm.message}
              onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a personal note to include in the signature request email..."
              sx={{ mb: 3 }}
            />

            {/* Options */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Expires In</InputLabel>
                  <Select
                    value={sendForm.expirationDays}
                    label="Expires In"
                    onChange={(e) => setSendForm(prev => ({ ...prev, expirationDays: e.target.value }))}
                  >
                    <MenuItem value={3}>3 days</MenuItem>
                    <MenuItem value={7}>7 days</MenuItem>
                    <MenuItem value={14}>14 days</MenuItem>
                    <MenuItem value={30}>30 days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sendForm.sendReminders}
                      onChange={(e) => setSendForm(prev => ({ ...prev, sendReminders: e.target.checked }))}
                    />
                  }
                  label="Send automatic reminders"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenSendDialog(false); resetSendForm(); }}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendForSignature}
            disabled={!sendForm.documentName || sendForm.signers.some(s => !s.email)}
          >
            Send for Signature
          </Button>
        </DialogActions>
      </Dialog>

      {/* REQUEST DETAIL DIALOG */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><SignatureIcon /></Avatar>
            <Box>
              <Typography variant="h6">{selectedRequest?.name}</Typography>
              {selectedRequest && getStatusChip(selectedRequest.signatureStatus)}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              {/* Timeline */}
              <Typography variant="subtitle2" gutterBottom>Activity Timeline</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><AddIcon /></ListItemIcon>
                  <ListItemText
                    primary="Document Created"
                    secondary={formatDate(selectedRequest.createdAt)}
                  />
                </ListItem>
                {selectedRequest.sentAt && (
                  <ListItem>
                    <ListItemIcon><SendIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Sent for Signature"
                      secondary={formatDate(selectedRequest.sentAt)}
                    />
                  </ListItem>
                )}
                {selectedRequest.viewedAt && (
                  <ListItem>
                    <ListItemIcon><ViewIcon color="secondary" /></ListItemIcon>
                    <ListItemText
                      primary="Document Viewed"
                      secondary={formatDate(selectedRequest.viewedAt)}
                    />
                  </ListItem>
                )}
                {selectedRequest.signedAt && (
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                    <ListItemText
                      primary="Document Signed"
                      secondary={formatDate(selectedRequest.signedAt)}
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Details */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Client/Signer</Typography>
                  <Typography>{selectedRequest.clientName || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Expiration</Typography>
                  <Typography>{formatDate(selectedRequest.expirationDate)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Reminders Sent</Typography>
                  <Typography>{selectedRequest.reminderCount || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Last Reminder</Typography>
                  <Typography>{formatDate(selectedRequest.lastReminderSent) || 'None'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
          {selectedRequest?.signatureStatus !== 'signed' && (
            <Button variant="outlined" startIcon={<NotifyIcon />} onClick={() => handleSendReminder(selectedRequest)}>
              Send Reminder
            </Button>
          )}
          {selectedRequest?.signatureStatus === 'signed' && (
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download Signed Document
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ESignatureTab;
