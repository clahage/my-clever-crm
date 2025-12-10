// Path: /src/pages/hubs/comms/LandingTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - LANDING PAGES TAB
// ============================================================================
// Purpose: Website and landing page management
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
  Eye,
  ExternalLink
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const LandingTab = () => {
  const { userProfile } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    status: 'draft'
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const q = query(collection(db, 'landingPages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPages(pagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.url?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pages, searchTerm]);

  const handleMenuOpen = (event, page) => {
    setAnchorEl(event.currentTarget);
    setSelectedPage(page);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = () => {
    setSelectedPage(null);
    setFormData({ title: '', url: '', description: '', status: 'draft' });
    setDialogOpen(true);
  };

  const handleEdit = () => {
    setFormData({
      title: selectedPage.title || '',
      url: selectedPage.url || '',
      description: selectedPage.description || '',
      status: selectedPage.status || 'draft'
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
      await deleteDoc(doc(db, 'landingPages', selectedPage.id));
      setSnackbar({ open: true, message: 'Landing page deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Error deleting page:', error);
      setSnackbar({ open: true, message: 'Error deleting page', severity: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedPage?.id) {
        await updateDoc(doc(db, 'landingPages', selectedPage.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Landing page updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'landingPages'), {
          ...formData,
          visits: 0,
          conversions: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Landing page created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      setSnackbar({ open: true, message: 'Error saving page', severity: 'error' });
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                placeholder="Search landing pages..."
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
                Create Landing Page
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {filteredPages.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {searchTerm
                    ? 'No landing pages match your search'
                    : 'No landing pages yet. Click "Create Landing Page" to get started.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredPages.map((page) => (
            <Grid item xs={12} md={6} key={page.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {page.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Globe size={14} />
                        <Typography variant="body2" color="text.secondary">
                          {page.url}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {page.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Visits: {page.visits || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Conversions: {page.conversions || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, page)}>
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
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <ExternalLink size={16} style={{ marginRight: 8 }} />
          Open
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
          {selectedPage ? 'Edit Landing Page' : 'Create New Landing Page'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Page Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Slug"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="my-landing-page"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedPage ? 'Update' : 'Create'} Page
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this landing page? This action cannot be undone.
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

export default LandingTab;
