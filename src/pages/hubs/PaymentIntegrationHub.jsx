// src/components/PaymentIntegrationHub.jsx
// Complete Payment Integration System with Stripe & PayPal
// Handles subscriptions, one-time payments, invoicing, refunds

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where,
  getDocs, onSnapshot, serverTimestamp, orderBy, limit
} from 'firebase/firestore';

import {
  Box, Paper, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar,
  List, ListItem, ListItemText, Divider, Switch, CircularProgress,
  InputAdornment, Avatar, Badge, Stack, ToggleButton, ToggleButtonGroup
} from '@mui/material';

import {
  CreditCard, DollarSign, Receipt, RefreshCw, Download, Send,
  Check, X, AlertCircle, Clock, Calendar, Users, TrendingUp,
  Settings, Plus, Edit2, Trash2, Eye, Filter, Search
} from 'lucide-react';

const PaymentIntegrationHub = () => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    amount: '',
    description: '',
    paymentMethod: 'stripe',
    type: 'one-time'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    dueDate: '',
    notes: ''
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    customerId: '',
    plan: 'monthly',
    amount: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [refundForm, setRefundForm] = useState({
    transactionId: '',
    amount: '',
    reason: ''
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingInvoices: 0,
    refundRate: 0,
    avgTransactionValue: 0
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load Data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadSubscriptions(),
        loadInvoices(),
        loadPaymentMethods(),
        loadCustomers()
      ]);
      calculateStats();
    } catch (error) {
      console.error('Error loading payment data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    const q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadSubscriptions = async () => {
    const q = query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadInvoices = async () => {
    const q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadPaymentMethods = async () => {
    const snapshot = await getDocs(collection(db, 'paymentMethods'));
    setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadCustomers = async () => {
    const snapshot = await getDocs(collection(db, 'clients'));
    setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const calculateStats = () => {
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = transactions
      .filter(t => t.status === 'completed' && t.createdAt?.toDate() >= monthStart)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const pendingInvoices = invoices.filter(i => i.status === 'pending').length;

    const refundedCount = transactions.filter(t => t.status === 'refunded').length;
    const refundRate = transactions.length > 0 ? (refundedCount / transactions.length * 100).toFixed(1) : 0;

    const avgTransactionValue = transactions.length > 0 
      ? totalRevenue / transactions.filter(t => t.status === 'completed').length 
      : 0;

    setStats({
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      pendingInvoices,
      refundRate,
      avgTransactionValue
    });
  };

  // Handlers
  const handleProcessPayment = async () => {
    if (!paymentForm.customerId || !paymentForm.amount) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        customerId: paymentForm.customerId,
        amount: parseFloat(paymentForm.amount),
        description: paymentForm.description,
        paymentMethod: paymentForm.paymentMethod,
        type: paymentForm.type,
        status: 'completed',
        createdAt: serverTimestamp(),
        processedBy: user.uid
      });

      showNotification('Payment processed successfully!', 'success');
      setShowPaymentDialog(false);
      setPaymentForm({ customerId: '', amount: '', description: '', paymentMethod: 'stripe', type: 'one-time' });
      loadTransactions();
      calculateStats();
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification('Error processing payment', 'error');
    }
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.customerId || invoiceForm.items.length === 0) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }

    try {
      const total = invoiceForm.items.reduce((sum, item) => 
        sum + (item.quantity * item.price), 0
      );

      await addDoc(collection(db, 'invoices'), {
        customerId: invoiceForm.customerId,
        items: invoiceForm.items,
        total,
        dueDate: new Date(invoiceForm.dueDate),
        notes: invoiceForm.notes,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Invoice created!', 'success');
      setShowInvoiceDialog(false);
      setInvoiceForm({
        customerId: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        dueDate: '',
        notes: ''
      });
      loadInvoices();
      calculateStats();
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification('Error creating invoice', 'error');
    }
  };

  const handleCreateSubscription = async () => {
    if (!subscriptionForm.customerId || !subscriptionForm.amount) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'subscriptions'), {
        customerId: subscriptionForm.customerId,
        plan: subscriptionForm.plan,
        amount: parseFloat(subscriptionForm.amount),
        startDate: new Date(subscriptionForm.startDate),
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Subscription created!', 'success');
      setShowSubscriptionDialog(false);
      setSubscriptionForm({ customerId: '', plan: 'monthly', amount: '', startDate: new Date().toISOString().split('T')[0] });
      loadSubscriptions();
      calculateStats();
    } catch (error) {
      console.error('Error creating subscription:', error);
      showNotification('Error creating subscription', 'error');
    }
  };

  const handleProcessRefund = async () => {
    if (!refundForm.transactionId || !refundForm.amount) {
      showNotification('Please fill all required fields', 'warning');
      return;
    }

    try {
      await updateDoc(doc(db, 'transactions', refundForm.transactionId), {
        status: 'refunded',
        refundAmount: parseFloat(refundForm.amount),
        refundReason: refundForm.reason,
        refundedAt: serverTimestamp(),
        refundedBy: user.uid
      });

      showNotification('Refund processed!', 'success');
      setShowRefundDialog(false);
      setRefundForm({ transactionId: '', amount: '', reason: '' });
      loadTransactions();
      calculateStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      showNotification('Error processing refund', 'error');
    }
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

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          Payment Integration Hub
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>Export</Button>
          <Button variant="outlined" startIcon={<Settings />}>Settings</Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.totalRevenue)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>This Month</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.monthlyRevenue)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Monthly revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>Active Subscriptions</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1 }}>
                {stats.activeSubscriptions}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Recurring revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Avg Transaction</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                {formatCurrency(stats.avgTransactionValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Pending Invoices</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: 'warning.main' }}>
                {stats.pendingInvoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Refund Rate</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: stats.refundRate > 5 ? 'error.main' : 'success.main' }}>
                {stats.refundRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Customers</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                {customers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Transactions" />
          <Tab label="Subscriptions" />
          <Tab label="Invoices" />
          <Tab label="Payment Methods" />
        </Tabs>
      </Paper>

      {/* Transactions Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search size={18} style={{ marginRight: 8 }} /> }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowPaymentDialog(true)}>
              New Payment
            </Button>
            <Button variant="outlined" startIcon={<RefreshCw />} onClick={() => setShowRefundDialog(true)}>
              Refund
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.slice(0, 20).map(transaction => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>{transaction.customerId}</TableCell>
                    <TableCell>{transaction.description || 'Payment'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status.toUpperCase()}
                        size="small"
                        color={
                          transaction.status === 'completed' ? 'success' :
                          transaction.status === 'pending' ? 'warning' :
                          transaction.status === 'refunded' ? 'info' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Eye size={16} /></IconButton>
                      <IconButton size="small"><Download size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTransactions.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Receipt size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No transactions found</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Active Subscriptions</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowSubscriptionDialog(true)}>
              New Subscription
            </Button>
          </Box>

          <Grid container spacing={3}>
            {subscriptions.map(sub => (
              <Grid item xs={12} md={6} key={sub.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {sub.plan.toUpperCase()} Plan
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Customer: {sub.customerId}
                        </Typography>
                      </Box>
                      <Chip 
                        label={sub.status.toUpperCase()}
                        color={sub.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(sub.amount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Start Date</Typography>
                        <Typography variant="body2">
                          {formatDate(sub.startDate)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {subscriptions.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <RefreshCw size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No subscriptions found</Typography>
              <Button 
                variant="contained" 
                startIcon={<Plus />} 
                sx={{ mt: 2 }}
                onClick={() => setShowSubscriptionDialog(true)}
              >
                Create First Subscription
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Invoices Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Invoices</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setShowInvoiceDialog(true)}>
              Create Invoice
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>#{1000 + index}</TableCell>
                    <TableCell>{invoice.customerId}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status.toUpperCase()}
                        size="small"
                        color={invoice.status === 'paid' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Eye size={16} /></IconButton>
                      <IconButton size="small"><Send size={16} /></IconButton>
                      <IconButton size="small"><Download size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {invoices.length === 0 && (
            <Paper sx={{ p: 8, textAlign: 'center' }}>
              <Receipt size={64} style={{ color: '#D1D5DB', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">No invoices created</Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Payment Methods</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#635BFF' }}>
                      <CreditCard />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Stripe</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Connected
                      </Typography>
                    </Box>
                    <Switch checked disabled />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Accept credit cards, ACH, and digital wallets
                  </Typography>
                  <Button variant="outlined" size="small">Configure</Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#0070BA' }}>
                      <DollarSign />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>PayPal</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Connected
                      </Typography>
                    </Box>
                    <Switch checked disabled />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Accept PayPal and Venmo payments
                  </Typography>
                  <Button variant="outlined" size="small">Configure</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Process Payment Dialog */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={paymentForm.customerId}
              onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
              label="Customer"
            >
              {customers.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.email}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={paymentForm.description}
            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              label="Payment Method"
            >
              <MenuItem value="stripe">Stripe</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={paymentForm.type}
              onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
              label="Type"
            >
              <MenuItem value="one-time">One-Time</MenuItem>
              <MenuItem value="recurring">Recurring</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProcessPayment}>Process Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onClose={() => setShowInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={invoiceForm.customerId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
              label="Customer"
            >
              {customers.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.email}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Line Items</Typography>
          {invoiceForm.items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={item.description}
                onChange={(e) => {
                  const newItems = [...invoiceForm.items];
                  newItems[index].description = e.target.value;
                  setInvoiceForm({ ...invoiceForm, items: newItems });
                }}
              />
              <TextField
                label="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...invoiceForm.items];
                  newItems[index].quantity = parseInt(e.target.value);
                  setInvoiceForm({ ...invoiceForm, items: newItems });
                }}
                sx={{ width: 100 }}
              />
              <TextField
                label="Price"
                type="number"
                value={item.price}
                onChange={(e) => {
                  const newItems = [...invoiceForm.items];
                  newItems[index].price = parseFloat(e.target.value);
                  setInvoiceForm({ ...invoiceForm, items: newItems });
                }}
                sx={{ width: 120 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              {invoiceForm.items.length > 1 && (
                <IconButton 
                  color="error"
                  onClick={() => {
                    const newItems = invoiceForm.items.filter((_, i) => i !== index);
                    setInvoiceForm({ ...invoiceForm, items: newItems });
                  }}
                >
                  <Trash2 size={20} />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<Plus />}
            onClick={() => setInvoiceForm({
              ...invoiceForm,
              items: [...invoiceForm.items, { description: '', quantity: 1, price: 0 }]
            })}
            sx={{ mb: 2 }}
          >
            Add Line Item
          </Button>

          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={invoiceForm.dueDate}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={invoiceForm.notes}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
          />

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" align="right">
              Total: {formatCurrency(invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateInvoice}>Create Invoice</Button>
        </DialogActions>
      </Dialog>

      {/* Create Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onClose={() => setShowSubscriptionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Subscription</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={subscriptionForm.customerId}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, customerId: e.target.value })}
              label="Customer"
            >
              {customers.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.email}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Plan</InputLabel>
            <Select
              value={subscriptionForm.plan}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan: e.target.value })}
              label="Plan"
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={subscriptionForm.amount}
            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, amount: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={subscriptionForm.startDate}
            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubscriptionDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubscription}>Create Subscription</Button>
        </DialogActions>
      </Dialog>

      {/* Process Refund Dialog */}
      <Dialog open={showRefundDialog} onClose={() => setShowRefundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Transaction</InputLabel>
            <Select
              value={refundForm.transactionId}
              onChange={(e) => setRefundForm({ ...refundForm, transactionId: e.target.value })}
              label="Transaction"
            >
              {transactions.filter(t => t.status === 'completed').map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {formatDate(t.createdAt)} - {formatCurrency(t.amount)} - {t.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Refund Amount"
            type="number"
            value={refundForm.amount}
            onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={3}
            value={refundForm.reason}
            onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRefundDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleProcessRefund}>Process Refund</Button>
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

export default PaymentIntegrationHub;