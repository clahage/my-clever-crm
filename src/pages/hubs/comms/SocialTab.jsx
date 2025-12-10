// Path: /src/pages/hubs/comms/SocialTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - SOCIAL MEDIA TAB
// ============================================================================
// Purpose: Social media management and post scheduling
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
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Globe,
  Calendar
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' }
];

const SocialTab = () => {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    platform: 'facebook',
    scheduledFor: '',
    status: 'draft'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'socialPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [posts, searchTerm, platformFilter]);

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setFormData({ content: '', platform: 'facebook', scheduledFor: '', status: 'draft' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      content: selectedPost.content || '',
      platform: selectedPost.platform || 'facebook',
      scheduledFor: selectedPost.scheduledFor || '',
      status: selectedPost.status || 'draft'
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
      await deleteDoc(doc(db, 'socialPosts', selectedPost.id));
      setSnackbar({ open: true, message: 'Post deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({ open: true, message: 'Error deleting post', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedPost?.id) {
        await updateDoc(doc(db, 'socialPosts', selectedPost.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Post updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'socialPosts'), {
          ...formData,
          likes: 0,
          shares: 0,
          comments: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Post created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      setSnackbar({ open: true, message: 'Error saving post', severity: 'error' });
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search posts..."
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  label="Platform"
                >
                  <MenuItem value="all">All Platforms</MenuItem>
                  {PLATFORMS.map(platform => (
                    <MenuItem key={platform.value} value={platform.value}>{platform.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleCreate}
              >
                Create Post
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredPosts.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm || platformFilter !== 'all'
                    ? 'No posts match your filters'
                    : 'No posts yet. Click "Create Post" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredPosts.map((post) => (
            <Grid item xs={12} md={6} key={post.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Chip
                        label={post.platform}
                        size="small"
                        sx={{ mb: 1, textTransform: 'capitalize' }}
                      />
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {post.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Likes: {post.likes || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Shares: {post.shares || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Comments: {post.comments || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, post)}>
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
          {selectedPost ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  label="Platform"
                >
                  {PLATFORMS.map(platform => (
                    <MenuItem key={platform.value} value={platform.value}>{platform.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule For"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedPost ? 'Update' : 'Create'} Post
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
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

export default SocialTab;
