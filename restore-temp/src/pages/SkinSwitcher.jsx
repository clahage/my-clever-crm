// src/pages/SkinSwitcher.jsx - Branding & Theme Customization
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Snackbar, Alert, Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Slider, Divider, Stack, Chip, IconButton
} from '@mui/material';
import {
  Palette, Eye, Save, RotateCcw, Upload, Download, Sun, Moon,
  Smartphone, Monitor, Type, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SkinSwitcher = () => {
  const { currentUser } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [brandingSettings, setBrandingSettings] = useState({
    // Company Info
    companyName: 'Speedy Credit Repair',
    tagline: 'It Only Gets Better From Here',
    logo: '',
    logoWidth: 180,
    favicon: '',
    
    // Colors
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    surfaceColor: '#F9FAFB',
    textPrimaryColor: '#111827',
    textSecondaryColor: '#6B7280',
    errorColor: '#EF4444',
    warningColor: '#F59E0B',
    successColor: '#10B981',
    infoColor: '#3B82F6',
    
    // Typography
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    headingFont: 'Inter, system-ui, sans-serif',
    
    // Theme Mode
    defaultTheme: 'light', // light, dark, auto
    
    // Layout
    borderRadius: 8,
    sidebarWidth: 280,
    headerHeight: 64,
    
    // Custom CSS
    customCSS: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const colorPresets = {
    default: {
      name: 'Default Blue',
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B'
    },
    purple: {
      name: 'Purple Dreams',
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B'
    },
    green: {
      name: 'Nature Green',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      accentColor: '#F59E0B'
    },
    ocean: {
      name: 'Ocean Blue',
      primaryColor: '#0EA5E9',
      secondaryColor: '#06B6D4',
      accentColor: '#F97316'
    },
    sunset: {
      name: 'Sunset Orange',
      primaryColor: '#F97316',
      secondaryColor: '#EF4444',
      accentColor: '#F59E0B'
    }
  };

  const fontFamilies = [
    'Inter, system-ui, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Raleway, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif'
  ];

  // Load branding settings
  const loadBrandingSettings = async () => {
    try {
      const docRef = doc(db, 'branding', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setBrandingSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadBrandingSettings();
    }
  }, [currentUser]);

  // Save branding settings
  const handleSave = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'branding', currentUser.uid);
      await setDoc(docRef, {
        ...brandingSettings,
        updatedAt: new Date()
      });
      
      showSnackbar('Branding settings saved successfully!', 'success');
      
      // Apply changes immediately
      applyBranding();
    } catch (error) {
      console.error('Error saving branding:', error);
      showSnackbar('Error saving branding settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply branding to page
  const applyBranding = () => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary-color', brandingSettings.primaryColor);
    root.style.setProperty('--secondary-color', brandingSettings.secondaryColor);
    root.style.setProperty('--accent-color', brandingSettings.accentColor);
    root.style.setProperty('--background-color', brandingSettings.backgroundColor);
    root.style.setProperty('--surface-color', brandingSettings.surfaceColor);
    root.style.setProperty('--text-primary', brandingSettings.textPrimaryColor);
    root.style.setProperty('--text-secondary', brandingSettings.textSecondaryColor);
    
    // Apply typography
    root.style.setProperty('--font-family', brandingSettings.fontFamily);
    root.style.setProperty('--font-size-base', `${brandingSettings.fontSize}px`);
    root.style.setProperty('--heading-font', brandingSettings.headingFont);
    
    // Apply layout
    root.style.setProperty('--border-radius', `${brandingSettings.borderRadius}px`);
    
    // Apply custom CSS
    if (brandingSettings.customCSS) {
      let styleTag = document.getElementById('custom-branding-styles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'custom-branding-styles';
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = brandingSettings.customCSS;
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setBrandingSettings({
        companyName: 'Speedy Credit Repair',
        tagline: 'It Only Gets Better From Here',
        logo: '',
        logoWidth: 180,
        favicon: '',
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        surfaceColor: '#F9FAFB',
        textPrimaryColor: '#111827',
        textSecondaryColor: '#6B7280',
        errorColor: '#EF4444',
        warningColor: '#F59E0B',
        successColor: '#10B981',
        infoColor: '#3B82F6',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        headingFont: 'Inter, system-ui, sans-serif',
        defaultTheme: 'light',
        borderRadius: 8,
        sidebarWidth: 280,
        headerHeight: 64,
        customCSS: ''
      });
    }
  };

  // Apply color preset
  const applyPreset = (preset) => {
    setBrandingSettings(prev => ({
      ...prev,
      ...preset
    }));
  };

  // Export settings
  const handleExport = () => {
    const dataStr = JSON.stringify(brandingSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'branding-settings.json';
    link.click();
  };

  // Import settings
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setBrandingSettings(prev => ({ ...prev, ...imported }));
          showSnackbar('Settings imported successfully', 'success');
        } catch (error) {
          showSnackbar('Error importing settings', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Apply changes in preview
  useEffect(() => {
    if (previewMode) {
      applyBranding();
    }
  }, [brandingSettings, previewMode]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Branding & Theme
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize your CRM appearance
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Eye size={20} />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={20} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={20} />}
            onClick={handleSave}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>

      {previewMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Preview mode is active. Changes are visible but not saved until you click "Save Changes".
        </Alert>
      )}

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Colors" />
          <Tab label="Typography" />
          <Tab label="Logo & Branding" />
          <Tab label="Layout" />
          <Tab label="Advanced" />
        </Tabs>

        {/* Colors Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Color Presets</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {Object.entries(colorPresets).map(([key, preset]) => (
                <Grid item xs={12} md={4} lg={2.4} key={key}>
                  <Card 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => applyPreset(preset)}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {preset.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Box 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            borderRadius: 1,
                            bgcolor: preset.primaryColor 
                          }} 
                        />
                        <Box 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            borderRadius: 1,
                            bgcolor: preset.secondaryColor 
                          }} 
                        />
                        <Box 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            borderRadius: 1,
                            bgcolor: preset.accentColor 
                          }} 
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom>Custom Colors</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Primary Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.primaryColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Secondary Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.secondaryColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Accent Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.accentColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Success Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.successColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, successColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Warning Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.warningColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, warningColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Error Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.errorColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, errorColor: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Info Color"
                  fullWidth
                  type="color"
                  value={brandingSettings.infoColor}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, infoColor: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Typography Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Body Font Family</InputLabel>
                  <Select
                    value={brandingSettings.fontFamily}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                  >
                    {fontFamilies.map(font => (
                      <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                        {font.split(',')[0]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Heading Font Family</InputLabel>
                  <Select
                    value={brandingSettings.headingFont}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, headingFont: e.target.value }))}
                  >
                    {fontFamilies.map(font => (
                      <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                        {font.split(',')[0]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Base Font Size: {brandingSettings.fontSize}px</Typography>
                <Slider
                  value={brandingSettings.fontSize}
                  onChange={(e, value) => setBrandingSettings(prev => ({ ...prev, fontSize: value }))}
                  min={12}
                  max={18}
                  step={1}
                  marks
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Preview</Typography>
                <Box sx={{ fontFamily: brandingSettings.fontFamily, fontSize: `${brandingSettings.fontSize}px` }}>
                  <Typography variant="h1" sx={{ fontFamily: brandingSettings.headingFont }}>
                    Heading 1
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: brandingSettings.headingFont }}>
                    Heading 4
                  </Typography>
                  <Typography variant="body1">
                    Body text - The quick brown fox jumps over the lazy dog
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Secondary text - The quick brown fox jumps over the lazy dog
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Logo & Branding Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={brandingSettings.companyName}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Tagline"
                  fullWidth
                  value={brandingSettings.tagline}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, tagline: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Logo URL"
                  fullWidth
                  value={brandingSettings.logo}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
                <Typography variant="caption" color="text.secondary">
                  Enter a URL to your logo image (recommended: SVG or PNG with transparent background)
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Logo Width: {brandingSettings.logoWidth}px</Typography>
                <Slider
                  value={brandingSettings.logoWidth}
                  onChange={(e, value) => setBrandingSettings(prev => ({ ...prev, logoWidth: value }))}
                  min={100}
                  max={300}
                  step={10}
                />
              </Grid>

              {brandingSettings.logo && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Logo Preview</Typography>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <img 
                      src={brandingSettings.logo} 
                      alt="Logo" 
                      style={{ width: brandingSettings.logoWidth, height: 'auto' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Layout Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography gutterBottom>Border Radius: {brandingSettings.borderRadius}px</Typography>
                <Slider
                  value={brandingSettings.borderRadius}
                  onChange={(e, value) => setBrandingSettings(prev => ({ ...prev, borderRadius: value }))}
                  min={0}
                  max={24}
                  step={2}
                  marks
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Sidebar Width: {brandingSettings.sidebarWidth}px</Typography>
                <Slider
                  value={brandingSettings.sidebarWidth}
                  onChange={(e, value) => setBrandingSettings(prev => ({ ...prev, sidebarWidth: value }))}
                  min={200}
                  max={400}
                  step={20}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Header Height: {brandingSettings.headerHeight}px</Typography>
                <Slider
                  value={brandingSettings.headerHeight}
                  onChange={(e, value) => setBrandingSettings(prev => ({ ...prev, headerHeight: value }))}
                  min={48}
                  max={96}
                  step={8}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Default Theme</InputLabel>
                  <Select
                    value={brandingSettings.defaultTheme}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, defaultTheme: e.target.value }))}
                  >
                    <MenuItem value="light">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sun size={16} />
                        Light Mode
                      </Box>
                    </MenuItem>
                    <MenuItem value="dark">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Moon size={16} />
                        Dark Mode
                      </Box>
                    </MenuItem>
                    <MenuItem value="auto">Auto (System Preference)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Advanced Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Custom CSS</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add custom CSS to override default styles. Be careful - invalid CSS can break the layout.
                </Typography>
                <TextField
                  multiline
                  rows={10}
                  fullWidth
                  value={brandingSettings.customCSS}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                  placeholder=".my-custom-class { color: red; }"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Import/Export Settings</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Download size={20} />}
                    onClick={handleExport}
                  >
                    Export Settings
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload size={20} />}
                  >
                    Import Settings
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={handleImport}
                    />
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SkinSwitcher;