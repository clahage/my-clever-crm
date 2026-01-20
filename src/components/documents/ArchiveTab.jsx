// Path: /src/components/documents/ArchiveTab.jsx
// ============================================================================
// ARCHIVE TAB - Document Retention, History, and Restoration
// ============================================================================
// FEATURES:
// - Archived document management
// - Retention policy tracking
// - Document restoration
// - Search archived documents
// - Permanent deletion controls
// - AI-powered archive organization
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Avatar, LinearProgress, Stack, Fade,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, Switch, FormControlLabel,
} from '@mui/material';
import {
  Archive as ArchiveIcon,
  Unarchive as RestoreIcon,
  Delete as DeleteIcon,
  DeleteForever as PermanentDeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  AutoAwesome as AIIcon,
  History as HistoryIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Policy as PolicyIcon,
  CalendarMonth as CalendarIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const RETENTION_POLICIES = [
  { id: 'standard', name: 'Standard (7 years)', days: 2555, description: 'Default retention for credit repair documents' },
  { id: 'legal', name: 'Legal Hold (Indefinite)', days: -1, description: 'Documents under legal hold - no auto-deletion' },
  { id: 'short', name: 'Short-term (1 year)', days: 365, description: 'Temporary documents and drafts' },
  { id: 'extended', name: 'Extended (10 years)', days: 3650, description: 'Important compliance documents' },
];

// ============================================================================
// ARCHIVE TAB COMPONENT
// ============================================================================

const ArchiveTab = ({ documents, loading, onRefresh, userRole, canDelete }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRetention, setFilterRetention] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState('');

  // ===== FILTER ARCHIVED DOCUMENTS =====
  const archivedDocuments = useMemo(() => {
    return documents.filter(doc => doc.status === 'archived');
  }, [documents]);

  const filteredArchived = useMemo(() => {
    let filtered = [...archivedDocuments];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(search) ||
        doc.clientName?.toLowerCase().includes(search)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (filterRetention !== 'all') {
      filtered = filtered.filter(doc => doc.retentionPolicy === filterRetention);
    }

    return filtered;
  }, [archivedDocuments, searchTerm, filterType, filterRetention]);

  // ===== STATS =====
  const stats = useMemo(() => {
    const now = new Date();
    const expiringDocs = archivedDocuments.filter(doc => {
      if (!doc.retentionExpires) return false;
      const expires = doc.retentionExpires.toDate ? doc.retentionExpires.toDate() : new Date(doc.retentionExpires);
      const daysUntilExpiry = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    // Calculate storage (mock calculation)
    const totalStorage = archivedDocuments.reduce((sum, doc) => sum + (doc.size || 500000), 0);

    return {
      total: archivedDocuments.length,
      expiringCount: expiringDocs.length,
      legalHold: archivedDocuments.filter(d => d.retentionPolicy === 'legal').length,
      storageUsed: (totalStorage / (1024 * 1024)).toFixed(1), // MB
      byType: {
        agreement: archivedDocuments.filter(d => d.type === 'agreement').length,
        legal: archivedDocuments.filter(d => d.type === 'legal').length,
        addendum: archivedDocuments.filter(d => d.type === 'addendum').length,
        client: archivedDocuments.filter(d => d.type === 'client').length,
      },
    };
  }, [archivedDocuments]);

  // ===== AI FEATURES =====
  const analyzeArchiveWithAI = async () => {
    setAiAnalyzing(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Analyze archived documents for a credit repair business:

Stats:
- Total archived: ${stats.total}
- Expiring soon: ${stats.expiringCount}
- Under legal hold: ${stats.legalHold}
- Storage used: ${stats.storageUsed} MB
- By type: ${JSON.stringify(stats.byType)}

Provide JSON with archive management suggestions:
{
  "storageOptimization": ["suggestion1", "suggestion2"],
  "retentionRecommendations": ["rec1", "rec2"],
  "complianceAlerts": ["alert1"],
  "cleanupCandidates": ["documents that could be permanently deleted"],
  "organizationTips": ["tip1", "tip2"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAiSuggestions(JSON.parse(text));
    } catch (err) {
      console.error('AI analysis error:', err);
      setAiSuggestions({
        storageOptimization: ['Remove duplicate archived documents', 'Compress older documents'],
        retentionRecommendations: ['Review documents approaching retention expiry', 'Consider extending retention for compliance documents'],
        complianceAlerts: ['Ensure all credit repair documents meet 7-year FCRA retention requirements'],
        cleanupCandidates: ['Draft documents older than 1 year', 'Cancelled agreements'],
        organizationTips: ['Tag documents by client for easier retrieval', 'Set consistent retention policies']
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // ===== HANDLERS =====
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDocs(filteredArchived.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(d => d.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleRestoreDocuments = async () => {
    const docsToRestore = selectedDocs.length > 0 ? selectedDocs : (selectedDocument ? [selectedDocument.id] : []);

    try {
      for (const docId of docsToRestore) {
        await updateDoc(doc(db, 'documents', docId), {
          status: 'draft',
          restoredAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setSelectedDocs([]);
      setOpenRestoreDialog(false);
      setSelectedDocument(null);
      onRefresh();
    } catch (err) {
      console.error('Error restoring documents:', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (confirmPermanentDelete !== 'DELETE') return;

    const docsToDelete = selectedDocs.length > 0 ? selectedDocs : (selectedDocument ? [selectedDocument.id] : []);

    try {
      for (const docId of docsToDelete) {
        await deleteDoc(doc(db, 'documents', docId));
      }
      setSelectedDocs([]);
      setOpenDeleteDialog(false);
      setSelectedDocument(null);
      setConfirmPermanentDelete('');
      onRefresh();
    } catch (err) {
      console.error('Error permanently deleting documents:', err);
    }
  };

  const handleUpdateRetention = async (docId, policyId) => {
    const policy = RETENTION_POLICIES.find(p => p.id === policyId);
    if (!policy) return;

    try {
      const retentionExpires = policy.days > 0
        ? new Date(Date.now() + policy.days * 24 * 60 * 60 * 1000)
        : null;

      await updateDoc(doc(db, 'documents', docId), {
        retentionPolicy: policyId,
        retentionExpires,
        updatedAt: serverTimestamp(),
      });
      setOpenPolicyDialog(false);
      onRefresh();
    } catch (err) {
      console.error('Error updating retention policy:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRetentionStatus = (doc) => {
    if (doc.retentionPolicy === 'legal') {
      return <Chip size="small" label="Legal Hold" color="warning" />;
    }
    if (!doc.retentionExpires) {
      return <Chip size="small" label="No Policy" color="default" />;
    }

    const expires = doc.retentionExpires.toDate ? doc.retentionExpires.toDate() : new Date(doc.retentionExpires);
    const daysRemaining = Math.ceil((expires - new Date()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return <Chip size="small" label="Expired" color="error" />;
    } else if (daysRemaining <= 30) {
      return <Chip size="small" label={`${daysRemaining}d left`} color="warning" />;
    } else {
      return <Chip size="small" label={`${Math.floor(daysRemaining / 365)}y+`} color="success" />;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* AI SUGGESTIONS */}
      {aiSuggestions && (
        <Fade in>
          <Alert severity="info" sx={{ mb: 3 }} icon={<AIIcon />} onClose={() => setAiSuggestions(null)}>
            <AlertTitle>AI Archive Analysis</AlertTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Storage Optimization</Typography>
                {aiSuggestions.storageOptimization?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Retention Recommendations</Typography>
                {aiSuggestions.retentionRecommendations?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Compliance Alerts</Typography>
                {aiSuggestions.complianceAlerts?.map((item, idx) => (
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
          { label: 'Archived Documents', value: stats.total, icon: <ArchiveIcon />, color: 'primary.main' },
          { label: 'Expiring Soon', value: stats.expiringCount, icon: <ScheduleIcon />, color: stats.expiringCount > 0 ? 'warning.main' : '#10b981' },
          { label: 'Legal Hold', value: stats.legalHold, icon: <PolicyIcon />, color: '#8b5cf6' },
          { label: 'Storage Used', value: `${stats.storageUsed} MB`, icon: <StorageIcon />, color: '#2563eb' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
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

      {/* RETENTION POLICIES INFO */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          <PolicyIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
          Retention Policies
        </Typography>
        <Grid container spacing={2}>
          {RETENTION_POLICIES.map((policy) => (
            <Grid item xs={6} md={3} key={policy.id}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{policy.name}</Typography>
                <Typography variant="caption" color="text.secondary">{policy.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search archived documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={filterType} label="Type" onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="agreement">Agreements</MenuItem>
                <MenuItem value="legal">Legal Forms</MenuItem>
                <MenuItem value="addendum">Addendums</MenuItem>
                <MenuItem value="client">Client Docs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Retention</InputLabel>
              <Select value={filterRetention} label="Retention" onChange={(e) => setFilterRetention(e.target.value)}>
                <MenuItem value="all">All Policies</MenuItem>
                {RETENTION_POLICIES.map(policy => (
                  <MenuItem key={policy.id} value={policy.id}>{policy.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={aiAnalyzing ? <CircularProgress size={16} /> : <AIIcon />}
                onClick={analyzeArchiveWithAI}
                disabled={aiAnalyzing}
              >
                AI Analysis
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* BULK ACTIONS */}
        {selectedDocs.length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedDocs.length} selected
              </Typography>
              <Button size="small" startIcon={<RestoreIcon />} onClick={() => setOpenRestoreDialog(true)}>
                Restore
              </Button>
              {canDelete && (
                <Button size="small" color="error" startIcon={<PermanentDeleteIcon />} onClick={() => setOpenDeleteDialog(true)}>
                  Permanent Delete
                </Button>
              )}
              <Button size="small" onClick={() => setSelectedDocs([])}>Clear</Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* ARCHIVE TABLE */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredArchived.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ArchiveIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Archived Documents</Typography>
          <Typography color="text.secondary">
            Archived documents will appear here for long-term storage
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedDocs.length === Math.min(rowsPerPage, filteredArchived.length)}
                    indeterminate={selectedDocs.length > 0 && selectedDocs.length < Math.min(rowsPerPage, filteredArchived.length)}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Document</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Archived</TableCell>
                <TableCell>Retention</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredArchived
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((document) => (
                  <TableRow key={document.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDocs.includes(document.id)}
                        onChange={() => handleSelectDoc(document.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.400' }}>
                          <DocumentIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {document.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={document.type || 'document'} />
                    </TableCell>
                    <TableCell>{document.clientName || '-'}</TableCell>
                    <TableCell>{formatDate(document.archivedAt || document.updatedAt)}</TableCell>
                    <TableCell>{getRetentionStatus(document)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small"><ViewIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Restore">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => { setSelectedDocument(document); setOpenRestoreDialog(true); }}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Set Retention">
                        <IconButton
                          size="small"
                          onClick={() => { setSelectedDocument(document); setOpenPolicyDialog(true); }}
                        >
                          <PolicyIcon />
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
          <TablePagination
            component="div"
            count={filteredArchived.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>
      )}

      {/* RESTORE DIALOG */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><RestoreIcon /></Avatar>
            <Typography variant="h6">Restore Documents</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            {selectedDocs.length > 0
              ? `${selectedDocs.length} documents will be restored to active status.`
              : `"${selectedDocument?.name}" will be restored to active status.`}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<RestoreIcon />} onClick={handleRestoreDocuments}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      {/* PERMANENT DELETE DIALOG */}
      <Dialog open={openDeleteDialog} onClose={() => { setOpenDeleteDialog(false); setConfirmPermanentDelete(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'error.main' }}><PermanentDeleteIcon /></Avatar>
            <Typography variant="h6">Permanently Delete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>This action cannot be undone!</AlertTitle>
            {selectedDocs.length > 0
              ? `${selectedDocs.length} documents will be permanently deleted.`
              : `"${selectedDocument?.name}" will be permanently deleted.`}
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={confirmPermanentDelete}
            onChange={(e) => setConfirmPermanentDelete(e.target.value)}
            placeholder="DELETE"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteDialog(false); setConfirmPermanentDelete(''); }}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PermanentDeleteIcon />}
            onClick={handlePermanentDelete}
            disabled={confirmPermanentDelete !== 'DELETE'}
          >
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* RETENTION POLICY DIALOG */}
      <Dialog open={openPolicyDialog} onClose={() => setOpenPolicyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><PolicyIcon /></Avatar>
            <Typography variant="h6">Set Retention Policy</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Document: {selectedDocument?.name}
          </Typography>
          <List>
            {RETENTION_POLICIES.map((policy) => (
              <ListItem
                key={policy.id}
                button
                onClick={() => handleUpdateRetention(selectedDocument?.id, policy.id)}
                sx={{
                  border: '1px solid',
                  borderColor: selectedDocument?.retentionPolicy === policy.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <CalendarIcon color={selectedDocument?.retentionPolicy === policy.id ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={policy.name}
                  secondary={policy.description}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPolicyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArchiveTab;
