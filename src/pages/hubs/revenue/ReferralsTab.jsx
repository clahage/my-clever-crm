// Path: /src/pages/hubs/revenue/ReferralsTab.jsx
// ============================================================================
// REVENUE HUB - REFERRALS TAB
// ============================================================================
// Purpose: Referral tracking and rewards management
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
  Tabs,
  Tab
} from '@mui/material';
import {
  Users,
  Plus,
  Copy,
  TrendingUp,
  DollarSign,
  Gift,
  Share2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, query, onSnapshot, addDoc, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ReferralsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [formData, setFormData] = useState({
    referrerName: '',
    referrerEmail: '',
    referredName: '',
    referredEmail: '',
    reward: '50',
    status: 'pending'
  });

  useEffect(() => {
    const referralsQuery = query(
      collection(db, 'referrals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(referralsQuery, (snapshot) => {
      const referralsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReferrals(referralsData);

      // Generate chart data
      const conversionsByMonth = {};
      referralsData.filter(r => r.status === 'converted').forEach(referral => {
        const date = referral.createdAt?.toDate();
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          conversionsByMonth[monthKey] = (conversionsByMonth[monthKey] || 0) + 1;
        }
      });

      const chartData = Object.entries(conversionsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, count]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          conversions: count
        }));

      setChartData(chartData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching referrals:', error);
      setSnackbar({ open: true, message: 'Error loading referrals', severity: 'error' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    try {
      // Generate unique referral code
      const referralCode = `REF${Date.now().toString(36).toUpperCase()}`;

      await addDoc(collection(db, 'referrals'), {
        ...formData,
        reward: parseFloat(formData.reward),
        referralCode,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.uid
      });

      setSnackbar({ open: true, message: 'Referral created successfully', severity: 'success' });
      setOpenDialog(false);
      setFormData({
        referrerName: '',
        referrerEmail: '',
        referredName: '',
        referredEmail: '',
        reward: '50',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error creating referral:', error);
      setSnackbar({ open: true, message: 'Error creating referral', severity: 'error' });
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(`https://speedycrm.com/ref/${code}`);
    setSnackbar({ open: true, message: 'Referral link copied to clipboard', severity: 'success' });
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    totalRewards: referrals.filter(r => r.status === 'converted').reduce((sum, r) => sum + (r.reward || 0), 0),
    conversionRate: referrals.length > 0
      ? ((referrals.filter(r => r.status === 'converted').length / referrals.length) * 100).toFixed(1)
      : 0
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
          Referral Engine
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
        >
          Create Referral
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
                    Total Referrals
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.total}
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
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Converted
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {stats.converted}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.50', color: 'success.main' }}>
                  <CheckCircle size={24} />
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
                    Total Rewards
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ${stats.totalRewards}
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
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.conversionRate}%
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50', color: 'info.main' }}>
                  <TrendingUp size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Referrals" />
          <Tab label="Analytics" />
          <Tab label="Reward Tiers" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Referrer</TableCell>
                  <TableCell>Referred</TableCell>
                  <TableCell>Referral Code</TableCell>
                  <TableCell align="right">Reward</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referrals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No referrals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {referral.referrerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {referral.referrerEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {referral.referredName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {referral.referredEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={referral.referralCode} size="small" />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(referral.referralCode)}
                          >
                            <Copy size={14} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${(referral.reward || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {referral.createdAt?.toDate ? referral.createdAt.toDate().toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={referral.status}
                          size="small"
                          color={
                            referral.status === 'converted' ? 'success' :
                            referral.status === 'pending' ? 'warning' : 'default'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" title="Share">
                          <Share2 size={16} />
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Referral Conversions Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Referral Reward Tiers
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tier</TableCell>
                  <TableCell>Conversions Required</TableCell>
                  <TableCell align="right">Reward per Referral</TableCell>
                  <TableCell align="right">Bonus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Chip label="Starter" size="small" color="default" />
                  </TableCell>
                  <TableCell>0-5</TableCell>
                  <TableCell align="right">$50</TableCell>
                  <TableCell align="right">-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Bronze" size="small" sx={{ bgcolor: '#CD7F32', color: 'white' }} />
                  </TableCell>
                  <TableCell>6-15</TableCell>
                  <TableCell align="right">$75</TableCell>
                  <TableCell align="right">$100</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Silver" size="small" sx={{ bgcolor: '#C0C0C0', color: 'white' }} />
                  </TableCell>
                  <TableCell>16-30</TableCell>
                  <TableCell align="right">$100</TableCell>
                  <TableCell align="right">$250</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Gold" size="small" sx={{ bgcolor: '#FFD700', color: 'white' }} />
                  </TableCell>
                  <TableCell>31+</TableCell>
                  <TableCell align="right">$150</TableCell>
                  <TableCell align="right">$500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Referral Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Referral</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Referrer Information
            </Typography>
            <TextField
              label="Referrer Name"
              fullWidth
              value={formData.referrerName}
              onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
            />
            <TextField
              label="Referrer Email"
              fullWidth
              type="email"
              value={formData.referrerEmail}
              onChange={(e) => setFormData({ ...formData, referrerEmail: e.target.value })}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Referred Person Information
            </Typography>
            <TextField
              label="Referred Name"
              fullWidth
              value={formData.referredName}
              onChange={(e) => setFormData({ ...formData, referredName: e.target.value })}
            />
            <TextField
              label="Referred Email"
              fullWidth
              type="email"
              value={formData.referredEmail}
              onChange={(e) => setFormData({ ...formData, referredEmail: e.target.value })}
            />

            <TextField
              label="Reward Amount ($)"
              fullWidth
              type="number"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="converted">Converted</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create</Button>
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

export default ReferralsTab;
