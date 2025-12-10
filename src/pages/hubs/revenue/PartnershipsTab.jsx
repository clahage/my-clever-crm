// Path: /src/pages/hubs/revenue/PartnershipsTab.jsx
// ============================================================================
// REVENUE HUB - PARTNERSHIPS TAB
// ============================================================================
// Purpose: Partnership revenue tracking and management
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
  InputAdornment
} from '@mui/material';
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PartnershipsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerships, setPartnerships] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [chartData, setChartData] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    type: 'revenue_share',
    revSharePercentage: '20',
    monthlyValue: '',
    status: 'active',
    startDate: '',
    description: ''
  });

  useEffect(() => {
    const partnershipsQuery = query(
      collection(db, 'partnerships'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(partnershipsQuery, (snapshot) => {
      const partnershipsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPartnerships(partnershipsData);

      // Generate chart data by type
      const revenueByType = {};
      partnershipsData.forEach(partnership => {
        if (partnership.status === 'active') {
          const type = partnership.type || 'other';
          const value = partnership.monthlyValue || 0;
          revenueByType[type] = (revenueByType[type] || 0) + value;
        }
      });

      const chartData = Object.entries(revenueByType).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));

      setChartData(chartData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching partnerships:', error);
      setSnackbar({ open: true, message: 'Error loading partnerships', severity: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (partnership = null) => {
    if (partnership) {
      setEditingPartnership(partnership);
      setFormData({
        companyName: partnership.companyName || '',
        contactName: partnership.contactName || '',
        contactEmail: partnership.contactEmail || '',
        type: partnership.type || 'revenue_share',
        revSharePercentage: partnership.revSharePercentage || '20',
        monthlyValue: partnership.monthlyValue || '',
        status: partnership.status || 'active',
        startDate: partnership.startDate?.toDate ? partnership.startDate.toDate().toISOString().split('T')[0] : '',
        description: partnership.description || ''
      });
    } else {
      setEditingPartnership(null);
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        type: 'revenue_share',
        revSharePercentage: '20',
        monthlyValue: '',
        status: 'active',
        startDate: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const partnershipData = {
        ...formData,
        revSharePercentage: parseFloat(formData.revSharePercentage),
        monthlyValue: parseFloat(formData.monthlyValue || 0),
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        updatedAt: serverTimestamp()
      };

      if (editingPartnership) {
        await updateDoc(doc(db, 'partnerships', editingPartnership.id), partnershipData);
        setSnackbar({ open: true, message: 'Partnership updated successfully', severity: 'success' });
      } else {
        await addDoc(collection(db, 'partnerships'), {
          ...partnershipData,
          totalRevenue: 0,
          createdAt: serverTimestamp(),
          createdBy: userProfile?.uid
        });
        setSnackbar({ open: true, message: 'Partnership created successfully', severity: 'success' });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving partnership:', error);
      setSnackbar({ open: true, message: 'Error saving partnership', severity: 'error' });
    }
  };

  const handleDelete = async (partnershipId) => {
    if (window.confirm('Are you sure you want to delete this partnership?')) {
      try {
        await deleteDoc(doc(db, 'partnerships', partnershipId));
        setSnackbar({ open: true, message: 'Partnership deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting partnership:', error);
        setSnackbar({ open: true, message: 'Error deleting partnership', severity: 'error' });
      }
    }
  };

  const stats = {
    total: partnerships.length,
    active: partnerships.filter(p => p.status === 'active').length,
    pending: partnerships.filter(p => p.status === 'pending').length,
    totalMonthlyRevenue: partnerships
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + (p.monthlyValue || 0), 0),
    totalRevenue: partnerships.reduce((sum, p) => sum + (p.totalRevenue || 0), 0)
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
          Revenue Partnerships
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
        >
          Add Partnership
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Partners
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.active}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50', color: 'success.main' }}>
                  <Handshake size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main' }}>
                  <Clock size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ${stats.totalMonthlyRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main' }}>
                  <DollarSign size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50', color: 'success.main' }}>
                  <TrendingUp size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue by Type Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue by Partnership Type
              </Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No partnership data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Partnership Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Performing Partners
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Partner</TableCell>
                    <TableCell align="right">Monthly Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerships
                    .filter(p => p.status === 'active')
                    .sort((a, b) => (b.monthlyValue || 0) - (a.monthlyValue || 0))
                    .slice(0, 5)
                    .map((partnership) => (
                      <TableRow key={partnership.id}>
                        <TableCell>{partnership.companyName}</TableCell>
                        <TableCell align="right">
                          ${(partnership.monthlyValue || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  {partnerships.filter(p => p.status === 'active').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No active partnerships
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Partnerships Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Rev Share %</TableCell>
                <TableCell align="right">Monthly Value</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partnerships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      No partnerships found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partnerships.map((partnership) => (
                  <TableRow key={partnership.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building size={18} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {partnership.companyName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{partnership.contactName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partnership.contactEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partnership.type?.replace('_', ' ')}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">{partnership.revSharePercentage}%</TableCell>
                    <TableCell align="right">
                      ${(partnership.monthlyValue || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {partnership.startDate?.toDate ? partnership.startDate.toDate().toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={partnership.status}
                        size="small"
                        color={partnership.status === 'active' ? 'success' : 'warning'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(partnership)}>
                        <Edit size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(partnership.id)}>
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPartnership ? 'Edit Partnership' : 'Add Partnership'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Company Name"
              fullWidth
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Name"
                  fullWidth
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Email"
                  fullWidth
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              select
              label="Partnership Type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="revenue_share">Revenue Share</MenuItem>
              <MenuItem value="referral">Referral</MenuItem>
              <MenuItem value="reseller">Reseller</MenuItem>
              <MenuItem value="integration">Integration</MenuItem>
              <MenuItem value="strategic">Strategic</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Revenue Share %"
                  fullWidth
                  type="number"
                  value={formData.revSharePercentage}
                  onChange={(e) => setFormData({ ...formData, revSharePercentage: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Monthly Value"
                  fullWidth
                  type="number"
                  value={formData.monthlyValue}
                  onChange={(e) => setFormData({ ...formData, monthlyValue: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Date"
                  fullWidth
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="ended">Ended</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPartnership ? 'Update' : 'Add'}
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

export default PartnershipsTab;
