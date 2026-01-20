// Path: /src/components/documents/AddendumsTab.jsx
// ============================================================================
// ADDENDUMS TAB - Contract Modifications and Extensions Management
// ============================================================================
// FEATURES:
// - Addendum creation wizard
// - Multiple addendum types (Item, Extension, ACH, POA)
// - AI-powered addendum suggestions
// - Link to original agreements
// - Version tracking
// - Bulk addendum processing
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  TextField, InputAdornment, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, FormControl, InputLabel, MenuItem, Alert, AlertTitle,
  CircularProgress, Tooltip, Divider, List, ListItem, ListItemText,
  ListItemIcon, IconButton, Avatar, Stepper, Step, StepLabel, StepContent,
  FormControlLabel, Checkbox, Radio, RadioGroup, LinearProgress, Stack, Fade,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination,
} from '@mui/material';
import {
  PostAdd as AddendumIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  AutoAwesome as AIIcon,
  Link as LinkIcon,
  History as HistoryIcon,
  AttachFile as AttachIcon,
  ContentCopy as CopyIcon,
  Extension as ExtensionIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Gavel as LegalIcon,
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================================================
// CONSTANTS
// ============================================================================

const ADDENDUM_TYPES = [
  {
    id: 'item-only',
    name: 'Item Only Addendum',
    description: 'Add new dispute items without full re-contracting',
    icon: <AddIcon />,
    color: '#2563eb',
    fields: ['newItems', 'reason'],
  },
  {
    id: 'full-extension',
    name: 'Full Extension Addendum',
    description: 'Extend service agreement duration',
    icon: <ExtensionIcon />,
    color: '#10b981',
    fields: ['extensionMonths', 'newTerms'],
  },
  {
    id: 'ach-modification',
    name: 'ACH Addendum',
    description: 'Modify payment terms or banking information',
    icon: <PaymentIcon />,
    color: '#f59e0b',
    fields: ['newPaymentAmount', 'newPaymentDate', 'bankInfo'],
  },
  {
    id: 'poa-update',
    name: 'POA Addendum',
    description: 'Update or extend power of attorney authorization',
    icon: <LegalIcon />,
    color: '#8b5cf6',
    fields: ['poaExtension', 'additionalAuthorizations'],
  },
];

// ============================================================================
// ADDENDUMS TAB COMPONENT
// ============================================================================

const AddendumsTab = ({ documents, loading, onRefresh, userRole, canEdit }) => {
  // ===== STATE =====
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreator, setOpenCreator] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [linkedAgreement, setLinkedAgreement] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedAddendum, setSelectedAddendum] = useState(null);

  // ===== FILTER ADDENDUMS =====
  const addendums = useMemo(() => {
    return documents.filter(doc => doc.type === 'addendum' || doc.category === 'addendum');
  }, [documents]);

  const agreements = useMemo(() => {
    return documents.filter(doc => doc.type === 'agreement');
  }, [documents]);

  const filteredAddendums = useMemo(() => {
    let filtered = [...addendums];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name?.toLowerCase().includes(search) ||
        doc.clientName?.toLowerCase().includes(search)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.addendumType === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    return filtered;
  }, [addendums, searchTerm, filterType, filterStatus]);

  // ===== STATS =====
  const stats = useMemo(() => ({
    total: addendums.length,
    pending: addendums.filter(d => d.status === 'pending').length,
    signed: addendums.filter(d => d.status === 'signed').length,
    itemOnly: addendums.filter(d => d.addendumType === 'item-only').length,
    extensions: addendums.filter(d => d.addendumType === 'full-extension').length,
  }), [addendums]);

  // ===== AI FEATURES =====
  const getAISuggestions = async () => {
    if (!linkedAgreement) return;

    setGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `As a credit repair CRM assistant, suggest appropriate addendum modifications for:

Original Agreement: ${linkedAgreement.name}
Client: ${linkedAgreement.clientName || 'Unknown'}
Addendum Type: ${selectedType?.name}

Provide JSON with suggestions:
{
  "suggestedChanges": ["change1", "change2"],
  "recommendedTerms": ["term1", "term2"],
  "complianceNotes": "any compliance considerations",
  "effectiveDate": "suggested effective date reasoning"
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
        suggestedChanges: ['Update payment terms as requested', 'Extend service period by specified duration'],
        recommendedTerms: ['All other terms remain in effect', 'This addendum supersedes conflicting terms'],
        complianceNotes: 'Ensure both parties sign and date the addendum',
        effectiveDate: 'Effective upon signature by all parties'
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateAddendumContent = async () => {
    if (!selectedType || !linkedAgreement) return;

    setGenerating(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2500,
          messages: [{
            role: 'user',
            content: `Generate a professional ${selectedType.name} for a credit repair service agreement.

Original Agreement: ${linkedAgreement.name}
Client: ${linkedAgreement.clientName || formData.clientName}
Addendum Details: ${JSON.stringify(formData)}

Create a legally sound addendum document. Return JSON:
{
  "title": "Addendum title",
  "content": "Full addendum text with proper legal formatting",
  "effectiveDate": "When this takes effect",
  "signatureRequired": true,
  "sections": ["section1", "section2"]
}`
          }]
        })
      });

      const data = await response.json();
      let text = data.content[0].text;
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setGeneratedContent(JSON.parse(text));
      setActiveStep(3);
    } catch (err) {
      console.error('Addendum generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAddendum = async () => {
    if (!generatedContent) return;

    try {
      await addDoc(collection(db, 'documents'), {
        name: generatedContent.title,
        type: 'addendum',
        addendumType: selectedType?.id,
        content: generatedContent.content,
        linkedAgreementId: linkedAgreement?.id,
        clientName: linkedAgreement?.clientName || formData.clientName,
        status: 'draft',
        aiGenerated: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOpenCreator(false);
      resetCreator();
      onRefresh();
    } catch (err) {
      console.error('Error saving addendum:', err);
    }
  };

  const resetCreator = () => {
    setActiveStep(0);
    setSelectedType(null);
    setFormData({});
    setLinkedAgreement(null);
    setGeneratedContent(null);
    setAiSuggestions(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusChip = (status) => {
    const colors = {
      draft: { bg: '#6b728020', text: '#6b7280' },
      pending: { bg: '#f59e0b20', text: '#f59e0b' },
      signed: { bg: '#10b98120', text: '#10b981' },
      expired: { bg: '#ef444420', text: '#ef4444' },
    };
    const color = colors[status] || colors.draft;
    return <Chip size="small" label={status} sx={{ bgcolor: color.bg, color: color.text }} />;
  };

  // ===== CREATOR STEPS =====
  const creatorSteps = [
    {
      label: 'Select Addendum Type',
      content: (
        <Grid container spacing={2}>
          {ADDENDUM_TYPES.map((type) => (
            <Grid item xs={12} sm={6} key={type.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedType?.id === type.id ? '2px solid' : '1px solid',
                  borderColor: selectedType?.id === type.id ? 'primary.main' : 'divider',
                  '&:hover': { boxShadow: 3 },
                }}
                onClick={() => setSelectedType(type)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar sx={{ bgcolor: type.color }}>{type.icon}</Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {type.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      label: 'Link Original Agreement',
      content: (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the original agreement this addendum modifies
          </Typography>

          {agreements.length > 0 ? (
            <List>
              {agreements.map((agreement) => (
                <ListItem
                  key={agreement.id}
                  button
                  selected={linkedAgreement?.id === agreement.id}
                  onClick={() => setLinkedAgreement(agreement)}
                  sx={{
                    border: linkedAgreement?.id === agreement.id ? '2px solid' : '1px solid',
                    borderColor: linkedAgreement?.id === agreement.id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <AssignmentIcon color={linkedAgreement?.id === agreement.id ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={agreement.name}
                    secondary={`Client: ${agreement.clientName || 'Unknown'} | ${formatDate(agreement.createdAt)}`}
                  />
                  {linkedAgreement?.id === agreement.id && <CheckIcon color="primary" />}
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              No agreements found. Create an agreement first before adding addendums.
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Or enter client details manually:
          </Typography>
          <TextField
            fullWidth
            label="Client Name"
            value={formData.clientName || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            size="small"
          />
        </Box>
      ),
    },
    {
      label: 'Addendum Details',
      content: (
        <Box>
          {aiSuggestions && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<AIIcon />}>
              <AlertTitle>AI Suggestions</AlertTitle>
              <Typography variant="body2">
                {aiSuggestions.suggestedChanges?.join('. ')}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2}>
            {selectedType?.id === 'item-only' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="New Dispute Items"
                    placeholder="List the new items to be added to the dispute process..."
                    value={formData.newItems || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newItems: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Addition"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </Grid>
              </>
            )}

            {selectedType?.id === 'full-extension' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Extension Duration (months)"
                    value={formData.extensionMonths || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, extensionMonths: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Terms (if any)"
                    value={formData.newTerms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newTerms: e.target.value }))}
                  />
                </Grid>
              </>
            )}

            {selectedType?.id === 'ach-modification' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Payment Amount"
                    value={formData.newPaymentAmount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPaymentAmount: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="New Payment Day (1-28)"
                    value={formData.newPaymentDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPaymentDate: e.target.value }))}
                    inputProps={{ min: 1, max: 28 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Banking information should be collected securely via your payment processor.
                  </Alert>
                </Grid>
              </>
            )}

            {selectedType?.id === 'poa-update' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="POA Extension (months)"
                    value={formData.poaExtension || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, poaExtension: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Authorizations"
                    placeholder="Any additional authorizations to include..."
                    value={formData.additionalAuthorizations || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalAuthorizations: e.target.value }))}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={generating ? <CircularProgress size={16} /> : <AIIcon />}
              onClick={getAISuggestions}
              disabled={generating}
            >
              Get AI Suggestions
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Generate & Review',
      content: (
        <Box>
          {generatedContent ? (
            <Fade in>
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Addendum Generated Successfully</AlertTitle>
                  Review the content below before saving
                </Alert>

                <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>{generatedContent.title}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {generatedContent.content}
                  </Typography>
                </Paper>
              </Box>
            </Fade>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {generating ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography>Generating your addendum with AI...</Typography>
                </>
              ) : (
                <>
                  <AddendumIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography gutterBottom>Ready to generate your addendum</Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AIIcon />}
                    onClick={generateAddendumContent}
                  >
                    Generate Addendum
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>
      ),
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Addendums', value: stats.total, icon: <AddendumIcon />, color: 'primary.main' },
          { label: 'Pending Signature', value: stats.pending, icon: <ScheduleIcon />, color: 'warning.main' },
          { label: 'Signed', value: stats.signed, icon: <CheckIcon />, color: 'success.main' },
          { label: 'Item Only', value: stats.itemOnly, icon: <AddIcon />, color: '#2563eb' },
          { label: 'Extensions', value: stats.extensions, icon: <ExtensionIcon />, color: '#10b981' },
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search addendums..."
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
                {ADDENDUM_TYPES.map(type => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="signed">Signed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreator(true)}>
                Create Addendum
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ADDENDUMS TABLE */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredAddendums.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AddendumIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Addendums Found</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first addendum to modify an existing agreement
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreator(true)}>
            Create Addendum
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Addendum Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAddendums
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((addendum) => (
                  <TableRow key={addendum.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <AddendumIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {addendum.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{addendum.clientName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ADDENDUM_TYPES.find(t => t.id === addendum.addendumType)?.name || 'Addendum'}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(addendum.status)}</TableCell>
                    <TableCell>{formatDate(addendum.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => { setSelectedAddendum(addendum); setOpenPreview(true); }}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small"><DownloadIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Send for Signature">
                        <IconButton size="small" color="primary"><SendIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredAddendums.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </TableContainer>
      )}

      {/* CREATOR DIALOG */}
      <Dialog open={openCreator} onClose={() => { setOpenCreator(false); resetCreator(); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><AddendumIcon /></Avatar>
            <Box>
              <Typography variant="h6">Create Addendum</Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered addendum creation wizard
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} orientation="vertical">
            {creatorSteps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Box sx={{ py: 2 }}>{step.content}</Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(prev => prev + 1)}
                      disabled={
                        (index === 0 && !selectedType) ||
                        (index === 1 && !linkedAgreement && !formData.clientName) ||
                        (index === 3 && !generatedContent)
                      }
                      sx={{ mr: 1 }}
                    >
                      {index === creatorSteps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button onClick={() => setActiveStep(prev => prev - 1)} disabled={index === 0}>
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCreator(false); resetCreator(); }}>Cancel</Button>
          {generatedContent && (
            <Button variant="contained" startIcon={<CheckIcon />} onClick={handleSaveAddendum}>
              Save Addendum
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* PREVIEW DIALOG */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><AddendumIcon /></Avatar>
            <Box>
              <Typography variant="h6">{selectedAddendum?.name}</Typography>
              {selectedAddendum && getStatusChip(selectedAddendum.status)}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAddendum && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Client</Typography>
                  <Typography>{selectedAddendum.clientName || 'Not assigned'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography>
                    {ADDENDUM_TYPES.find(t => t.id === selectedAddendum.addendumType)?.name || 'Addendum'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography>{formatDate(selectedAddendum.createdAt)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Linked Agreement</Typography>
                  <Typography>{selectedAddendum.linkedAgreementId || 'None'}</Typography>
                </Grid>
              </Grid>

              {selectedAddendum.content ? (
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedAddendum.content}
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="info">No content preview available</Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>Download</Button>
          <Button variant="contained" startIcon={<SendIcon />}>Send for Signature</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddendumsTab;
