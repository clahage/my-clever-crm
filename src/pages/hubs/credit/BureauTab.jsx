// Path: /src/pages/hubs/credit/BureauTab.jsx
// ============================================================================
// CREDIT HUB - BUREAU COMMUNICATION TAB
// ============================================================================
// Purpose: Bureau correspondence
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Send,
  FileText,
  Download,
  Eye,
  Upload,
  Mail,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const LETTER_TEMPLATES = [
  {
    id: 'dispute_letter',
    name: 'Dispute Letter',
    description: 'Standard dispute letter to credit bureaus'
  },
  {
    id: 'validation_request',
    name: 'Debt Validation Request',
    description: 'Request validation of debt from creditor'
  },
  {
    id: 'goodwill_letter',
    name: 'Goodwill Letter',
    description: 'Request goodwill deletion of negative items'
  },
  {
    id: 'cease_desist',
    name: 'Cease and Desist',
    description: 'Stop harassment from debt collectors'
  },
  {
    id: 'identity_theft',
    name: 'Identity Theft Affidavit',
    description: 'Report identity theft to bureaus'
  },
  {
    id: 'follow_up',
    name: 'Follow-up Letter',
    description: 'Follow up on previous correspondence'
  }
];

const BureauTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [communications, setCommunications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [letterForm, setLetterForm] = useState({
    bureaus: [],
    template: '',
    subject: '',
    content: '',
    attachments: []
  });

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to communications
    const clientId = userProfile?.role === 'client' ? userProfile.uid : null;
    const commsQuery = clientId
      ? query(
          collection(db, 'bureauCommunications'),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        )
      : query(collection(db, 'bureauCommunications'), orderBy('createdAt', 'desc'));

    const unsubComms = onSnapshot(commsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunications(data);
      setLoading(false);
    });
    unsubscribers.push(unsubComms);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [userProfile]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setLetterForm({
      ...letterForm,
      template: template.id,
      subject: template.name
    });

    // Generate template content
    const templateContent = generateTemplateContent(template.id);
    setLetterForm(prev => ({ ...prev, content: templateContent }));
  };

  const generateTemplateContent = (templateId) => {
    const clientName = userProfile?.displayName || '[Client Name]';
    const clientAddress = '[Client Address]';
    const date = new Date().toLocaleDateString();

    const templates = {
      dispute_letter: `${date}

${clientName}
${clientAddress}

[Bureau Name]
[Bureau Address]

Re: Dispute of Inaccurate Information

Dear Sir/Madam,

I am writing to dispute the following information in my credit file. The items I dispute are also encircled on the attached copy of the report I received.

[List disputed items here]

This item is [inaccurate or incomplete] because [describe what is inaccurate or incomplete and why]. I am requesting that the item be removed [or request another specific change] to correct the information.

Enclosed are copies of [use this sentence if applicable and describe any enclosed documentation, such as payment records and court documents] supporting my position. Please reinvestigate this [these] matter[s] and [delete or correct] the disputed item[s] as soon as possible.

Sincerely,
${clientName}`,

      validation_request: `${date}

${clientName}
${clientAddress}

[Creditor Name]
[Creditor Address]

Re: Request for Debt Validation

Dear Sir/Madam,

This letter is to request validation of the debt you claim I owe. Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request verification of this debt.

Please provide:
1. Proof that you own this debt
2. Complete payment history
3. Original contract with my signature
4. License to collect in my state

Until you provide this validation, please cease all collection activities.

Sincerely,
${clientName}`,

      goodwill_letter: `${date}

${clientName}
${clientAddress}

[Creditor Name]
[Creditor Address]

Re: Goodwill Adjustment Request

Dear Sir/Madam,

I am writing to request a goodwill adjustment to my credit report. I have been a loyal customer and have maintained a positive payment history.

[Explain circumstances that led to late payment]

I respectfully request that you consider removing the negative mark from my credit report as a gesture of goodwill. I value our relationship and appreciate your consideration.

Sincerely,
${clientName}`,

      cease_desist: `${date}

${clientName}
${clientAddress}

[Collector Name]
[Collector Address]

Re: Cease and Desist

Dear Sir/Madam,

This letter is to inform you that I am requesting that you cease all communication with me regarding the alleged debt.

Under the FDCPA, I have the right to request that you stop contacting me. This letter serves as my formal request. All future communications should be in writing only.

Sincerely,
${clientName}`,

      identity_theft: `${date}

${clientName}
${clientAddress}

[Bureau Name]
[Bureau Address]

Re: Identity Theft Affidavit

Dear Sir/Madam,

I am a victim of identity theft. The following accounts on my credit report are fraudulent and were opened without my authorization:

[List fraudulent accounts]

I am requesting that these accounts be removed from my credit report immediately. Enclosed is a copy of the police report and FTC Identity Theft Report.

Sincerely,
${clientName}`,

      follow_up: `${date}

${clientName}
${clientAddress}

[Bureau Name]
[Bureau Address]

Re: Follow-up on Previous Correspondence

Dear Sir/Madam,

This letter is a follow-up to my previous correspondence dated [Previous Date] regarding [Subject].

I have not received a response within the required 30-day timeframe. Please provide an update on the status of my request.

Sincerely,
${clientName}`
    };

    return templates[templateId] || '';
  };

  const handlePreviewLetter = () => {
    const bureauNames = letterForm.bureaus.join(', ');
    const preview = `To: ${bureauNames}\n\nSubject: ${letterForm.subject}\n\n${letterForm.content}`;
    setPreviewContent(preview);
    setOpenPreview(true);
  };

  const handleSendLetter = async () => {
    try {
      if (letterForm.bureaus.length === 0) {
        throw new Error('Please select at least one bureau');
      }
      if (!letterForm.content) {
        throw new Error('Please provide letter content');
      }

      const communication = {
        clientId: userProfile.uid,
        clientName: userProfile.displayName || userProfile.email,
        clientEmail: userProfile.email,
        bureaus: letterForm.bureaus,
        template: letterForm.template,
        subject: letterForm.subject,
        content: letterForm.content,
        attachments: letterForm.attachments,
        status: 'sent',
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: userProfile.email,
        // IDIQ/Bureau API integration point
        trackingNumbers: {
          equifax: letterForm.bureaus.includes('Equifax') ? 'PENDING' : null,
          experian: letterForm.bureaus.includes('Experian') ? 'PENDING' : null,
          transunion: letterForm.bureaus.includes('TransUnion') ? 'PENDING' : null
        }
      };

      await addDoc(collection(db, 'bureauCommunications'), communication);

      setSnackbar({
        open: true,
        message: 'Letter sent successfully',
        severity: 'success'
      });

      // Reset form
      setOpenDialog(false);
      setSelectedTemplate(null);
      setLetterForm({
        bureaus: [],
        template: '',
        subject: '',
        content: '',
        attachments: []
      });
    } catch (error) {
      console.error('Error sending letter:', error);
      setSnackbar({
        open: true,
        message: 'Error sending letter: ' + error.message,
        severity: 'error'
      });
    }
  };

  const toggleBureau = (bureau) => {
    if (letterForm.bureaus.includes(bureau)) {
      setLetterForm({
        ...letterForm,
        bureaus: letterForm.bureaus.filter(b => b !== bureau)
      });
    } else {
      setLetterForm({
        ...letterForm,
        bureaus: [...letterForm.bureaus, bureau]
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'info';
      case 'delivered': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Bureau Communication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send letters and track correspondence with credit bureaus
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Send size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Send Letter
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Sent</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {communications.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending Response</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {communications.filter(c => c.status === 'sent').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Delivered</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {communications.filter(c => c.status === 'delivered').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">This Month</Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'info.main' }}>
                {communications.filter(c => {
                  const sentAt = c.sentAt?.toDate();
                  if (!sentAt) return false;
                  const now = new Date();
                  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  return sentAt >= firstDayOfMonth;
                }).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Communications History */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Communication History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {userProfile?.role !== 'client' && <TableCell>Client</TableCell>}
                  <TableCell>Date</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Bureaus</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {communications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={userProfile?.role !== 'client' ? 6 : 5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No communications yet. Click "Send Letter" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  communications.map((comm) => (
                    <TableRow key={comm.id}>
                      {userProfile?.role !== 'client' && (
                        <TableCell>{comm.clientName}</TableCell>
                      )}
                      <TableCell>
                        {comm.sentAt?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>{comm.subject}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {comm.bureaus?.map(bureau => (
                            <Chip key={bureau} label={bureau} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={comm.status}
                          color={getStatusColor(comm.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="View Letter">
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" title="Download">
                          <Download size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Send Letter Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Letter to Bureau</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Bureau Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Select Bureaus
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['Equifax', 'Experian', 'TransUnion'].map(bureau => (
                  <Chip
                    key={bureau}
                    label={bureau}
                    onClick={() => toggleBureau(bureau)}
                    color={letterForm.bureaus.includes(bureau) ? 'primary' : 'default'}
                    variant={letterForm.bureaus.includes(bureau) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            {/* Template Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Choose Template
              </Typography>
              <Grid container spacing={1}>
                {LETTER_TEMPLATES.map(template => (
                  <Grid item xs={12} sm={6} key={template.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedTemplate?.id === template.id ? 2 : 1,
                        borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Letter Content */}
            {selectedTemplate && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={letterForm.subject}
                    onChange={(e) => setLetterForm({ ...letterForm, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    label="Letter Content"
                    value={letterForm.content}
                    onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<Upload size={18} />}
                    fullWidth
                  >
                    Attach Documents
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<Eye size={18} />}
            onClick={handlePreviewLetter}
            disabled={!selectedTemplate}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<Send size={18} />}
            onClick={handleSendLetter}
            disabled={!selectedTemplate || letterForm.bureaus.length === 0}
          >
            Send Letter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Letter Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            {previewContent}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download size={18} />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BureauTab;
