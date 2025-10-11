// src/components/AffiliateProgramManager.jsx
// Complete Affiliate Program with Tracking, Commissions, Payouts, Analytics

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy, writeBatch
} from 'firebase/firestore';

import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar,
  List, ListItem, ListItemText, Divider, CircularProgress, Avatar,
  Stack, LinearProgress, CardHeader, CardActions, InputAdornment, Switch
} from '@mui/material';

import {
  Users, TrendingUp, DollarSign, Gift, Share2, Copy, Eye, Download,
  RefreshCw, Plus, Edit2, Trash2, Check, X, Clock, Calendar,
  Link as LinkIcon, Mail, Send, BarChart2, PieChart, Target,
  Award, Star, ThumbsUp, AlertCircle, CheckCircle, Settings
} from 'lucide-react';

import { Line, Bar, Doughnut } from 'react-chartjs-2';

const AffiliateProgramManager = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [tiers, setTiers] = useState([]);

  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    email: '',
    phone: '',
    tierId: '',
    paymentMethod: 'paypal',
    paymentEmail: '',
    referralCode: '',
    customCommission: '',
    notes: ''
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    commissionRate: 10,
    minReferrals: 0,
    description: '',
    benefits: '',
    color: '#3B82F6'
  });

  const [payoutForm, setPayoutForm] = useState({
    affiliateId: '',
    amount: '',
    method: 'paypal',
    notes: ''
  });

  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalReferrals: 0,
    conversionRate: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    totalPayouts: 0,
    avgCommissionPerAffiliate: 0
  });

  const [dateRange, setDateRange] = useState('30days');
  const [affiliateFilter, setAffiliateFilter] = useState('all');

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAffiliates(),
        loadCommissions(),
        loadPayouts(),
        loadReferrals(),
        loadTiers()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error loading affiliate data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliates = async () => {
    const q = query(collection(db, 'affiliates'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setAffiliates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadCommissions = async () => {
    const q = query(collection(db, 'affiliateCommissions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setCommissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadPayouts = async () => {
    const q = query(collection(db, 'affiliatePayouts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setPayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadReferrals = async () => {
    const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadTiers = async () => {
    const q = query(collection(db, 'affiliateTiers'), orderBy('minReferrals', 'asc'));
    const snapshot = await getDocs(q);
    setTiers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const calculateStats = () => {
    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
    const totalReferrals = referrals.length;
    const convertedReferrals = referrals.filter(r => r.status === 'converted').length;
    const conversionRate = totalReferrals > 0 ? ((convertedReferrals / totalReferrals) * 100).toFixed(1) : 0;
    
    const totalCommissions = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
    
    const totalPayouts = payouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const avgCommissionPerAffiliate = activeAffiliates > 0 
      ? (totalCommissions / activeAffiliates).toFixed(2) 
      : 0;

    setStats({
      totalAffiliates,
      activeAffiliates,
      totalReferrals,
      conversionRate,
      totalCommissions,
      pendingCommissions,
      totalPayouts,
      avgCommissionPerAffiliate
    });
  };

  // Handlers
  const handleCreateAffiliate = async () => {
    if (!affiliateForm.name || !affiliateForm.email) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      const referralCode = affiliateForm.referralCode || generateReferralCode();

      await addDoc(collection(db, 'affiliates'), {
        ...affiliateForm,
        referralCode,
        customCommission: affiliateForm.customCommission ? parseFloat(affiliateForm.customCommission) : null,
        status: 'active',
        totalEarnings: 0,
        totalReferrals: 0,
        totalClicks: 0,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Affiliate created!', 'success');
      setShowAffiliateDialog(false);
      setAffiliateForm({
        name: '', email: '', phone: '', tierId: '', paymentMethod: 'paypal',
        paymentEmail: '', referralCode: '', customCommission: '', notes: ''
      });
      loadAffiliates();
      calculateStats();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      showNotification('Error creating affiliate', 'error');
    }
  };

  const handleCreateTier = async () => {
    if (!tierForm.name) {
      showNotification('Please enter tier name', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'affiliateTiers'), {
        ...tierForm,
        commissionRate: parseFloat(tierForm.commissionRate),
        minReferrals: parseInt(tierForm.minReferrals),
        createdAt: serverTimestamp()
      });

      showNotification('Tier created!', 'success');
      setShowTierDialog(false);
      setTierForm({
        name: '', commissionRate: 10, minReferrals: 0,
        description: '', benefits: '', color: '#3B82F6'
      });
      loadTiers();
    } catch (error) {
      console.error('Error creating tier:', error);
      showNotification('Error creating tier', 'error');
    }
  };

  const handleProcessPayout = async () => {
    if (!payoutForm.affiliateId || !payoutForm.amount) {
      showNotification('Please fill required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'affiliatePayouts'), {
        ...payoutForm,
        amount: parseFloat(payoutForm.amount),
        status: 'completed',
        processedAt: serverTimestamp(),
        processedBy: user.uid,
        createdAt: serverTimestamp()
      });

      // Update affiliate's total earnings
      const affiliate = affiliates.find(a => a.id === payoutForm.affiliateId);
      if (affiliate) {
        await updateDoc(doc(db, 'affiliates', payoutForm.affiliateId), {
          totalEarnings: (affiliate.totalEarnings || 0) + parseFloat(payoutForm.amount)
        });
      }

      // Mark commissions as paid
      const affiliateCommissions = commissions.filter(
        c => c.affiliateId === payoutForm.affiliateId && c.status === 'pending'
      );
      const batch = writeBatch(db);
      affiliateCommissions.forEach(comm => {
        batch.update(doc(db, 'affiliateCommissions', comm.id), { 
          status: 'paid',
          paidAt: serverTimestamp()
        });
      });
      await batch.commit();

      showNotification('Payout processed!', 'success');
      setShowPayoutDialog(false);
      setPayoutForm({ affiliateId: '', amount: '', method: 'paypal', notes: '' });
      loadPayouts();
      loadCommissions();
      loadAffiliates();
      calculateStats();
    } catch (error) {
      console.error('Error processing payout:', error);
      showNotification('Error processing payout', 'error');
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (!window.confirm('Delete this affiliate?')) return;

    try {
      await deleteDoc(doc(db, 'affiliates', affiliateId));
      showNotification('Affiliate deleted', 'success');
      loadAffiliates();
      calculateStats();
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      showNotification('Error deleting affiliate', 'error');
    }
  };

  const generateReferralCode = () => {
    return 'AFF' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const copyReferralLink = (code) => {
    const link = `${window.location.origin}/ref/${code}`;
    navigator.clipboard.writeText(link);
    showNotification('Referral link copied!', 'success');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filtered affiliates
  const filteredAffiliates = useMemo(() => {
    return affiliates.filter(a => {
      if (affiliateFilter === 'all') return true;
      if (affiliateFilter === 'active') return a.status === 'active';
      if (affiliateFilter === 'inactive') return a.status !== 'active';
      return true;
    });
  }, [affiliates, affiliateFilter]);

  // Chart Data
  const getReferralTrendChart = () => {
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: 0
      });
    }

    referrals.forEach(ref => {
      const date = ref.createdAt?.toDate();
      if (date) {
        const dayDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          last7Days[6 - dayDiff].count++;
        }
      }
    });

    return {
      labels: last7Days.map(d => d.label),
      datasets: [{
        label: 'Referrals',
        data: last7Days.map(d => d.count),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F620',
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getCommissionStatusChart = () => {
    const pending = commissions.filter(c => c.status === 'pending').length;
    const paid = commissions.filter(c => c.status === 'paid').length;
    const rejected = commissions.filter(c => c.status === 'rejected').length;

    return {
      labels: ['Pending', 'Paid', 'Rejected'],
      datasets: [{
        data: [pending, paid, rejected],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444']
      }]
    };
  };

  const getTopAffiliatesChart = () => {
    const topAffiliates = [...affiliates]
      .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
      .slice(0, 10);

    return {
      labels: topAffiliates.map(a => a.name),
      datasets: [{
        label: 'Total Earnings',
        data: topAffiliates.map(a => a.totalEarnings || 0),
        backgroundColor: '#8B5CF6',
        borderRadius: 8
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Affiliate Program Manager
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>Export</Button>
          <Button variant="outlined" startIcon={<RefreshCw />} onClick={loadAllData}>Refresh</Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Affiliates</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.totalAffiliates}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.activeAffiliates} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Commissions</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.totalCommissions)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {formatCurrency(stats.pendingCommissions)} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Referrals</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.totalReferrals}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stats.conversionRate}% conversion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Payouts</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.totalPayouts)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Affiliates" />
          <Tab label="Commissions" />
          <Tab label="Payouts" />
          <Tab label="Tiers" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Affiliates Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={affiliateFilter}
                onChange={(e) => setAffiliateFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All Affiliates</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowAffiliateDialog(true)}>
              Add Affiliate
            </Button>
          </Box>

          <Grid container spacing={3}>
            {filteredAffiliates.map(affiliate => {
              const tier = tiers.find(t => t.id === affiliate.tierId);
              const affiliateReferrals = referrals.filter(r => r.referrerId === affiliate.id);
              const affiliateCommissions = commissions.filter(c => c.affiliateId === affiliate.id);
              const pendingCommission = affiliateCommissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + c.amount, 0);

              return (
                <Grid item xs={12} md={6} lg={4} key={affiliate.id}>
                  <Card>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: tier?.color || 'primary.main' }}>
                          {affiliate.name[0]}
                        </Avatar>
                      }
                      title={affiliate.name}
                      subheader={affiliate.email}
                      action={
                        <Chip
                          label={affiliate.status === 'active' ? 'Active' : 'Inactive'}
                          size="small"
                          color={affiliate.status === 'active' ? 'success' : 'default'}
                        />
                      }
                    />
                    <CardContent>
                      {tier && (
                        <Chip
                          label={tier.name}
                          size="small"
                          sx={{ bgcolor: tier.color, color: 'white', mb: 2 }}
                        />
                      )}
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Earnings</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(affiliate.totalEarnings || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Pending</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {formatCurrency(pendingCommission)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Referrals</Typography>
                          <Typography variant="body2">{affiliateReferrals.length}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Clicks</Typography>
                          <Typography variant="body2">{affiliate.totalClicks || 0}</Typography>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                          Code: {affiliate.referralCode}
                        </Typography>
                        <IconButton size="small" onClick={() => copyReferralLink(affiliate.referralCode)}>
                          <Copy size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setShowLinkDialog(true)}>
                          <Share2 size={16} />
                        </IconButton>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Eye />} onClick={() => setSelectedAffiliate(affiliate)}>
                        Details
                      </Button>
                      <Button size="small" startIcon={<DollarSign />} onClick={() => {
                        setPayoutForm({ ...payoutForm, affiliateId: affiliate.id, amount: pendingCommission });
                        setShowPayoutDialog(true);
                      }}>
                        Payout
                      </Button>
                      <IconButton size="small" onClick={() => handleDeleteAffiliate(affiliate.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {filteredAffiliates.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Users size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No affiliates found</Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowAffiliateDialog(true)} sx={{ mt: 2 }}>
                Add First Affiliate
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Commissions Tab */}
      {activeTab === 1 && (
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Affiliate</TableCell>
                  <TableCell>Referral</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissions.slice(0, 50).map(commission => {
                  const affiliate = affiliates.find(a => a.id === commission.affiliateId);
                  return (
                    <TableRow key={commission.id} hover>
                      <TableCell>{formatDate(commission.createdAt)}</TableCell>
                      <TableCell>{affiliate?.name || 'N/A'}</TableCell>
                      <TableCell>{commission.referralEmail || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(commission.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={commission.status?.toUpperCase()}
                          size="small"
                          color={
                            commission.status === 'paid' ? 'success' :
                            commission.status === 'pending' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small"><Eye size={16} /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {commissions.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <DollarSign size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography color="text.secondary">No commissions recorded</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Payouts Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Payout History</Typography>
            <Button variant="contained" startIcon={<Send />} onClick={() => setShowPayoutDialog(true)}>
              Process Payout
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Affiliate</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map(payout => {
                  const affiliate = affiliates.find(a => a.id === payout.affiliateId);
                  return (
                    <TableRow key={payout.id} hover>
                      <TableCell>{formatDate(payout.processedAt)}</TableCell>
                      <TableCell>{affiliate?.name || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(payout.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip label={payout.method?.toUpperCase()} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payout.status?.toUpperCase()}
                          size="small"
                          color={payout.status === 'completed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{payout.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {payouts.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Send size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography color="text.secondary">No payouts processed</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Tiers Tab */}
      {activeTab === 3 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Affiliate Tiers</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowTierDialog(true)}>
              Create Tier
            </Button>
          </Box>

          <Grid container spacing={3}>
            {tiers.map(tier => (
              <Grid item xs={12} md={6} lg={4} key={tier.id}>
                <Card sx={{ border: 2, borderColor: tier.color }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: tier.color, width: 48, height: 48 }}>
                        <Star />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {tier.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tier.commissionRate}% commission
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tier.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary">
                      Min Referrals: {tier.minReferrals}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {tier.benefits}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Edit2 />}>Edit</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {tiers.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Award size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>No tiers created</Typography>
              <Button variant="contained" startIcon={<Plus />} onClick={() => setShowTierDialog(true)} sx={{ mt: 2 }}>
                Create First Tier
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Program Analytics
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Referral Trend (Last 7 Days)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={getReferralTrendChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Commission Status
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={getCommissionStatusChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Top Performing Affiliates
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={getTopAffiliatesChart()} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Create Affiliate Dialog */}
      <Dialog open={showAffiliateDialog} onClose={() => setShowAffiliateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Affiliate</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name *"
                value={affiliateForm.name}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={affiliateForm.email}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={affiliateForm.phone}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={affiliateForm.tierId}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, tierId: e.target.value })}
                  label="Tier"
                >
                  {tiers.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name} ({t.commissionRate}%)</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Referral Code (auto-generated if empty)"
                value={affiliateForm.referralCode}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, referralCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Custom Commission %"
                type="number"
                value={affiliateForm.customCommission}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, customCommission: e.target.value })}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={affiliateForm.paymentMethod}
                  onChange={(e) => setAffiliateForm({ ...affiliateForm, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="stripe">Stripe</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Email"
                type="email"
                value={affiliateForm.paymentEmail}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, paymentEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={affiliateForm.notes}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAffiliateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAffiliate}>Add Affiliate</Button>
        </DialogActions>
      </Dialog>

      {/* Create Tier Dialog */}
      <Dialog open={showTierDialog} onClose={() => setShowTierDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Tier</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tier Name *"
            value={tierForm.name}
            onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={tierForm.description}
            onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Commission Rate"
                type="number"
                value={tierForm.commissionRate}
                onChange={(e) => setTierForm({ ...tierForm, commissionRate: e.target.value })}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Referrals"
                type="number"
                value={tierForm.minReferrals}
                onChange={(e) => setTierForm({ ...tierForm, minReferrals: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Benefits"
            multiline
            rows={2}
            value={tierForm.benefits}
            onChange={(e) => setTierForm({ ...tierForm, benefits: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Color"
            type="color"
            value={tierForm.color}
            onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTierDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTier}>Create Tier</Button>
        </DialogActions>
      </Dialog>

      {/* Process Payout Dialog */}
      <Dialog open={showPayoutDialog} onClose={() => setShowPayoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payout</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Affiliate</InputLabel>
            <Select
              value={payoutForm.affiliateId}
              onChange={(e) => setPayoutForm({ ...payoutForm, affiliateId: e.target.value })}
              label="Affiliate"
            >
              {affiliates.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={payoutForm.amount}
            onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Method</InputLabel>
            <Select
              value={payoutForm.method}
              onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
              label="Method"
            >
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="check">Check</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={payoutForm.notes}
            onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProcessPayout}>Process Payout</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, show: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, show: false })}
          severity={notification.type}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AffiliateProgramManager;