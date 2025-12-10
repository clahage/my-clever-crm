// Path: /src/pages/hubs/comms/ReviewsTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - REVIEWS & REPUTATION TAB
// ============================================================================
// Purpose: Reputation management and review monitoring
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Star,
  MessageSquare
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ReviewsTab = () => {
  const { userProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    rating: 5,
    comment: '',
    platform: 'google',
    response: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(review =>
      review.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reviews, searchTerm]);

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedReview(null);
    setFormData({ clientName: '', rating: 5, comment: '', platform: 'google', response: '' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      clientName: selectedReview.clientName || '',
      rating: selectedReview.rating || 5,
      comment: selectedReview.comment || '',
      platform: selectedReview.platform || 'google',
      response: selectedReview.response || ''
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'reviews', selectedReview.id));
      setSnackbar({ open: true, message: 'Review deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      setSnackbar({ open: true, message: 'Error deleting review', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedReview?.id) {
        await updateDoc(doc(db, 'reviews', selectedReview.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Review updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'reviews'), {
          ...formData,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Review created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error saving review:', error);
      setSnackbar({ open: true, message: 'Error saving review', severity: 'error' });
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleCreate}
              >
                Add Review
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating value={parseFloat(averageRating)} readOnly precision={0.1} />
            <Typography variant="h6">{averageRating}</Typography>
            <Typography variant="body2" color="text.secondary">
              ({reviews.length} reviews)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredReviews.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm
                    ? 'No reviews match your search'
                    : 'No reviews yet. Click "Add Review" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredReviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {review.clientName}
                        </Typography>
                        <Chip label={review.platform} size="small" />
                      </Box>
                      <Rating value={review.rating || 0} readOnly size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {review.comment}
                      </Typography>
                      {review.response && (
                        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Your Response:
                          </Typography>
                          <Typography variant="body2">
                            {review.response}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, review)}>
                      <MoreVertical size={18} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <MessageSquare size={16} style={{ marginRight: 8 }} />
          Respond
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReview ? 'Edit Review' : 'Add New Review'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Rating</Typography>
              <Rating
                value={formData.rating}
                onChange={(e, newValue) => setFormData({ ...formData, rating: newValue })}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comment"
                multiline
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Response (Optional)"
                multiline
                rows={3}
                value={formData.response}
                onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedReview ? 'Update' : 'Add'} Review
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default ReviewsTab;
