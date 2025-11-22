// src/components/DeletionApprovalSystem.jsx
// User Deletion Request & Approval Workflow System

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Avatar,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { canDeleteUserWithRole, requiresApproval, getNotificationEmail } from '@/config/roleConfig';

const DeletionApprovalSystem = ({ targetUser, onClose, onSuccess }) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Check if user can delete this target user
  const canDelete = canDeleteUserWithRole(userProfile?.role, targetUser?.role);
  const needsApproval = requiresApproval(userProfile?.role, 'delete');

  const handleDeleteRequest = async () => {
    if (!targetUser) return;

    setLoading(true);
    try {
      if (!canDelete) {
        setSnackbar({
          open: true,
          message: `You cannot delete users with ${targetUser.role} role`,
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      if (needsApproval) {
        // Create deletion request for owner approval
        const notificationEmail = getNotificationEmail(userProfile?.role);
        
        const deletionRequest = {
          targetUserId: targetUser.uid,
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.displayName || targetUser.email,
          targetUserRole: targetUser.role,
          requestedBy: currentUser.uid,
          requestedByEmail: currentUser.email,
          requestedByName: userProfile?.displayName || currentUser.email,
          requestedByRole: userProfile?.role,
          reason: reason || 'No reason provided',
          status: 'pending',
          createdAt: serverTimestamp(),
          notificationEmail: notificationEmail,
        };

        await addDoc(collection(db, 'deletionRequests'), deletionRequest);

        // Send notification email (you'll need to implement this via Cloud Functions)
        // For now, just create a notification document
        await addDoc(collection(db, 'notifications'), {
          type: 'deletion_request',
          targetUserId: 'OWNER_USER_ID', // Replace with actual owner UID
          title: 'User Deletion Request',
          message: `${userProfile?.displayName || currentUser.email} has requested to delete user ${targetUser.displayName || targetUser.email}`,
          data: deletionRequest,
          read: false,
          createdAt: serverTimestamp(),
        });

        setSnackbar({
          open: true,
          message: 'Deletion request submitted for owner approval',
          severity: 'success',
        });

        setConfirmOpen(false);
        if (onSuccess) onSuccess();
      } else {
        // Direct deletion (for roles with full delete permissions)
        await deleteDoc(doc(db, 'userProfiles', targetUser.uid));
        
        // Log the deletion
        await addDoc(collection(db, 'auditLog'), {
          action: 'user_deleted',
          targetUserId: targetUser.uid,
          targetUserEmail: targetUser.email,
          targetUserRole: targetUser.role,
          performedBy: currentUser.uid,
          performedByEmail: currentUser.email,
          performedByRole: userProfile?.role,
          timestamp: serverTimestamp(),
        });

        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });

        setConfirmOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error handling deletion:', error);
      setSnackbar({
        open: true,
        message: 'Error processing deletion request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Trash2 size={18} />}
        onClick={() => setConfirmOpen(true)}
        disabled={!canDelete}
      >
        {needsApproval ? 'Request Deletion' : 'Delete User'}
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <AlertTriangle size={24} color="#f59e0b" />
            <Typography variant="h6">
              {needsApproval ? 'Request User Deletion' : 'Confirm User Deletion'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {needsApproval && (
              <Alert severity="warning" icon={<Clock size={20} />}>
                This deletion requires owner approval. The owner will be notified of your request.
              </Alert>
            )}

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'error.light' }}>
                      <User size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {targetUser?.displayName || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {targetUser?.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Chip
                        label={targetUser?.role || 'Unknown'}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={targetUser?.status || 'Unknown'}
                        size="small"
                        color={targetUser?.status === 'active' ? 'success' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            <TextField
              label="Reason for Deletion"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for this deletion request..."
              fullWidth
              required={needsApproval}
            />

            <Alert severity="error" icon={<AlertCircle size={20} />}>
              <Typography variant="body2" fontWeight="bold">
                Warning: This action cannot be undone
              </Typography>
              <Typography variant="body2" fontSize="0.875rem">
                {needsApproval
                  ? 'Once approved, all user data will be permanently deleted.'
                  : 'All user data will be permanently deleted immediately.'}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRequest}
            color="error"
            variant="contained"
            disabled={loading || (needsApproval && !reason.trim())}
            startIcon={needsApproval ? <Clock size={18} /> : <Trash2 size={18} />}
          >
            {loading ? 'Processing...' : needsApproval ? 'Submit Request' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Deletion Requests Dashboard (for owner to approve/reject)
export const DeletionRequestsDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (userProfile?.role !== 'masterAdmin' && userProfile?.role !== 'officeManager') {
      return; // Only admins can see this
    }

    const q = query(
      collection(db, 'deletionRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleApprove = async (request) => {
    try {
      // Delete the user
      await deleteDoc(doc(db, 'userProfiles', request.targetUserId));

      // Update request status
      await updateDoc(doc(db, 'deletionRequests', request.id), {
        status: 'approved',
        approvedBy: currentUser.uid,
        approvedAt: serverTimestamp(),
      });

      // Log the action
      await addDoc(collection(db, 'auditLog'), {
        action: 'deletion_approved',
        targetUserId: request.targetUserId,
        targetUserEmail: request.targetUserEmail,
        requestedBy: request.requestedBy,
        approvedBy: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Deletion request approved and user deleted',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error approving deletion:', error);
      setSnackbar({
        open: true,
        message: 'Error approving deletion request',
        severity: 'error',
      });
    }
  };

  const handleReject = async (request) => {
    try {
      await updateDoc(doc(db, 'deletionRequests', request.id), {
        status: 'rejected',
        rejectedBy: currentUser.uid,
        rejectedAt: serverTimestamp(),
      });

      setSnackbar({
        open: true,
        message: 'Deletion request rejected',
        severity: 'info',
      });
    } catch (error) {
      console.error('Error rejecting deletion:', error);
      setSnackbar({
        open: true,
        message: 'Error rejecting deletion request',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading deletion requests...</Typography>
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2} alignItems="center" py={4}>
            <CheckCircle size={48} color="#10b981" />
            <Typography variant="h6">No Pending Deletion Requests</Typography>
            <Typography variant="body2" color="text.secondary">
              All deletion requests have been processed
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Pending Deletion Requests
            <Badge badgeContent={requests.length} color="error" sx={{ ml: 2 }} />
          </Typography>
        </Stack>

        <List>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <ListItem
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
              >
                <Stack spacing={2} width="100%">
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'error.light' }}>
                        <User size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {request.targetUserName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.targetUserEmail}
                        </Typography>
                        <Chip label={request.targetUserRole} size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Stack>
                    <Chip
                      label="Pending"
                      size="small"
                      color="warning"
                      icon={<Clock size={16} />}
                    />
                  </Stack>

                  <Divider />

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Requested by:
                    </Typography>
                    <Typography variant="body2">
                      {request.requestedByName} ({request.requestedByRole})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                      {request.createdAt?.toDate
                        ? format(request.createdAt.toDate(), 'MMM dd, yyyy hh:mm a')
                        : 'Unknown date'}
                    </Typography>
                  </Box>

                  {request.reason && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reason:
                      </Typography>
                      <Typography variant="body2">{request.reason}</Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<XCircle size={18} />}
                      onClick={() => handleReject(request)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle size={18} />}
                      onClick={() => handleApprove(request)}
                    >
                      Approve & Delete
                    </Button>
                  </Stack>
                </Stack>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeletionApprovalSystem;
