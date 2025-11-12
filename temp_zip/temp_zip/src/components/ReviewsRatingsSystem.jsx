// src/components/ReviewsRatingsSystem.jsx
// Complete Reviews & Ratings System with Photo Reviews, Moderation, Analytics

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Rating, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, LinearProgress, Alert, Badge, Tabs, Tab,
  List, ListItem, ListItemAvatar, ListItemText, FormControl,
  InputLabel, Select, MenuItem, Switch, Tooltip, ImageList,
  ImageListItem, Stack
} from '@mui/material';
import {
  Star, ThumbsUp, ThumbsDown, MessageSquare, Flag, CheckCircle,
  XCircle, Eye, EyeOff, Image as ImageIcon, Reply, MoreVertical,
  TrendingUp, Award, Users, Filter, Download, BarChart3,
  Calendar, Search, Edit2, Trash2, Send, Camera, X
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, query, 
  where, getDocs, onSnapshot, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// ============================================================================
// REVIEWS & RATINGS SYSTEM
// ============================================================================

export const ReviewsRatingsSystem = ({ productId, product, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, reported
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // New Review Form
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    pros: [],
    cons: [],
    photos: [],
    verifiedPurchase: false,
    wouldRecommend: true
  });

  // Review Stats
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    verified: 0,
    withPhotos: 0,
    recommended: 0,
    pending: 0
  });

  // ============================================================================
  // LOAD REVIEWS
  // ============================================================================

  useEffect(() => {
    if (!productId) return;
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'productReviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReviews(reviewsData);
        calculateStats(reviewsData);
      });

      setLoading(false);
      return unsubscribe;
    } catch (error) {
      console.error('Error loading reviews:', error);
      setLoading(false);
    }
  };

  // ============================================================================
  // CALCULATE STATISTICS
  // ============================================================================

  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const approved = reviewsData.filter(r => r.status === 'approved');
    
    const sum = approved.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = approved.length > 0 ? sum / approved.length : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approved.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    const verified = approved.filter(r => r.verifiedPurchase).length;
    const withPhotos = approved.filter(r => r.photos?.length > 0).length;
    const recommended = approved.filter(r => r.wouldRecommend).length;
    const pending = reviewsData.filter(r => r.status === 'pending').length;

    setStats({
      total,
      average,
      distribution,
      verified,
      withPhotos,
      recommended,
      pending
    });
  };

  // ============================================================================
  // SUBMIT REVIEW
  // ============================================================================

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment) {
      alert('Please provide a rating and comment');
      return;
    }

    try {
      const reviewData = {
        ...newReview,
        productId,
        productName: product?.name || '',
        userId,
        userName: 'Customer', // Would get from user profile
        userAvatar: null,
        status: 'pending', // pending, approved, rejected
        helpful: 0,
        notHelpful: 0,
        reported: false,
        responses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'productReviews'), reviewData);
      
      setShowAddReview(false);
      resetReviewForm();
      alert('Review submitted! It will be visible after moderation.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const resetReviewForm = () => {
    setNewReview({
      rating: 5,
      title: '',
      comment: '',
      pros: [],
      cons: [],
      photos: [],
      verifiedPurchase: false,
      wouldRecommend: true
    });
  };

  // ============================================================================
  // MODERATION ACTIONS
  // ============================================================================

  const handleApproveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'productReviews', reviewId), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'productReviews', reviewId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    
    try {
      await deleteDoc(doc(db, 'productReviews', reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleToggleVisibility = async (reviewId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
      await updateDoc(doc(db, 'productReviews', reviewId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  // ============================================================================
  // HELPFUL VOTES
  // ============================================================================

  const handleHelpfulVote = async (reviewId, isHelpful) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      const increment = isHelpful ? 
        { helpful: (review.helpful || 0) + 1 } :
        { notHelpful: (review.notHelpful || 0) + 1 };

      await updateDoc(doc(db, 'productReviews', reviewId), {
        ...increment,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // ============================================================================
  // RESPOND TO REVIEW
  // ============================================================================

  const handleRespondToReview = async (reviewId, responseText) => {
    if (!responseText.trim()) return;

    try {
      const review = reviews.find(r => r.id === reviewId);
      const responses = review.responses || [];
      
      responses.push({
        text: responseText,
        author: 'Business Owner',
        createdAt: new Date()
      });

      await updateDoc(doc(db, 'productReviews', reviewId), {
        responses,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error responding:', error);
    }
  };

  // ============================================================================
  // PHOTO UPLOAD
  // ============================================================================

  const handlePhotoUpload = async (files) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `reviews/${productId}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        url: downloadURL,
        path: storageRef.fullPath,
        uploadedAt: new Date()
      };
    });

    const photos = await Promise.all(uploadPromises);
    setNewReview(prev => ({
      ...prev,
      photos: [...prev.photos, ...photos]
    }));
  };

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    // Tab filter
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'approved':
        filtered = filtered.filter(r => r.status === 'approved');
        break;
      case 'reported':
        filtered = filtered.filter(r => r.reported);
        break;
    }

    // Rating filter
    if (filterRating !== 'all') {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        break;
      case 'highest':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'lowest':
        filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case 'helpful':
        filtered.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
    }

    return filtered;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Star size={28} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
            Reviews & Ratings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage customer feedback and build trust
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MessageSquare />}
          onClick={() => setShowAddReview(true)}
        >
          Write Review
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.average.toFixed(1)}
                </Typography>
                <Rating value={stats.average} precision={0.1} readOnly size="large" />
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                  Based on {stats.total} reviews
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.distribution[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
                      <Typography variant="body2">{rating}</Typography>
                      <Star size={16} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flex: 1, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <CheckCircle size={32} style={{ color: '#10B981', marginBottom: 8 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.verified}</Typography>
            <Typography variant="caption" color="text.secondary">Verified</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ImageIcon size={32} style={{ color: '#3B82F6', marginBottom: 8 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.withPhotos}</Typography>
            <Typography variant="caption" color="text.secondary">With Photos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <ThumbsUp size={32} style={{ color: '#8B5CF6', marginBottom: 8 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.recommended}</Typography>
            <Typography variant="caption" color="text.secondary">Recommend</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Eye size={32} style={{ color: '#F59E0B', marginBottom: 8 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.pending}</Typography>
            <Typography variant="caption" color="text.secondary">Pending</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label={`All (${reviews.length})`} value="all" />
          <Tab 
            label={
              <Badge badgeContent={stats.pending} color="warning">
                Pending
              </Badge>
            } 
            value="pending" 
          />
          <Tab label="Approved" value="approved" />
          <Tab label="Reported" value="reported" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Rating</InputLabel>
              <Select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                label="Filter by Rating"
              >
                <MenuItem value="all">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="highest">Highest Rating</MenuItem>
                <MenuItem value="lowest">Lowest Rating</MenuItem>
                <MenuItem value="helpful">Most Helpful</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Loading reviews...</Typography>
        </Box>
      ) : getFilteredReviews().length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <MessageSquare size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>No reviews yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Be the first to review this product!
          </Typography>
          <Button variant="contained" onClick={() => setShowAddReview(true)}>
            Write First Review
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredReviews().map(review => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar>{review.userName?.charAt(0) || 'U'}</Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {review.userName}
                          </Typography>
                          {review.verifiedPurchase && (
                            <Chip 
                              label="Verified Purchase" 
                              size="small" 
                              color="success"
                              icon={<CheckCircle size={14} />}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {review.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveReview(review.id)}
                            >
                              <CheckCircle size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectReview(review.id)}
                            >
                              <XCircle size={18} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title={review.status === 'approved' ? 'Hide' : 'Show'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleVisibility(review.id, review.status)}
                        >
                          {review.status === 'approved' ? <Eye size={18} /> : <EyeOff size={18} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Title */}
                  {review.title && (
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {review.title}
                    </Typography>
                  )}

                  {/* Comment */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>

                  {/* Pros & Cons */}
                  {(review.pros?.length > 0 || review.cons?.length > 0) && (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {review.pros?.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            PROS:
                          </Typography>
                          <List dense>
                            {review.pros.map((pro, idx) => (
                              <ListItem key={idx} sx={{ py: 0 }}>
                                <ThumbsUp size={12} style={{ marginRight: 8, color: '#10B981' }} />
                                <ListItemText primary={pro} primaryTypographyProps={{ variant: 'caption' }} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      )}
                      {review.cons?.length > 0 && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            CONS:
                          </Typography>
                          <List dense>
                            {review.cons.map((con, idx) => (
                              <ListItem key={idx} sx={{ py: 0 }}>
                                <ThumbsDown size={12} style={{ marginRight: 8, color: '#EF4444' }} />
                                <ListItemText primary={con} primaryTypographyProps={{ variant: 'caption' }} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {/* Photos */}
                  {review.photos?.length > 0 && (
                    <ImageList cols={4} gap={8} sx={{ mb: 2 }}>
                      {review.photos.map((photo, idx) => (
                        <ImageListItem key={idx}>
                          <img
                            src={photo.url}
                            alt={`Review photo ${idx + 1}`}
                            loading="lazy"
                            style={{ borderRadius: 8, cursor: 'pointer', height: 100, objectFit: 'cover' }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}

                  {/* Helpful Votes */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Was this helpful?
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ThumbsUp size={14} />}
                      onClick={() => handleHelpfulVote(review.id, true)}
                    >
                      Yes ({review.helpful || 0})
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ThumbsDown size={14} />}
                      onClick={() => handleHelpfulVote(review.id, false)}
                    >
                      No ({review.notHelpful || 0})
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Reply size={14} />}
                      onClick={() => {
                        setSelectedReview(review);
                        setShowReviewDetails(true);
                      }}
                    >
                      Respond
                    </Button>
                  </Box>

                  {/* Responses */}
                  {review.responses?.length > 0 && (
                    <Box sx={{ mt: 2, pl: 6, borderLeft: 3, borderColor: 'primary.main' }}>
                      {review.responses.map((response, idx) => (
                        <Box key={idx} sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {response.author}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {response.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Review Dialog */}
      <Dialog open={showAddReview} onClose={() => setShowAddReview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Overall Rating</Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(e, val) => setNewReview(prev => ({ ...prev, rating: val }))}
                  size="large"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Review Title"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Sum up your experience in one line"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Review"
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Add Photos (Optional)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Camera />}
                >
                  Upload Photos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                  />
                </Button>
                {newReview.photos.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {newReview.photos.map((photo, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <img
                          src={photo.url}
                          alt={`Preview ${idx}`}
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                          onClick={() => setNewReview(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== idx)
                          }))}
                        >
                          <X size={14} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">Would you recommend this product?</Typography>
                  <Switch
                    checked={newReview.wouldRecommend}
                    onChange={(e) => setNewReview(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddReview(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={!newReview.rating || !newReview.comment}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Details / Response Dialog */}
      <Dialog 
        open={showReviewDetails} 
        onClose={() => {
          setShowReviewDetails(false);
          setSelectedReview(null);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Respond to Review</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Write your response..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleRespondToReview(selectedReview.id, e.target.value);
                    setShowReviewDetails(false);
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Tip: Thank the customer and address their concerns professionally
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDetails(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={(e) => {
              const input = e.currentTarget.closest('.MuiDialog-root').querySelector('textarea');
              if (input.value) {
                handleRespondToReview(selectedReview.id, input.value);
                setShowReviewDetails(false);
              }
            }}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsRatingsSystem;