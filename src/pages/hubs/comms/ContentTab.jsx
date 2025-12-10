// Path: /src/pages/hubs/comms/ContentTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - CONTENT & SEO TAB
// ============================================================================
// Purpose: Content creation and SEO optimization tools
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
  FileText
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'seo', label: 'SEO Content' }
];

const ContentTab = () => {
  const { userProfile } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'blog',
    keywords: '',
    content: '',
    status: 'draft'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContent(contentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [content, searchTerm, typeFilter]);

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedContent(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedContent(null);
    setFormData({ title: '', type: 'blog', keywords: '', content: '', status: 'draft' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      title: selectedContent.title || '',
      type: selectedContent.type || 'blog',
      keywords: selectedContent.keywords || '',
      content: selectedContent.content || '',
      status: selectedContent.status || 'draft'
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
      await deleteDoc(doc(db, 'content', selectedContent.id));
      setSnackbar({ open: true, message: 'Content deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      setSnackbar({ open: true, message: 'Error deleting content', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedContent?.id) {
        await updateDoc(doc(db, 'content', selectedContent.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Content updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'content'), {
          ...formData,
          views: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Content created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Error saving content:', error);
      setSnackbar({ open: true, message: 'Error saving content', severity: 'error' });
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
                placeholder="Search content..."
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {CONTENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
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
                Create Content
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredContent.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm || typeFilter !== 'all'
                    ? 'No content matches your filters'
                    : 'No content yet. Click "Create Content" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredContent.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.type}
                        size="small"
                        sx={{ mb: 1, textTransform: 'capitalize' }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Keywords: {item.keywords || 'None'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Views: {item.views || 0}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, item)}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContent ? 'Edit Content' : 'Create New Content'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  {CONTENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SEO Keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="credit repair, credit score"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                multiline
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedContent ? 'Update' : 'Create'} Content
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this content? This action cannot be undone.
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

export default ContentTab;
