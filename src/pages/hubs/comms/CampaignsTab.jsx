// Path: /src/pages/hubs/comms/CampaignsTab.jsx
// ============================================================================
// COMMUNICATIONS HUB - CAMPAIGNS TAB
// ============================================================================
// Purpose: Multi-step email campaigns with targeting and analytics
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
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
  Grid,
  Alert,
  Snackbar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Search,
  Plus,
  Edit,
  Delete,
  MoreVertical,
  Target,
  Users,
  Send,
  Pause,
  Play,
  Eye,
  BarChart,
  TrendingUp
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const CAMPAIGN_TYPES = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'nurture', label: 'Nurture Campaign' },
  { value: 'welcome', label: 'Welcome Series' },
  { value: 'reengagement', label: 'Re-engagement' }
];

const CampaignsTab = () => {
  const { userProfile } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'newsletter',
    status: 'draft',
    targetAudience: '',
    steps: 1
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Subscribe to campaigns
  useEffect(() => {
    const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const campaignsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtered and searched campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch =
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.targetAudience?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

  // Paginated campaigns
  const paginatedCampaigns = useMemo(() => {
    return filteredCampaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCampaigns, page, rowsPerPage]);

  const handleMenuOpen = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setFormData({ name: '', type: 'newsletter', status: 'draft', targetAudience: '', steps: 1 });
    setDialogOpen(true);
  };

  const handleEditCampaign = () => {
    setFormData({
      name: selectedCampaign.name || '',
      type: selectedCampaign.type || 'newsletter',
      status: selectedCampaign.status || 'draft',
      targetAudience: selectedCampaign.targetAudience || '',
      steps: selectedCampaign.steps || 1
    });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCampaign = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'campaigns', selectedCampaign.id));
      setSnackbar({ open: true, message: 'Campaign deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setSnackbar({ open: true, message: 'Error deleting campaign', severity: 'error' });
    }
  };

  const handleSaveCampaign = async () => {
    try {
      if (selectedCampaign?.id) {
        // Update existing campaign
        await updateDoc(doc(db, 'campaigns', selectedCampaign.id), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userProfile?.email
        });
        setSnackbar({ open: true, message: 'Campaign updated successfully', severity: 'success' });
      } else {
        // Add new campaign
        await addDoc(collection(db, 'campaigns'), {
          ...formData,
          recipients: 0,
          sent: 0,
          opens: 0,
          clicks: 0,
          conversions: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.email,
          updatedAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: 'Campaign created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error saving campaign:', error);
      setSnackbar({ open: true, message: 'Error saving campaign', severity: 'error' });
    }
  };

  const handleToggleCampaign = async (campaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      await updateDoc(doc(db, 'campaigns', campaign.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setSnackbar({
        open: true,
        message: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling campaign:', error);
      setSnackbar({ open: true, message: 'Error updating campaign', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const calculateOpenRate = (campaign) => {
    if (campaign.sent === 0) return 0;
    return ((campaign.opens / campaign.sent) * 100).toFixed(1);
  };

  const calculateClickRate = (campaign) => {
    if (campaign.opens === 0) return 0;
    return ((campaign.clicks / campaign.opens) * 100).toFixed(1);
  };

  return (
    <Box>
      {/* Header Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search campaigns..."
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
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleCreateCampaign}
              >
                Create Campaign
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Open Rate</TableCell>
                <TableCell>Click Rate</TableCell>
                <TableCell>Conversions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm || statusFilter !== 'all'
                        ? 'No campaigns match your filters'
                        : 'No campaigns yet. Click "Create Campaign" to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {campaign.name || 'Unnamed Campaign'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {campaign.steps || 1} steps
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.type || 'newsletter'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status || 'draft'}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Users size={14} />
                        <Typography variant="body2">{campaign.recipients || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {calculateOpenRate(campaign)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(calculateOpenRate(campaign))}
                          sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {calculateClickRate(campaign)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={parseFloat(calculateClickRate(campaign))}
                          sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        {campaign.conversions || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {campaign.status === 'draft' ? (
                        <Tooltip title="Start Campaign">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleToggleCampaign(campaign)}
                          >
                            <Play size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : campaign.status === 'active' ? (
                        <Tooltip title="Pause Campaign">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleToggleCampaign(campaign)}
                          >
                            <Pause size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, campaign)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredCampaigns.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <Eye size={16} style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); }}>
          <BarChart size={16} style={{ marginRight: 8 }} />
          View Analytics
        </MenuItem>
        <MenuItem onClick={handleEditCampaign}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteCampaign} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Campaign Type"
                >
                  {CAMPAIGN_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Steps"
                type="number"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) })}
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Audience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., All active clients, New signups, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCampaign} variant="contained">
            {selectedCampaign ? 'Update' : 'Create'} Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default CampaignsTab;
