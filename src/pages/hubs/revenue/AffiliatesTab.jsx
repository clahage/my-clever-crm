// Path: /src/pages/hubs/revenue/AffiliatesTab.jsx
// ============================================================================
// REVENUE HUB - AFFILIATES TAB
// ============================================================================
// Purpose: Affiliate partner management and commission tracking
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Send,
  Copy
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const AffiliatesTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commissionRate: '10',
    status: 'active',
    paymentMethod: 'paypal'
  });

  useEffect(() => {
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(affiliatesQuery, (snapshot) => {
      const affiliatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAffiliates(affiliatesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching affiliates:', error);
      setSnackbar({ open: true, message: 'Error loading affiliates', severity: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (affiliate = null) => {
    if (affiliate) {
      setEditingAffiliate(affiliate);
      setFormData({
        name: affiliate.name || '',
        email: affiliate.email || '',
        phone: affiliate.phone || '',
        commissionRate: affiliate.commissionRate || '10',
        status: affiliate.status || 'active',
        paymentMethod: affiliate.paymentMethod || 'paypal'
      });
    } else {
      setEditingAffiliate(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        commissionRate: '10',
        status: 'active',
        paymentMethod: 'paypal'
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const affiliateData = {
        ...formData,
        commissionRate: parseFloat(formData.commissionRate),
        updatedAt: serverTimestamp()
      };

      if (editingAffiliate) {
        await updateDoc(doc(db, 'affiliates', editingAffiliate.id), affiliateData);
        setSnackbar({ open: true, message: 'Affiliate updated successfully', severity: 'success' });
      } else {
        // Generate unique affiliate code
        const affiliateCode = `AFF${Date.now().toString(36).toUpperCase()}`;
        await addDoc(collection(db, 'affiliates'), {
          ...affiliateData,
          affiliateCode,
          totalEarnings: 0,
          totalReferrals: 0,
          pendingCommission: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.uid
        });
        setSnackbar({ open: true, message: 'Affiliate created successfully', severity: 'success' });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving affiliate:', error);
      setSnackbar({ open: true, message: 'Error saving affiliate', severity: 'error' });
    }
  };

  const handleDelete = async (affiliateId) => {
    if (window.confirm('Are you sure you want to delete this affiliate?')) {
      try {
        await deleteDoc(doc(db, 'affiliates', affiliateId));
        setSnackbar({ open: true, message: 'Affiliate deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting affiliate:', error);
        setSnackbar({ open: true, message: 'Error deleting affiliate', severity: 'error' });
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setSnackbar({ open: true, message: 'Affiliate code copied to clipboard', severity: 'success' });
  };

  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.status === 'active').length,
    totalEarnings: affiliates.reduce((sum, a) => sum + (a.totalEarnings || 0), 0),
    pendingCommissions: affiliates.reduce((sum, a) => sum + (a.pendingCommission || 0), 0),
    totalReferrals: affiliates.reduce((sum, a) => sum + (a.totalReferrals || 0), 0)
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Affiliates Program
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
        >
          Add Affiliate
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Affiliates
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.active}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}>
                  <Users size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Referrals
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalReferrals}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50', color: 'info.main' }}>
                  <TrendingUp size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Paid
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ${stats.totalEarnings.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50', color: 'success.main' }}>
                  <DollarSign size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    ${stats.pendingCommissions.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main' }}>
                  <DollarSign size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.50', color: 'secondary.main' }}>
                  <Handshake size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Affiliates" />
          <Tab label="Commission Tiers" />
          <Tab label="Payouts" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Affiliate Code</TableCell>
                  <TableCell align="right">Commission Rate</TableCell>
                  <TableCell align="right">Total Referrals</TableCell>
                  <TableCell align="right">Total Earned</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No affiliates found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {affiliate.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={affiliate.affiliateCode} size="small" />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(affiliate.affiliateCode)}
                          >
                            <Copy size={14} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{affiliate.commissionRate}%</TableCell>
                      <TableCell align="right">{affiliate.totalReferrals || 0}</TableCell>
                      <TableCell align="right">
                        ${(affiliate.totalEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={affiliate.status}
                          size="small"
                          color={affiliate.status === 'active' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpenDialog(affiliate)}>
                          <Edit size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(affiliate.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Commission Tier Structure
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tier</TableCell>
                  <TableCell>Referrals Required</TableCell>
                  <TableCell align="right">Commission Rate</TableCell>
                  <TableCell align="right">Bonus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Chip label="Bronze" size="small" sx={{ bgcolor: '#CD7F32', color: 'white' }} />
                  </TableCell>
                  <TableCell>0-10</TableCell>
                  <TableCell align="right">10%</TableCell>
                  <TableCell align="right">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Silver" size="small" sx={{ bgcolor: '#C0C0C0', color: 'white' }} />
                  </TableCell>
                  <TableCell>11-25</TableCell>
                  <TableCell align="right">15%</TableCell>
                  <TableCell align="right">$100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Gold" size="small" sx={{ bgcolor: '#FFD700', color: 'white' }} />
                  </TableCell>
                  <TableCell>26-50</TableCell>
                  <TableCell align="right">20%</TableCell>
                  <TableCell align="right">$250</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Platinum" size="small" sx={{ bgcolor: '#E5E4E2', color: 'black' }} />
                  </TableCell>
                  <TableCell>51+</TableCell>
                  <TableCell align="right">25%</TableCell>
                  <TableCell align="right">$500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Payout Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage affiliate payouts and track payment history.
            </Typography>
            <Button variant="contained" fullWidth disabled>
              Process Pending Payouts (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Commission Rate (%)"
              fullWidth
              type="number"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>
              }}
            />
            <TextField
              select
              label="Payment Method"
              fullWidth
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="venmo">Venmo</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAffiliate ? 'Update' : 'Add'}
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

export default AffiliatesTab;
