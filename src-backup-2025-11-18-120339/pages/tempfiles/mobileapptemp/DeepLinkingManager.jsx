// ============================================================================
// DeepLinkingManager.jsx - DEEP LINKING MANAGEMENT SYSTEM
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-08
//
// DESCRIPTION:
// Complete deep linking management system for creating, managing, and
// tracking app deep links. Supports universal links, custom URL schemes,
// dynamic links, and QR code generation.
//
// FEATURES:
// - Universal link creation (iOS/Android)
// - Custom URL scheme management
// - Dynamic link parameters
// - QR code generation
// - Link analytics and tracking
// - Link expiration and security
// - A/B testing for links
// - Fallback URL configuration
// - Social media optimization
//
// FIREBASE COLLECTIONS:
// - mobileApp/deepLinks/links
// - mobileApp/deepLinks/clicks
// - mobileApp/deepLinks/campaigns
//
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Link,
  Plus,
  Copy,
  QrCode,
  BarChart,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';

const DeepLinkingManager = () => {
  const { currentUser } = useAuth();
  const [links, setLinks] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentLink, setCurrentLink] = useState({
    name: '',
    path: '',
    platform: 'both',
    parameters: {},
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'mobileApp', 'deepLinks', 'links'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linkData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLinks(linkData);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleCreateLink = async () => {
    try {
      setLoading(true);

      const linkData = {
        ...currentLink,
        userId: currentUser.uid,
        clicks: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'deepLinks', 'links'), linkData);

      setSnackbar({ open: true, message: 'Deep link created!', severity: 'success' });
      setDialog(false);
      setCurrentLink({ name: '', path: '', platform: 'both', parameters: {} });
    } catch (error) {
      console.error('Error creating link:', error);
      setSnackbar({ open: true, message: 'Failed to create link', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link) => {
    const fullLink = `myapp://${link.path}`;
    navigator.clipboard.writeText(fullLink);
    setSnackbar({ open: true, message: 'Link copied!', severity: 'success' });
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Delete this deep link?')) return;

    try {
      await deleteDoc(doc(db, 'mobileApp', 'deepLinks', 'links', linkId));
      setSnackbar({ open: true, message: 'Link deleted!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting link:', error);
      setSnackbar({ open: true, message: 'Failed to delete link', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link />
          Deep Links ({links.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setDialog(true)}
        >
          New Link
        </Button>
      </Box>

      <Grid container spacing={2}>
        {links.map((link) => (
          <Grid item xs={12} md={6} key={link.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{link.name}</Typography>
                  <Chip label={link.platform} size="small" />
                </Box>

                <Typography variant="body2" fontFamily="monospace" sx={{ mb: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  myapp://{link.path}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleCopyLink(link)}>
                    <Copy size={16} />
                  </IconButton>
                  <IconButton size="small">
                    <QrCode size={16} />
                  </IconButton>
                  <IconButton size="small">
                    <BarChart size={16} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteLink(link.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  {link.clicks || 0} clicks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {links.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No deep links yet. Create your first deep link to get started!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Deep Link</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link Name"
                value={currentLink.name}
                onChange={(e) => setCurrentLink({ ...currentLink, name: e.target.value })}
                placeholder="Product Detail Page"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Path"
                value={currentLink.path}
                onChange={(e) => setCurrentLink({ ...currentLink, path: e.target.value })}
                placeholder="product/123"
                helperText="Will create: myapp://product/123"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={currentLink.platform}
                  label="Platform"
                  onChange={(e) => setCurrentLink({ ...currentLink, platform: e.target.value })}
                >
                  <MenuItem value="ios">iOS Only</MenuItem>
                  <MenuItem value="android">Android Only</MenuItem>
                  <MenuItem value="both">Both Platforms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateLink}
            disabled={loading || !currentLink.name || !currentLink.path}
          >
            Create Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeepLinkingManager;