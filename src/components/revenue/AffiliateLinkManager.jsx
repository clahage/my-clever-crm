// ============================================================================
// AFFILIATE LINK MANAGER - MANAGE AFFILIATE PRODUCTS & SERVICES
// ============================================================================
// Configure affiliate links that get integrated into credit reviews
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Link as LinkIcon,
  Add,
  Edit,
  Delete,
  Visibility,
  ContentCopy,
  TrendingUp,
  AttachMoney,
  CreditCard,
  DirectionsCar,
  School,
  Security,
  Assessment,
  Refresh,
  CheckCircle,
  OpenInNew,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Category Icons & Colors
const CATEGORY_CONFIG = {
  secured_credit_card: { icon: CreditCard, color: '#3b82f6', label: 'Secured Credit Card' },
  credit_builder_loan: { icon: AttachMoney, color: '#22c55e', label: 'Credit Builder Loan' },
  authorized_user: { icon: Security, color: '#8b5cf6', label: 'Authorized User' },
  credit_monitoring: { icon: Assessment, color: '#06b6d4', label: 'Credit Monitoring' },
  debt_consolidation: { icon: TrendingUp, color: '#f59e0b', label: 'Debt Consolidation' },
  balance_transfer: { icon: CreditCard, color: '#ec4899', label: 'Balance Transfer' },
  auto_refinance: { icon: DirectionsCar, color: '#10b981', label: 'Auto Refinance' },
  financial_education: { icon: School, color: '#6366f1', label: 'Financial Education' },
};

// Stats Card
const StatsCard = ({ icon: Icon, title, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">{title}</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AffiliateLinkManager = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    category: '',
    url: '',
    description: '',
    commission: '',
    active: true,
  });

  // Load links
  const loadLinks = async () => {
    setLoading(true);
    try {
      const getLinks = httpsCallable(functions, 'getAffiliateLinks');
      const result = await getLinks({});
      if (result.data.success) {
        setLinks(result.data.links);
        setCategories(result.data.categories);
      }
    } catch (err) {
      console.error('Load links error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  // Handle form change
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Open dialog for new/edit
  const openDialog = (link = null) => {
    if (link) {
      setEditingLink(link);
      setForm({
        name: link.name,
        category: link.category,
        url: link.url,
        description: link.description || '',
        commission: link.commission || '',
        active: link.active !== false,
      });
    } else {
      setEditingLink(null);
      setForm({
        name: '',
        category: '',
        url: '',
        description: '',
        commission: '',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  // Save link
  const saveLink = async () => {
    if (!form.name || !form.category || !form.url) {
      setError('Name, category, and URL are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const save = httpsCallable(functions, 'saveAffiliateLink');
      const result = await save({
        linkId: editingLink?.id || null,
        ...form,
      });

      if (result.data.success) {
        setSuccess(`Affiliate link ${result.data.action}!`);
        setDialogOpen(false);
        loadLinks();
      }
    } catch (err) {
      console.error('Save link error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Copy URL to clipboard
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setSuccess('URL copied to clipboard!');
  };

  // Calculate stats
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
  const activeLinks = links.filter(l => l.active).length;

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <LinkIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Affiliate Link Manager
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Manage affiliate products for credit review integration
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialog()}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              Add Affiliate Link
            </Button>
            <IconButton onClick={loadLinks} sx={{ color: 'white' }}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatsCard icon={LinkIcon} title="Total Links" value={links.length} color="#059669" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard icon={CheckCircle} title="Active Links" value={activeLinks} color="#22c55e" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard icon={Visibility} title="Total Clicks" value={totalClicks} color="#3b82f6" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard icon={AttachMoney} title="Conversions" value={totalConversions} color="#f59e0b" />
        </Grid>
      </Grid>

      {/* Links Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell align="center">Clicks</TableCell>
                  <TableCell align="center">Conversions</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {links.map((link) => {
                  const catConfig = CATEGORY_CONFIG[link.category] || {};
                  const CatIcon = catConfig.icon || LinkIcon;
                  return (
                    <TableRow key={link.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: `${catConfig.color}20`, color: catConfig.color, width: 32, height: 32 }}>
                            <CatIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{link.name}</Typography>
                            {link.description && (
                              <Typography variant="caption" color="text.secondary">
                                {link.description.substring(0, 50)}...
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={catConfig.label || link.category}
                          size="small"
                          sx={{ bgcolor: `${catConfig.color}20`, color: catConfig.color }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {link.url.substring(0, 40)}...
                          </Typography>
                          <Tooltip title="Copy URL">
                            <IconButton size="small" onClick={() => copyUrl(link.url)}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open Link">
                            <IconButton size="small" href={link.url} target="_blank">
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={link.clicks || 0} color="primary" max={999}>
                          <Visibility color="action" />
                        </Badge>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {link.conversions || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={link.active ? 'Active' : 'Inactive'}
                          size="small"
                          color={link.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openDialog(link)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {links.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <LinkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary">
                        No affiliate links yet. Click "Add Affiliate Link" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLink ? 'Edit Affiliate Link' : 'Add Affiliate Link'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link Name"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="e.g., Capital One Secured Mastercard"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={form.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <config.icon sx={{ color: config.color }} />
                        {config.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Affiliate URL"
                value={form.url}
                onChange={(e) => handleFormChange('url', e.target.value)}
                placeholder="https://partner.example.com/your-affiliate-link"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief description of this product/service..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Commission"
                value={form.commission}
                onChange={(e) => handleFormChange('commission', e.target.value)}
                placeholder="e.g., $50 per signup"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveLink}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {editingLink ? 'Update' : 'Save'} Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AffiliateLinkManager;
