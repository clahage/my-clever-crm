// ===================================================================
// ResourceDetailsDialog.jsx
// Path: /src/components/resources/ResourceDetailsDialog.jsx
// 
// Resource Details Viewer
// Full-featured resource viewer with comments, ratings, and sharing
// 
// Features:
// - Resource preview
// - Ratings and reviews
// - Comments section
// - Share functionality
// - Related resources
// - Download tracking
// - View history
// 
// Created: November 10, 2025
// ===================================================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Rating,
  TextField,
  Divider,
  Paper,
  IconButton,
  Grid,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  X,
  Download,
  Share2,
  Heart,
  Star,
  Eye,
  Clock,
  User,
  MessageCircle,
  Send,
  ExternalLink,
  Copy,
  ThumbsUp,
  Bookmark,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase';

const ResourceDetailsDialog = ({
  open,
  onClose,
  resource,
  currentUser,
  userProfile,
  isFavorite,
  onToggleFavorite,
  onDownload,
  onRate,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [relatedResources, setRelatedResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resource) {
      loadComments();
      loadRelatedResources();
      loadUserRating();
    }
  }, [resource]);

  const loadComments = async () => {
    try {
      const commentsRef = collection(db, 'resources', resource.id, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadRelatedResources = async () => {
    try {
      // Find resources with similar tags or category
      const resourcesRef = collection(db, 'resources');
      const q = query(
        resourcesRef,
        where('category', '==', resource.category),
        orderBy('views', 'desc')
      );
      const snapshot = await getDocs(q);
      const related = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(r => r.id !== resource.id)
        .slice(0, 5);
      setRelatedResources(related);
    } catch (error) {
      console.error('Error loading related resources:', error);
    }
  };

  const loadUserRating = async () => {
    try {
      const ratingsRef = collection(db, 'resources', resource.id, 'ratings');
      const q = query(ratingsRef, where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setRating(snapshot.docs[0].data().rating);
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const commentsRef = collection(db, 'resources', resource.id, 'comments');
      await addDoc(commentsRef, {
        userId: currentUser.uid,
        userName: userProfile?.displayName || currentUser.email,
        userAvatar: userProfile?.photoURL || null,
        comment: newComment,
        createdAt: serverTimestamp(),
        likes: 0,
      });

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (newRating) => {
    try {
      setRating(newRating);
      await onRate(resource.id, newRating);
      
      // Save user's rating
      const ratingsRef = collection(db, 'resources', resource.id, 'ratings');
      await addDoc(ratingsRef, {
        userId: currentUser.uid,
        rating: newRating,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error rating resource:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/resources/${resource.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/resources/${resource.id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  if (!resource) return null;

  const averageRating = resource.ratingCount > 0 
    ? (resource.rating / resource.ratingCount).toFixed(1) 
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex justify-between items-start">
          <Box className="flex-1">
            <Typography variant="h5" className="font-bold mb-2">
              {resource.title}
            </Typography>
            <Box className="flex items-center gap-2 flex-wrap">
              <Chip label={resource.category} color="primary" size="small" />
              <Chip label={resource.type} variant="outlined" size="small" />
              {resource.tags?.slice(0, 3).map(tag => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Stats Bar */}
        <Paper className="p-4 mb-4 bg-gray-50 dark:bg-gray-800">
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box className="text-center">
                <Box className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="w-4 h-4" />
                  <Typography variant="h6">{resource.views || 0}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Views
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box className="text-center">
                <Box className="flex items-center justify-center gap-1 mb-1">
                  <Download className="w-4 h-4" />
                  <Typography variant="h6">{resource.downloads || 0}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Downloads
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box className="text-center">
                <Box className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="w-4 h-4" />
                  <Typography variant="h6">{resource.favorites || 0}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Favorites
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box className="text-center">
                <Box className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Typography variant="h6">{averageRating}</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Rating
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" value="overview" />
          <Tab label={`Comments (${comments.length})`} value="comments" />
          <Tab label="Related" value="related" />
        </Tabs>

        <Divider className="my-4" />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Box>
            <Typography variant="body1" className="mb-4">
              {resource.description}
            </Typography>

            <Divider className="my-4" />

            {/* Metadata */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary" className="mb-1">
                  Uploaded by
                </Typography>
                <Box className="flex items-center gap-2">
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {resource.uploadedByName?.[0]}
                  </Avatar>
                  <Typography variant="body2">
                    {resource.uploadedByName}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary" className="mb-1">
                  Upload date
                </Typography>
                <Typography variant="body2">
                  {resource.createdAt?.toDate().toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary" className="mb-1">
                  File type
                </Typography>
                <Typography variant="body2">
                  {resource.fileType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary" className="mb-1">
                  File size
                </Typography>
                <Typography variant="body2">
                  {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Grid>
            </Grid>

            <Divider className="my-4" />

            {/* Rate this resource */}
            <Box className="text-center py-4">
              <Typography variant="body2" className="mb-2">
                Rate this resource
              </Typography>
              <Rating
                value={rating}
                onChange={(e, newValue) => handleRating(newValue)}
                size="large"
              />
            </Box>
          </Box>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <Box>
            {/* Add Comment */}
            <Box className="mb-4">
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <Box className="flex justify-end">
                <Button
                  variant="contained"
                  disabled={!newComment.trim() || loading}
                  onClick={handleAddComment}
                  startIcon={<Send className="w-4 h-4" />}
                >
                  Post Comment
                </Button>
              </Box>
            </Box>

            <Divider className="my-4" />

            {/* Comments List */}
            <List>
              {comments.length === 0 ? (
                <Box className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <Typography variant="body2" color="textSecondary">
                    No comments yet. Be the first to comment!
                  </Typography>
                </Box>
              ) : (
                comments.map(comment => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={comment.userAvatar}>
                        {comment.userName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="flex items-center gap-2">
                          <Typography variant="subtitle2" className="font-semibold">
                            {comment.userName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {comment.createdAt?.toDate().toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" className="mt-1">
                            {comment.comment}
                          </Typography>
                          <Box className="flex items-center gap-2 mt-2">
                            <IconButton size="small">
                              <ThumbsUp className="w-4 h-4" />
                            </IconButton>
                            <Typography variant="caption">
                              {comment.likes || 0}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}

        {/* Related Resources Tab */}
        {activeTab === 'related' && (
          <Box>
            {relatedResources.length === 0 ? (
              <Box className="text-center py-8">
                <Typography variant="body2" color="textSecondary">
                  No related resources found
                </Typography>
              </Box>
            ) : (
              <List>
                {relatedResources.map(related => (
                  <ListItem
                    key={related.id}
                    button
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                  >
                    <ListItemText
                      primary={related.title}
                      secondary={
                        <Box className="flex items-center gap-2 mt-1">
                          <Chip label={related.category} size="small" />
                          <Typography variant="caption">
                            {related.views || 0} views
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Box className="flex gap-2 flex-1">
          <Button
            variant="outlined"
            startIcon={isFavorite ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4" />}
            onClick={() => onToggleFavorite(resource.id)}
          >
            {isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share2 className="w-4 h-4" />}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            startIcon={<Copy className="w-4 h-4" />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download className="w-4 h-4" />}
          onClick={() => onDownload(resource)}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResourceDetailsDialog;