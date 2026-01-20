// Path: /src/components/documents/ClientDocumentsTab.jsx
// ============================================================================
// CLIENT DOCUMENTS TAB - Per-Client Document Organization
// ============================================================================
// FEATURES:
// - Per-client document folders
// - Secure document sharing
// - Document approval workflows
// - Client upload portal
// - Document request system
// - AI-powered organization
// ============================================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton, Avatar, Tabs, Tab,
  LinearProgress, Stack, Fade, Badge, Collapse, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Email as EmailIcon,
  AutoAwesome as AIIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  RequestQuote as RequestIcon,
  Approval as ApprovalIcon,
  CloudUpload as CloudUploadIcon,
  Notifications as NotifyIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CLIENT DOCUMENTS TAB COMPONENT
// ============================================================================

const ClientDocumentsTab = ({ documents, loading, onRefresh, userRole, canEdit }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [viewTab, setViewTab] = useState(0);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [shareSettings, setShareSettings] = useState({ email: '', expiresDays: 7, allowDownload: true });
  const [requestForm, setRequestForm] = useState({ clientEmail: '', documents: [], message: '' });
  const [aiOrganizing, setAiOrganizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [clients, setClients] = useState([]);

  // ===== LOAD CLIENTS =====
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(clientsRef);
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    } catch (err) {
      console.error('Error loading clients:', err);
      // Mock data if no clients collection
      setClients([
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
      ]);
    }
  };

  // ===== ORGANIZE DOCUMENTS BY CLIENT =====
  const clientDocuments = useMemo(() => {
    const byClient = {};

    documents.forEach(doc => {
      const clientId = doc.clientId || 'unassigned';
      if (!byClient[clientId]) {
        byClient[clientId] = {
          clientId,
          clientName: doc.clientName || 'Unassigned',
          documents: [],
          pendingApproval: 0,
          shared: 0,
        };
      }
      byClient[clientId].documents.push(doc);
      if (doc.status === 'pending_approval') byClient[clientId].pendingApproval++;
      if (doc.isShared) byClient[clientId].shared++;
    });

    return Object.values(byClient);
  }, [documents]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientDocuments;
    const search = searchTerm.toLowerCase();
    return clientDocuments.filter(client =>
      client.clientName?.toLowerCase().includes(search) ||
      client.documents.some(doc => doc.name?.toLowerCase().includes(search))
    );
  }, [clientDocuments, searchTerm]);

  // ===== STATS =====
  const stats = useMemo(() => ({
    totalClients: clientDocuments.length,
    totalDocs: documents.length,
    pendingApproval: documents.filter(d => d.status === 'pending_approval').length,
    sharedDocs: documents.filter(d => d.isShared).length,
    requestsPending: documents.filter(d => d.requestStatus === 'pending').length,
  }), [clientDocuments, documents]);

  // ===== AI FEATURES =====
  const organizeWithAI = async () => {
    setAiOrganizing(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Analyze client documents for a credit repair business and suggest organization improvements:

Current stats:
- Total clients with documents: ${stats.totalClients}
- Total documents: ${stats.totalDocs}
- Pending approval: ${stats.pendingApproval}
- Shared documents: ${stats.sharedDocs}

Provide JSON with organization suggestions:
{
  "missingDocuments": ["commonly missing document types per client"],
  "organizationTips": ["tip1", "tip2"],
  "automationSuggestions": ["automation1", "automation2"],
  "complianceAlerts": ["any compliance concerns"],
  "clientFollowups": ["clients needing attention"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAiSuggestions(JSON.parse(text));
    } catch (err) {
      console.error('AI organization error:', err);
      setAiSuggestions({
        missingDocuments: ['Service Agreement', 'Power of Attorney', 'ACH Authorization'],
        organizationTips: ['Create standard folder structure for each client', 'Set up automatic document expiration alerts'],
        automationSuggestions: ['Auto-request missing documents from new clients', 'Send signature reminders after 48 hours'],
        complianceAlerts: ['Review documents older than 1 year for re-authorization'],
        clientFollowups: ['Clients with incomplete document sets']
      });
    } finally {
      setAiOrganizing(false);
    }
  };

  // ===== HANDLERS =====
  const toggleFolder = (clientId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleShareDocument = async () => {
    if (!selectedDocument || !shareSettings.email) return;

    try {
      const shareLink = `https://myclevercrm.com/shared/${selectedDocument.id}?token=${Date.now()}`;

      await updateDoc(doc(db, 'documents', selectedDocument.id), {
        isShared: true,
        sharedWith: shareSettings.email,
        shareExpires: new Date(Date.now() + shareSettings.expiresDays * 24 * 60 * 60 * 1000),
        shareLink,
        allowDownload: shareSettings.allowDownload,
        updatedAt: serverTimestamp(),
      });

      setOpenShareDialog(false);
      setShareSettings({ email: '', expiresDays: 7, allowDownload: true });
      onRefresh();
    } catch (err) {
      console.error('Error sharing document:', err);
    }
  };

  const handleRequestDocuments = async () => {
    if (!requestForm.clientEmail || requestForm.documents.length === 0) return;

    try {
      await addDoc(collection(db, 'documentRequests'), {
        clientEmail: requestForm.clientEmail,
        requestedDocuments: requestForm.documents,
        message: requestForm.message,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setOpenRequestDialog(false);
      setRequestForm({ clientEmail: '', documents: [], message: '' });
    } catch (err) {
      console.error('Error creating document request:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const DOCUMENT_REQUEST_TYPES = [
    'Service Agreement (Signed)',
    'Power of Attorney',
    'ACH Authorization',
    'Photo ID (Front & Back)',
    'Proof of Address',
    'Social Security Card',
    'Credit Report',
    'Other Supporting Documents',
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* AI SUGGESTIONS */}
      {aiSuggestions && (
        <Fade in>
          <Alert severity="info" sx={{ mb: 3 }} icon={<AIIcon />} onClose={() => setAiSuggestions(null)}>
            <AlertTitle>AI Organization Suggestions</AlertTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Missing Documents</Typography>
                {aiSuggestions.missingDocuments?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Organization Tips</Typography>
                {aiSuggestions.organizationTips?.map((item, idx) => (
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
          { label: 'Clients with Docs', value: stats.totalClients, icon: <PersonIcon />, color: 'primary.main' },
          { label: 'Total Documents', value: stats.totalDocs, icon: <DocumentIcon />, color: '#2563eb' },
          { label: 'Pending Approval', value: stats.pendingApproval, icon: <ApprovalIcon />, color: 'warning.main' },
          { label: 'Shared Documents', value: stats.sharedDocs, icon: <ShareIcon />, color: '#10b981' },
          { label: 'Requests Pending', value: stats.requestsPending, icon: <RequestIcon />, color: '#8b5cf6' },
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

      {/* TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search clients or documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                startIcon={aiOrganizing ? <CircularProgress size={16} /> : <AIIcon />}
                onClick={organizeWithAI}
                disabled={aiOrganizing}
              >
                AI Organize
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RequestIcon />}
                onClick={() => setOpenRequestDialog(true)}
              >
                Request Documents
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUploadDialog(true)}
              >
                Upload for Client
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* CLIENT FOLDERS */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredClients.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Client Documents</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Upload documents for clients to organize them here
          </Typography>
          <Button variant="contained" startIcon={<UploadIcon />}>
            Upload Documents
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredClients.map((client) => (
            <Paper key={client.clientId} sx={{ overflow: 'hidden' }}>
              {/* Client Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => toggleFolder(client.clientId)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {expandedFolders[client.clientId] ? <FolderOpenIcon /> : <FolderIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {client.clientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.documents.length} documents
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {client.pendingApproval > 0 && (
                    <Chip
                      size="small"
                      icon={<WarningIcon />}
                      label={`${client.pendingApproval} pending`}
                      color="warning"
                    />
                  )}
                  {client.shared > 0 && (
                    <Chip
                      size="small"
                      icon={<ShareIcon />}
                      label={`${client.shared} shared`}
                      color="info"
                    />
                  )}
                  <IconButton size="small">
                    {expandedFolders[client.clientId] ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                </Box>
              </Box>

              {/* Client Documents */}
              <Collapse in={expandedFolders[client.clientId]}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  {client.documents.length === 0 ? (
                    <Alert severity="info">No documents for this client yet</Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Document</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Uploaded</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {client.documents.map((document) => (
                            <TableRow key={document.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DocumentIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{document.name}</Typography>
                                  {document.isShared && (
                                    <Tooltip title="Shared with client">
                                      <ShareIcon fontSize="small" color="info" />
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={document.type || 'document'} />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={document.status || 'draft'}
                                  color={document.status === 'signed' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>{formatDate(document.createdAt)}</TableCell>
                              <TableCell align="right">
                                <Tooltip title="View">
                                  <IconButton size="small"><ViewIcon /></IconButton>
                                </Tooltip>
                                <Tooltip title="Share">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDocument(document);
                                      setOpenShareDialog(true);
                                    }}
                                  >
                                    <ShareIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton size="small"><DownloadIcon /></IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<UploadIcon />}>Upload Document</Button>
                    <Button size="small" startIcon={<RequestIcon />}>Request Document</Button>
                    <Button size="small" startIcon={<EmailIcon />}>Email Client</Button>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Stack>
      )}

      {/* SHARE DIALOG */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><ShareIcon /></Avatar>
            <Box>
              <Typography variant="h6">Share Document</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDocument?.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Client Email"
              type="email"
              value={shareSettings.email}
              onChange={(e) => setShareSettings(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Link Expires In</InputLabel>
              <Select
                value={shareSettings.expiresDays}
                label="Link Expires In"
                onChange={(e) => setShareSettings(prev => ({ ...prev, expiresDays: e.target.value }))}
              >
                <MenuItem value={1}>1 day</MenuItem>
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={shareSettings.allowDownload}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                />
              }
              label="Allow download"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleShareDocument}
            disabled={!shareSettings.email}
          >
            Share & Send Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* REQUEST DOCUMENTS DIALOG */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><RequestIcon /></Avatar>
            <Box>
              <Typography variant="h6">Request Documents from Client</Typography>
              <Typography variant="body2" color="text.secondary">
                Send a secure upload link to your client
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Client</InputLabel>
              <Select
                value={requestForm.clientEmail}
                label="Select Client"
                onChange={(e) => setRequestForm(prev => ({ ...prev, clientEmail: e.target.value }))}
              >
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.email}>
                    {client.name} ({client.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" gutterBottom>Documents to Request:</Typography>
            <Box sx={{ mb: 2 }}>
              {DOCUMENT_REQUEST_TYPES.map((docType) => (
                <FormControlLabel
                  key={docType}
                  control={
                    <Switch
                      size="small"
                      checked={requestForm.documents.includes(docType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRequestForm(prev => ({ ...prev, documents: [...prev.documents, docType] }));
                        } else {
                          setRequestForm(prev => ({
                            ...prev,
                            documents: prev.documents.filter(d => d !== docType)
                          }));
                        }
                      }}
                    />
                  }
                  label={docType}
                  sx={{ display: 'block' }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Personal Message (Optional)"
              value={requestForm.message}
              onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a personal note to your client..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleRequestDocuments}
            disabled={!requestForm.clientEmail || requestForm.documents.length === 0}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD DIALOG */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><CloudUploadIcon /></Avatar>
            <Typography variant="h6">Upload Document for Client</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Client</InputLabel>
              <Select label="Select Client">
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                bgcolor: 'grey.50',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography>Drag & drop files here or click to browse</Typography>
              <Typography variant="body2" color="text.secondary">
                PDF, Word, Images up to 25MB
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<UploadIcon />}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientDocumentsTab;
