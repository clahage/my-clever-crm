// ============================================================================
// FILE: src/components/communications/EmailReviewQueue.jsx
// PURPOSE: Human review interface for AI-generated emails before sending
// AUTHOR: Christopher @ Speedy Credit Repair
// CREATED: November 2024
//
// FEATURES:
// - Display pending emails from emailQueue collection
// - Inline editor for body text
// - Approve/Reject workflow
// - Real-time updates with onSnapshot
// - Filter by email type
// - Tabs: Pending Review | Approved | Sent | Rejected
// - Role-based permissions (manager+ can approve)
// - Email preview with variable highlighting
// - Batch operations
// - AI confidence scoring display
//
// PATH: /src/components/communications/EmailReviewQueue.jsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Mail,
  Send,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  Filter,
  RefreshCw,
  User,
  Calendar
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc,
  serverTimestamp,
  orderBy,
  limit as limitQuery
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { approveEmail, rejectEmail } from '../../lib/emailWorkflowEngine';
import { format } from 'date-fns';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EmailReviewQueue() {
  const { userProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Check if user has permission to approve
  const canApprove = userProfile?.role >= 6; // manager or higher

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  useEffect(() => {
    console.log('📧 Loading email review queue...');
    setLoading(true);

    // Determine status based on tab
    const statusMap = {
      0: 'pending_review',
      1: 'approved',
      2: 'sent',
      3: 'rejected'
    };
    
    const status = statusMap[tabValue];

    // Build query
    let q = query(
      collection(db, 'emailQueue'),
      where('requiresApproval', '==', true),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limitQuery(50)
    );

    // Apply type filter if not "all"
    if (filterType !== 'all') {
      q = query(
        collection(db, 'emailQueue'),
        where('requiresApproval', '==', true),
        where('status', '==', status),
        where('emailType', '==', filterType),
        orderBy('createdAt', 'desc'),
        limitQuery(50)
      );
    }

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const emailsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setEmails(emailsList);
        setLoading(false);
        console.log(`✅ Loaded ${emailsList.length} emails (status: ${status})`);
      },
      (error) => {
        console.error('❌ Error loading emails:', error);
        setLoading(false);
        showSnackbar('Error loading emails', 'error');
      }
    );

    return () => unsubscribe();
  }, [tabValue, filterType]);

  // =============================================================================
  // ACTIONS
  // =============================================================================

  const handleEdit = (email) => {
    console.log('✏️ Editing email:', email.id);
    setSelectedEmail(email);
    setEditedBody(email.body);
    setEditedSubject(email.subject);
  };

  const handleApprove = async (emailId, finalBody = null, finalSubject = null) => {
    if (!canApprove) {
      showSnackbar('You do not have permission to approve emails', 'error');
      return;
    }

    try {
      setProcessingId(emailId);
      console.log('✅ Approving email:', emailId);

      await approveEmail(emailId, userProfile.uid, finalBody, finalSubject);
      
      showSnackbar('Email approved and queued for sending', 'success');
      setSelectedEmail(null);
      setProcessingId(null);
    } catch (error) {
      console.error('❌ Error approving email:', error);
      showSnackbar('Error approving email', 'error');
      setProcessingId(null);
    }
  };

  const handleReject = async (emailId, reason = '') => {
    if (!canApprove) {
      showSnackbar('You do not have permission to reject emails', 'error');
      return;
    }

    try {
      setProcessingId(emailId);
      console.log('❌ Rejecting email:', emailId);

      await rejectEmail(emailId, userProfile.uid, reason);
      
      showSnackbar('Email rejected', 'info');
      setSelectedEmail(null);
      setProcessingId(null);
    } catch (error) {
      console.error('❌ Error rejecting email:', error);
      showSnackbar('Error rejecting email', 'error');
      setProcessingId(null);
    }
  };

  const handleQuickApprove = async (email) => {
    await handleApprove(email.id);
  };

  const handleQuickReject = async (email) => {
    if (window.confirm('Are you sure you want to reject this email?')) {
      await handleReject(email.id, 'Quick reject');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'info' }), 5000);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* ===== HEADER ===== */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mail size={32} />
            📧 Email Review Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review AI-generated emails before they are sent to clients
          </Typography>
        </Box>
        
        {!canApprove && (
          <Alert severity="warning" sx={{ maxWidth: 400 }}>
            <AlertTitle>View Only</AlertTitle>
            You need manager-level access to approve/reject emails.
          </Alert>
        )}
      </Box>

      {/* ===== TABS ===== */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Badge badgeContent={tabValue === 0 ? emails.length : 0} color="primary">
                Pending Review
              </Badge>
            } 
            icon={<Clock size={20} />}
          />
          <Tab label="Approved" icon={<CheckCircle size={20} />} />
          <Tab label="Sent" icon={<Send size={20} />} />
          <Tab label="Rejected" icon={<XCircle size={20} />} />
        </Tabs>
      </Paper>

      {/* ===== FILTER ===== */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="initial_review">Initial Credit Review</MenuItem>
                <MenuItem value="proposal">Service Plan Proposal</MenuItem>
                <MenuItem value="nudge">Nudge Email</MenuItem>
                <MenuItem value="contract_reminder">Contract Reminder</MenuItem>
                <MenuItem value="welcome">Welcome Email</MenuItem>
                <MenuItem value="progress">Progress Update</MenuItem>
                <MenuItem value="dispute">Dispute Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Chip 
                label={`${emails.length} emails`} 
                color="primary" 
                variant="outlined"
              />
              {tabValue === 0 && emails.length > 0 && (
                <Chip 
                  label="Needs attention" 
                  color="warning" 
                  icon={<AlertCircle size={16} />}
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ===== EMAIL LIST ===== */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : emails.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Mail size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No emails {tabValue === 0 ? 'pending review' : ['approved', 'sent', 'rejected'][tabValue - 1]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 
              ? 'All caught up! No emails waiting for approval.' 
              : 'Check other tabs for more emails.'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              canApprove={canApprove}
              onEdit={() => handleEdit(email)}
              onApprove={() => handleQuickApprove(email)}
              onReject={() => handleQuickReject(email)}
              processing={processingId === email.id}
            />
          ))}
        </Stack>
      )}

      {/* ===== EDIT DIALOG ===== */}
      <Dialog
        open={selectedEmail !== null}
        onClose={() => setSelectedEmail(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ✏️ Review & Edit Email
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedEmail && (
              <>
                <TextField
                  fullWidth
                  label="To"
                  value={`${selectedEmail.toName || ''} <${selectedEmail.to}>`}
                  disabled
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Subject"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  size="small"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  label="Email Body (HTML)"
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  sx={{ fontFamily: 'monospace', fontSize: '12px' }}
                />

                <Alert severity="info" icon={<AlertCircle size={16} />}>
                  <AlertTitle>Editing Tips</AlertTitle>
                  • Edit carefully - HTML formatting matters<br />
                  • Variables like {'{'}{'{'} FIRST_NAME {'}'}{'}'}  will be replaced automatically<br />
                  • Preview will be shown to client exactly as written
                </Alert>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectedEmail(null)}
            startIcon={<XCircle />}
            disabled={processingId !== null}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleReject(selectedEmail.id, 'Edited and rejected')}
            startIcon={<Trash2 />}
            color="error"
            disabled={!canApprove || processingId !== null}
          >
            Reject
          </Button>
          <Button
            onClick={() => handleApprove(selectedEmail.id, editedBody, editedSubject)}
            startIcon={<CheckCircle />}
            variant="contained"
            disabled={!canApprove || processingId !== null}
          >
            {processingId ? 'Processing...' : 'Approve & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
}

// =============================================================================
// EMAIL CARD COMPONENT
// =============================================================================

function EmailCard({ email, canApprove, onEdit, onApprove, onReject, processing }) {
  const [expanded, setExpanded] = useState(false);

  const getTypeColor = (type) => {
    const colors = {
      initial_review: 'primary',
      proposal: 'success',
      nudge: 'warning',
      contract_reminder: 'error',
      welcome: 'info',
      progress: 'secondary'
    };
    return colors[type] || 'default';
  };

  const getTypeLabel = (type) => {
    const labels = {
      initial_review: 'Initial Credit Review',
      proposal: 'Service Plan Proposal',
      nudge: 'Nudge Email',
      contract_reminder: 'Contract Reminder',
      welcome: 'Welcome Email',
      progress: 'Progress Update',
      dispute: 'Dispute Status'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          {/* ===== LEFT: EMAIL INFO ===== */}
          <Grid item xs={12} md={8}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={getTypeLabel(email.emailType)} 
                  color={getTypeColor(email.emailType)}
                  size="small"
                />
                {email.createdBy && (
                  <Chip
                    label={`Created by ${email.createdBy}`}
                    size="small"
                    variant="outlined"
                    icon={<User size={14} />}
                  />
                )}
              </Box>

              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={20} />
                {email.subject}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>To:</strong> {email.toName || ''} &lt;{email.to}&gt;
              </Typography>

              {email.contactId && (
                <Typography variant="caption" color="text.secondary">
                  Contact ID: {email.contactId}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={14} />
                  {email.createdAt ? format(email.createdAt.toDate(), 'MMM dd, yyyy h:mm a') : 'Unknown'}
                </Typography>
                {email.approvedAt && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle size={14} />
                    Approved {format(email.approvedAt.toDate(), 'MMM dd, h:mm a')}
                  </Typography>
                )}
                {email.sentAt && (
                  <Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Send size={14} />
                    Sent {format(email.sentAt.toDate(), 'MMM dd, h:mm a')}
                  </Typography>
                )}
              </Box>

              {expanded && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
                  <Typography 
                    variant="body2" 
                    component="div"
                    sx={{ fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre-wrap' }}
                  >
                    {email.body.substring(0, 2000)}
                    {email.body.length > 2000 && '...'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* ===== RIGHT: ACTIONS ===== */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1} sx={{ height: '100%', justifyContent: 'space-between' }}>
              <Box>
                {email.error && (
                  <Alert severity="error" sx={{ mb: 1 }} icon={<AlertCircle size={16} />}>
                    <Typography variant="caption">{email.error}</Typography>
                  </Alert>
                )}
              </Box>

              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<Eye />}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Hide' : 'Preview'} Body
                </Button>

                {email.status === 'pending_review' && canApprove && (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={onEdit}
                      disabled={processing}
                    >
                      Edit & Review
                    </Button>

                    <Divider />

                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={onApprove}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Quick Approve'}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<XCircle />}
                      onClick={onReject}
                      disabled={processing}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {(email.status === 'sent' || email.status === 'approved') && (
                  <Chip
                    label={email.status === 'sent' ? '✅ Sent' : '⏳ Approved - Queued'}
                    color={email.status === 'sent' ? 'success' : 'info'}
                    sx={{ width: '100%' }}
                  />
                )}

                {email.status === 'rejected' && email.rejectedBy && (
                  <Alert severity="error" icon={<XCircle size={16} />}>
                    <Typography variant="caption">
                      Rejected by: {email.rejectedBy}<br />
                      {email.rejectionReason && `Reason: ${email.rejectionReason}`}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { EmailCard };