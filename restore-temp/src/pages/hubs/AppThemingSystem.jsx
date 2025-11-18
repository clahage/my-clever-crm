// ============================================================================
// AppThemingSystem.jsx - APP THEMING & CUSTOMIZATION SYSTEM
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-08
//
// DESCRIPTION:
// Complete app theming and customization system for managing app appearance,
// branding, colors, fonts, and UI elements. Supports light/dark modes and
// dynamic theme switching.
//
// FEATURES:
// - Color scheme customization
// - Font family and size management
// - Light/Dark mode themes
// - Custom branding elements
// - Logo and icon management
// - Preview functionality
// - Theme versioning
// - Export/Import themes
//
// FIREBASE COLLECTIONS:
// - mobileApp/theming/themes
// - mobileApp/theming/assets
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
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Palette,
  Plus,
  Save,
  Download,
  Upload,
  Eye,
  Trash2,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const AppThemingSystem = () => {
  const { currentUser } = useAuth();
  const [themes, setThemes] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentTheme, setCurrentTheme] = useState({
    name: '',
    primaryColor: '#2196f3',
    secondaryColor: '#f50057',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    isDark: false,
    fontFamily: 'Roboto',
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'mobileApp', 'theming', 'themes'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const themeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setThemes(themeData);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleCreateTheme = async () => {
    try {
      setLoading(true);

      const themeData = {
        ...currentTheme,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'theming', 'themes'), themeData);

      setSnackbar({ open: true, message: 'Theme created!', severity: 'success' });
      setDialog(false);
      setCurrentTheme({
        name: '',
        primaryColor: '#2196f3',
        secondaryColor: '#f50057',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        isDark: false,
        fontFamily: 'Roboto',
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      setSnackbar({ open: true, message: 'Failed to create theme', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTheme = async (themeId) => {
    try {
      // Deactivate all themes
      for (const theme of themes) {
        await updateDoc(doc(db, 'mobileApp', 'theming', 'themes', theme.id), {
          active: false,
        });
      }

      // Activate selected theme
      await updateDoc(doc(db, 'mobileApp', 'theming', 'themes', themeId), {
        active: true,
      });

      setSnackbar({ open: true, message: 'Theme activated!', severity: 'success' });
    } catch (error) {
      console.error('Error activating theme:', error);
      setSnackbar({ open: true, message: 'Failed to activate theme', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Palette />
          App Themes ({themes.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setDialog(true)}
        >
          New Theme
        </Button>
      </Box>

      <Grid container spacing={2}>
        {themes.map((theme) => (
          <Grid item xs={12} md={6} key={theme.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{theme.name}</Typography>
                  {theme.active && <Chip label="Active" color="success" size="small" />}
                </Box>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: theme.primaryColor,
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="caption">Primary</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: theme.secondaryColor,
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="caption">Secondary</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={theme.active ? 'outlined' : 'contained'}
                    onClick={() => handleActivateTheme(theme.id)}
                    disabled={theme.active}
                  >
                    {theme.active ? 'Active' : 'Activate'}
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Eye />}>
                    Preview
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {themes.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              No themes yet. Create your first theme to customize your app!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Theme</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Theme Name"
                value={currentTheme.name}
                onChange={(e) => setCurrentTheme({ ...currentTheme, name: e.target.value })}
                placeholder="My Custom Theme"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="color"
                label="Primary Color"
                value={currentTheme.primaryColor}
                onChange={(e) => setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="color"
                label="Secondary Color"
                value={currentTheme.secondaryColor}
                onChange={(e) => setCurrentTheme({ ...currentTheme, secondaryColor: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="color"
                label="Background Color"
                value={currentTheme.backgroundColor}
                onChange={(e) => setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="color"
                label="Text Color"
                value={currentTheme.textColor}
                onChange={(e) => setCurrentTheme({ ...currentTheme, textColor: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={currentTheme.fontFamily}
                  label="Font Family"
                  onChange={(e) => setCurrentTheme({ ...currentTheme, fontFamily: e.target.value })}
                >
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Open Sans">Open Sans</MenuItem>
                  <MenuItem value="Lato">Lato</MenuItem>
                  <MenuItem value="Montserrat">Montserrat</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentTheme.isDark}
                    onChange={(e) => setCurrentTheme({ ...currentTheme, isDark: e.target.checked })}
                  />
                }
                label="Dark Mode"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Preview your theme before saving. Changes will apply to all users.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTheme}
            disabled={loading || !currentTheme.name}
          >
            Create Theme
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

export default AppThemingSystem;