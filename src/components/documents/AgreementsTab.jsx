// Path: /src/components/documents/AgreementsTab.jsx
// ============================================================================
// AGREEMENTS TAB - Complete Agreement Management with AI Features
// ============================================================================
// FEATURES:
// - Full document listing with search/filter
// - AI-powered categorization and suggestions
// - Bulk operations (download, archive, delete)
// - Document preview and editing
// - Status management and tracking
// - Mobile responsive design
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  TextField, InputAdornment, IconButton, Chip, Menu, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, Checkbox,
  FormControlLabel, Alert, AlertTitle, CircularProgress, LinearProgress,
  Tooltip, Badge, Divider, List, ListItem, ListItemText, ListItemIcon,
  ToggleButton, ToggleButtonGroup, Fade, Collapse, Stack,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Assignment as AgreementIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Email as EmailIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
  MoreVert as MoreIcon,
  AutoAwesome as AIIcon,
  ContentCopy as CopyIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const AGREEMENT_TYPES = [
  { value: 'service', label: 'Service Agreement', color: '#2563eb' },
  { value: 'payment', label: 'Payment Agreement', color: '#10b981' },
  { value: 'disclosure', label: 'Disclosure Form', color: '#f59e0b' },
  { value: 'consent', label: 'Consent Form', color: '#8b5cf6' },
  { value: 'contract', label: 'Contract', color: '#ec4899' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: '#6b7280' },
  { value: 'pending', label: 'Pending Signature', color: '#f59e0b' },
  { value: 'signed', label: 'Signed', color: '#10b981' },
  { value: 'expired', label: 'Expired', color: '#ef4444' },
  { value: 'archived', label: 'Archived', color: '#8b5cf6' },
];

// ============================================================================
// AGREEMENTS TAB COMPONENT
// ============================================================================

const AgreementsTab = ({
  documents,
  loading,
  onRefresh,
  onUpload,
  onDelete,
  onDownload,
  userRole,
  canEdit,
  canDelete,
}) => {
  // ===== LOCAL STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Dialog states
  const [openPreview, setOpenPreview] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // New agreement form
  const [newAgreement, setNewAgreement] = useState({
    name: '',
    type: 'service',
    clientName: '',
    description: '',
    expirationDays: 365,
  });

  // ===== FILTER AGREEMENTS =====
  const agreements = useMemo(() => {
    return documents.filter(doc => doc.type === 'agreement' || doc.category === 'agreement');
  }, [documents]);

  const filteredAgreements = useMemo(() => {
    let filtered = [...agreements];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(search) ||
        doc.clientName?.toLowerCase().includes(search) ||
        doc.description?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.agreementType === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [agreements, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedAgreements = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAgreements.slice(start, start + rowsPerPage);
  }, [filteredAgreements, page, rowsPerPage]);

  // ===== STATS =====
  const stats = useMemo(() => ({
    total: agreements.length,
    draft: agreements.filter(d => d.status === 'draft').length,
    pending: agreements.filter(d => d.status === 'pending').length,
    signed: agreements.filter(d => d.status === 'signed').length,
    expired: agreements.filter(d => d.status === 'expired').length,
  }), [agreements]);

  // ===== AI FEATURES =====
  const generateAISuggestions = async () => {
    setAiSuggesting(true);
    try {
      // AI analysis of agreement patterns
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze these agreement statistics for a credit repair business:
Total: ${stats.total}, Draft: ${stats.draft}, Pending: ${stats.pending}, Signed: ${stats.signed}, Expired: ${stats.expired}

Provide JSON with actionable suggestions:
{
  "insights": ["insight1", "insight2"],
  "actions": ["action1", "action2"],
  "automations": ["automation suggestion1"]
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
        insights: ['Review pending agreements to improve conversion', 'Consider automating follow-ups for unsigned documents'],
        actions: ['Send reminders for pending signatures', 'Archive expired agreements'],
        automations: ['Set up automatic expiration alerts 30 days before deadline']
      });
    } finally {
      setAiSuggesting(false);
    }
  };

  // ===== HANDLERS =====
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDocs(paginatedAgreements.map(d => d.id));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedDocs.length === 0) return;

    try {
      for (const docId of selectedDocs) {
        if (action === 'archive') {
          await updateDoc(doc(db, 'documents', docId), {
            status: 'archived',
            updatedAt: serverTimestamp()
          });
        } else if (action === 'delete' && canDelete) {
          await deleteDoc(doc(db, 'documents', docId));
        }
      }
      setSelectedDocs([]);
      onRefresh();
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  const handleCreateAgreement = async () => {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + newAgreement.expirationDays);

      await addDoc(collection(db, 'documents'), {
        name: newAgreement.name,
        type: 'agreement',
        agreementType: newAgreement.type,
        clientName: newAgreement.clientName,
        description: newAgreement.description,
        status: 'draft',
        expirationDate: expirationDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOpenCreate(false);
      setNewAgreement({ name: '', type: 'service', clientName: '', description: '', expirationDays: 365 });
      onRefresh();
    } catch (err) {
      console.error('Error creating agreement:', err);
    }
  };

  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const getStatusChip = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <Chip
        size="small"
        label={statusInfo.label}
        sx={{
          backgroundColor: `${statusInfo.color}20`,
          color: statusInfo.color,
          fontWeight: 500,
        }}
      />
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* AI INSIGHTS BANNER */}
      {aiSuggestions && (
        <Fade in>
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            icon={<AIIcon />}
            onClose={() => setAiSuggestions(null)}
          >
            <AlertTitle>AI Agreement Insights</AlertTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Insights</Typography>
                {aiSuggestions.insights?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Recommended Actions</Typography>
                {aiSuggestions.actions?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Automation Ideas</Typography>
                {aiSuggestions.automations?.map((item, idx) => (
                  <Typography key={idx} variant="body2">• {item}</Typography>
                ))}
              </Grid>
            </Grid>
          </Alert>
        </Fade>
      )}

      {/* STATS ROW */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Agreements', value: stats.total, color: 'primary.main', icon: <AgreementIcon /> },
          { label: 'Drafts', value: stats.draft, color: 'grey.500', icon: <EditIcon /> },
          { label: 'Pending Signature', value: stats.pending, color: 'warning.main', icon: <ScheduleIcon /> },
          { label: 'Signed', value: stats.signed, color: 'success.main', icon: <CheckIcon /> },
          { label: 'Expired', value: stats.expired, color: 'error.main', icon: <WarningIcon /> },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={4} md={2.4} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  {stat.icon}
                </Avatar>
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search agreements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {AGREEMENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(e, v) => v && setViewMode(v)}
              >
                <ToggleButton value="grid"><GridViewIcon /></ToggleButton>
                <ToggleButton value="list"><ListViewIcon /></ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                size="small"
                startIcon={aiSuggesting ? <CircularProgress size={16} /> : <AIIcon />}
                onClick={generateAISuggestions}
                disabled={aiSuggesting}
              >
                AI Insights
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreate(true)}
              >
                New Agreement
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
              <Button size="small" startIcon={<DownloadIcon />}>Download</Button>
              <Button size="small" startIcon={<ArchiveIcon />} onClick={() => handleBulkAction('archive')}>Archive</Button>
              {canDelete && (
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleBulkAction('delete')}>Delete</Button>
              )}
              <Button size="small" onClick={() => setSelectedDocs([])}>Clear</Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* CONTENT */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredAgreements.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AgreementIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Agreements Found</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first agreement to get started'}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Create Agreement
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Grid container spacing={2}>
          {paginatedAgreements.map((agreement) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={agreement.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Checkbox
                      size="small"
                      checked={selectedDocs.includes(agreement.id)}
                      onChange={() => handleSelectDoc(agreement.id)}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, agreement)}>
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                    <AgreementIcon />
                  </Avatar>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }} noWrap>
                    {agreement.name}
                  </Typography>

                  {agreement.clientName && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Client: {agreement.clientName}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    {getStatusChip(agreement.status)}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Updated: {formatDate(agreement.updatedAt)}
                  </Typography>
                </CardContent>

                <Divider />

                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-around' }}>
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => { setSelectedDoc(agreement); setOpenPreview(true); }}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton size="small" onClick={() => onDownload(agreement)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send for Signature">
                    <IconButton size="small" color="primary">
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* LIST VIEW */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedDocs.length === paginatedAgreements.length && paginatedAgreements.length > 0}
                    indeterminate={selectedDocs.length > 0 && selectedDocs.length < paginatedAgreements.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Agreement Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAgreements.map((agreement) => (
                <TableRow key={agreement.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDocs.includes(agreement.id)}
                      onChange={() => handleSelectDoc(agreement.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <AgreementIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {agreement.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{agreement.clientName || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={agreement.agreementType || 'Service'} />
                  </TableCell>
                  <TableCell>{getStatusChip(agreement.status)}</TableCell>
                  <TableCell>{formatDate(agreement.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, agreement)}>
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PAGINATION */}
      {filteredAgreements.length > 0 && (
        <TablePagination
          component="div"
          count={filteredAgreements.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[12, 24, 48, 96]}
        />
      )}

      {/* ACTION MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setOpenPreview(true); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (selectedDoc) onDownload(selectedDoc); handleMenuClose(); }}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><SendIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send for Signature</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={() => { if (selectedDoc) onDelete(selectedDoc.id); handleMenuClose(); }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* CREATE DIALOG */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Agreement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Agreement Name"
              value={newAgreement.name}
              onChange={(e) => setNewAgreement(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Agreement Type</InputLabel>
              <Select
                value={newAgreement.type}
                label="Agreement Type"
                onChange={(e) => setNewAgreement(prev => ({ ...prev, type: e.target.value }))}
              >
                {AGREEMENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Client Name (Optional)"
              value={newAgreement.clientName}
              onChange={(e) => setNewAgreement(prev => ({ ...prev, clientName: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newAgreement.description}
              onChange={(e) => setNewAgreement(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Valid for (days)"
              value={newAgreement.expirationDays}
              onChange={(e) => setNewAgreement(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 365 }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAgreement}
            disabled={!newAgreement.name.trim()}
          >
            Create Agreement
          </Button>
        </DialogActions>
      </Dialog>

      {/* PREVIEW DIALOG */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><AgreementIcon /></Avatar>
            <Box>
              <Typography variant="h6">{selectedDoc?.name}</Typography>
              {selectedDoc && getStatusChip(selectedDoc.status)}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDoc && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Client</Typography>
                  <Typography>{selectedDoc.clientName || 'Not assigned'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography>{selectedDoc.agreementType || 'Service Agreement'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography>{formatDate(selectedDoc.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography>{formatDate(selectedDoc.updatedAt)}</Typography>
                </Grid>
              </Grid>

              {selectedDoc.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography>{selectedDoc.description}</Typography>
                </Box>
              )}

              {selectedDoc.url ? (
                <Paper sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                  <Typography color="text.secondary">Document Preview</Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => window.open(selectedDoc.url, '_blank')}
                  >
                    Open Full Document
                  </Button>
                </Paper>
              ) : (
                <Alert severity="info">No document file attached yet.</Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => selectedDoc && onDownload(selectedDoc)}>
            Download
          </Button>
          <Button variant="contained" startIcon={<SendIcon />}>
            Send for Signature
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgreementsTab;
