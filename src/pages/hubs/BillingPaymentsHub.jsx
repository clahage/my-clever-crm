// ============================================
// BILLING & PAYMENTS HUB
// Path: /src/pages/billing/BillingPaymentsHub.jsx
// ============================================
// Comprehensive billing and revenue management
// Invoicing, subscriptions, payment processing
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Send,
  Download,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Mail,
  Search,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Receipt,
  Wallet,
  Users,
  Activity,
  Target,
  Zap,
  Bell,
  Settings,
  Package,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  DollarSign as Revenue,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const INVOICE_STATUSES = {
  draft: { label: 'Draft', color: '#6b7280' },
  sent: { label: 'Sent', color: '#3b82f6' },
  viewed: { label: 'Viewed', color: '#8b5cf6' },
  paid: { label: 'Paid', color: '#10b981' },
  overdue: { label: 'Overdue', color: '#ef4444' },
  cancelled: { label: 'Cancelled', color: '#6b7280' },
};

const PAYMENT_METHODS = {
  card: { label: 'Credit/Debit Card', icon: CreditCard },
  bank: { label: 'Bank Transfer', icon: Wallet },
  ach: { label: 'ACH', icon: Wallet },
  check: { label: 'Check', icon: Receipt },
  cash: { label: 'Cash', icon: DollarSign },
};

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 49,
    interval: 'monthly',
    features: ['Credit Monitoring', 'Basic Disputes', 'Email Support'],
    color: '#3b82f6',
  },
  standard: {
    name: 'Standard Plan',
    price: 99,
    interval: 'monthly',
    features: ['Everything in Basic', 'Advanced Disputes', 'Phone Support', 'Priority Processing'],
    color: '#8b5cf6',
  },
  premium: {
    name: 'Premium Plan',
    price: 149,
    interval: 'monthly',
    features: ['Everything in Standard', 'Dedicated Case Manager', '24/7 Support', 'Fastest Results'],
    color: '#f59e0b',
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// ============================================
// MAIN COMPONENT
// ============================================

const BillingPaymentsHub = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Data states
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    console.log('💰 Loading billing & payments data');
    setLoading(true);

    try {
      await Promise.all([
        loadInvoices(),
        loadPayments(),
        loadSubscriptions(),
        loadProducts(),
        loadClients(),
        calculateRevenue(),
      ]);

      console.log('✅ All billing data loaded');
    } catch (error) {
      console.error('❌ Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const invoiceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setInvoices(invoiceData);
    } catch (error) {
      console.error('❌ Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const paymentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPayments(paymentData);
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      setPayments([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const subsRef = collection(db, 'subscriptions');
      const q = query(subsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      const subData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubscriptions(subData);
    } catch (error) {
      console.error('❌ Error loading subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('active', '==', true));
      const snapshot = await getDocs(q);
      
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productData);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    }
  };

  const loadClients = async () => {
    try {
      const clientsRef = collection(db, 'contacts');
      const q = query(
        clientsRef,
        where('roles', 'array-contains', 'client')
      );
      const snapshot = await getDocs(q);
      
      const clientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setClients(clientData);
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      setClients([]);
    }
  };

  const calculateRevenue = async () => {
    try {
      // Calculate revenue for last 12 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('status', '==', 'completed'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const paymentData = snapshot.docs.map(doc => doc.data());

      // Group by month
      const monthlyRevenue = {};
      paymentData.forEach(payment => {
        const date = payment.date.toDate();
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = 0;
        }
        
        monthlyRevenue[monthKey] += parseFloat(payment.amount) || 0;
      });

      // Calculate metrics
      const totalRevenue = Object.values(monthlyRevenue).reduce((sum, val) => sum + val, 0);
      const avgMonthlyRevenue = totalRevenue / 12;
      const recentMonths = Object.entries(monthlyRevenue)
        .slice(-3)
        .map(([, val]) => val);
      const recentAvg = recentMonths.reduce((sum, val) => sum + val, 0) / 3;
      const growthRate = avgMonthlyRevenue > 0 ? 
        ((recentAvg - avgMonthlyRevenue) / avgMonthlyRevenue) * 100 : 0;

      setRevenueData({
        totalRevenue,
        avgMonthlyRevenue,
        growthRate,
        monthlyData: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue),
        })),
      });

    } catch (error) {
      console.error('❌ Error calculating revenue:', error);
      setRevenueData(null);
    }
  };

  // ============================================
  // AI ANALYTICS FUNCTIONS
  // ============================================

  const predictNextMonthRevenue = () => {
    if (!revenueData || revenueData.monthlyData.length < 3) return null;

    // Simple moving average prediction
    const recentMonths = revenueData.monthlyData.slice(-3);
    const avgRecent = recentMonths.reduce((sum, d) => sum + d.revenue, 0) / 3;
    
    // Apply growth rate
    const predicted = avgRecent * (1 + revenueData.growthRate / 100);

    return {
      amount: Math.round(predicted),
      confidence: revenueData.monthlyData.length >= 6 ? 'high' : 'medium',
      range: {
        low: Math.round(predicted * 0.8),
        high: Math.round(predicted * 1.2),
      },
    };
  };

  const identifyAtRiskClients = () => {
    // Clients with overdue invoices or payment issues
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const clientsWithOverdue = [...new Set(overdueInvoices.map(inv => inv.clientId))];

    const atRisk = clients.filter(client => 
      clientsWithOverdue.includes(client.id)
    ).map(client => {
      const clientOverdue = overdueInvoices.filter(inv => inv.clientId === client.id);
      const totalOverdue = clientOverdue.reduce((sum, inv) => sum + (inv.total || 0), 0);

      return {
        ...client,
        overdueCount: clientOverdue.length,
        totalOverdue,
        risk: totalOverdue > 500 ? 'high' : totalOverdue > 200 ? 'medium' : 'low',
      };
    });

    return atRisk.sort((a, b) => b.totalOverdue - a.totalOverdue);
  };

  const calculateChurnRisk = (subscription) => {
    // Calculate churn risk based on payment history and activity
    const subPayments = payments.filter(p => p.subscriptionId === subscription.id);
    
    const latePayments = subPayments.filter(p => 
      p.status === 'late' || p.status === 'failed'
    ).length;

    const totalPayments = subPayments.length;
    const lateRate = totalPayments > 0 ? latePayments / totalPayments : 0;

    let risk = 'low';
    let score = 0;

    if (lateRate > 0.3) {
      risk = 'high';
      score = 80;
    } else if (lateRate > 0.15) {
      risk = 'medium';
      score = 50;
    } else {
      risk = 'low';
      score = 20;
    }

    return {
      risk,
      score,
      latePayments,
      totalPayments,
      lateRate: (lateRate * 100).toFixed(0) + '%',
    };
  };

  const getRevenueInsights = () => {
    if (!revenueData) return [];

    const insights = [];

    // Growth insight
    if (revenueData.growthRate > 10) {
      insights.push({
        type: 'success',
        title: 'Strong Growth! 📈',
        message: `Revenue is growing at ${revenueData.growthRate.toFixed(1)}% month-over-month`,
        action: 'Keep up the great work!',
      });
    } else if (revenueData.growthRate < -5) {
      insights.push({
        type: 'warning',
        title: 'Revenue Declining',
        message: `Revenue decreased ${Math.abs(revenueData.growthRate).toFixed(1)}% this month`,
        action: 'Review pricing and client retention',
      });
    }

    // Overdue invoices insight
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
    const overdueTotal = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    if (overdueCount > 0) {
      insights.push({
        type: 'error',
        title: `${overdueCount} Overdue Invoices`,
        message: `$${overdueTotal.toLocaleString()} in overdue payments`,
        action: 'Send payment reminders immediately',
      });
    }

    // Subscription renewal insight
    const expiringSoon = subscriptions.filter(sub => {
      const nextBilling = new Date(sub.nextBillingDate);
      const daysUntil = Math.floor((nextBilling - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

    if (expiringSoon.length > 0) {
      insights.push({
        type: 'info',
        title: `${expiringSoon.length} Subscriptions Renewing Soon`,
        message: 'Ensure payment methods are up to date',
        action: 'Review subscription renewals',
      });
    }

    return insights;
  };

  const optimizePricing = (product) => {
    // AI-powered pricing optimization based on sales data
    const productSales = payments.filter(p => 
      p.items && p.items.some(item => item.productId === product.id)
    );

    const avgSalesPerMonth = productSales.length / 12;
    const currentPrice = product.price || 0;

    let recommendation = {
      currentPrice,
      recommendedPrice: currentPrice,
      reasoning: 'Maintain current pricing',
      confidence: 'medium',
    };

    if (avgSalesPerMonth < 2) {
      // Low sales - consider price reduction
      recommendation = {
        currentPrice,
        recommendedPrice: Math.round(currentPrice * 0.85),
        reasoning: 'Price may be too high - consider 15% reduction to boost sales',
        confidence: 'medium',
      };
    } else if (avgSalesPerMonth > 10) {
      // High sales - consider price increase
      recommendation = {
        currentPrice,
        recommendedPrice: Math.round(currentPrice * 1.10),
        reasoning: 'Strong demand - consider 10% price increase',
        confidence: 'high',
      };
    }

    return recommendation;
  };

  // ============================================
  // TAB 1: REVENUE DASHBOARD
  // ============================================

  const renderDashboardTab = () => {
    const prediction = predictNextMonthRevenue();
    const insights = getRevenueInsights();
    const atRisk = identifyAtRiskClients();

    // Calculate key metrics
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const monthlyRecurring = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    const unpaidInvoices = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    return (
      <Box className="space-y-6">
        {/* ===== KEY METRICS ===== */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      ${totalRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Monthly Recurring
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-600">
                      ${monthlyRecurring.toLocaleString()}
                    </Typography>
                  </Box>
                  <RefreshCw className="w-10 h-10 text-blue-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Active Subscriptions
                    </Typography>
                    <Typography variant="h4" className="font-bold text-purple-600">
                      {activeSubscriptions}
                    </Typography>
                  </Box>
                  <Users className="w-10 h-10 text-purple-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-gray-600">
                      Unpaid Invoices
                    </Typography>
                    <Typography variant="h4" className="font-bold text-orange-600">
                      ${unpaidInvoices.toLocaleString()}
                    </Typography>
                  </Box>
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ===== REVENUE CHART ===== */}
        {revenueData && (
          <Card elevation={3}>
            <CardContent>
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">
                  📊 Revenue Trend (Last 12 Months)
                </Typography>
                {revenueData.growthRate > 0 ? (
                  <Chip
                    icon={<TrendingUp className="w-4 h-4" />}
                    label={`+${revenueData.growthRate.toFixed(1)}%`}
                    color="success"
                  />
                ) : (
                  <Chip
                    icon={<TrendingDown className="w-4 h-4" />}
                    label={`${revenueData.growthRate.toFixed(1)}%`}
                    color="error"
                  />
                )}
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData.monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ===== REVENUE PREDICTION ===== */}
        {prediction && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                🔮 Next Month Prediction
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <Typography variant="caption" className="text-gray-600">
                      Predicted Revenue
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-600">
                      ${prediction.amount.toLocaleString()}
                    </Typography>
                    <Chip
                      label={`${prediction.confidence} confidence`}
                      size="small"
                      className="mt-2"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <Typography variant="caption" className="text-gray-600">
                      Best Case
                    </Typography>
                    <Typography variant="h4" className="font-bold text-green-600">
                      ${prediction.range.high.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box className="text-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                    <Typography variant="caption" className="text-gray-600">
                      Worst Case
                    </Typography>
                    <Typography variant="h4" className="font-bold text-orange-600">
                      ${prediction.range.low.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ===== INSIGHTS ===== */}
        {insights.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                💡 Revenue Insights
              </Typography>
              <Box className="space-y-2">
                {insights.map((insight, index) => (
                  <Alert key={index} severity={insight.type}>
                    <Typography variant="body2" className="font-semibold">
                      {insight.title}
                    </Typography>
                    <Typography variant="caption">
                      {insight.message}
                    </Typography>
                    <Typography variant="caption" className="block mt-1 font-semibold">
                      → {insight.action}
                    </Typography>
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ===== AT-RISK CLIENTS ===== */}
        {atRisk.length > 0 && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-3">
                ⚠️ At-Risk Clients ({atRisk.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>Overdue Invoices</TableCell>
                      <TableCell>Total Overdue</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {atRisk.slice(0, 5).map(client => (
                      <TableRow key={client.id}>
                        <TableCell>
                          {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell>{client.overdueCount}</TableCell>
                        <TableCell>${client.totalOverdue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={client.risk}
                            size="small"
                            color={
                              client.risk === 'high' ? 'error' :
                              client.risk === 'medium' ? 'warning' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" startIcon={<Mail />}>
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  // ============================================
  // TAB 2: INVOICES
  // ============================================

  const renderInvoicesTab = () => {
    const filteredInvoices = invoices.filter(inv => {
      const matchesSearch = searchQuery === '' || 
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    return (
      <Box className="space-y-4">
        {/* ===== TOOLBAR ===== */}
        <Card elevation={2}>
          <CardContent>
            <Box className="flex items-center justify-between gap-4 flex-wrap">
              <TextField
                size="small"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />,
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.entries(INVOICE_STATUSES).map(([key, config]) => (
                    <MenuItem key={key} value={key}>{config.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Plus />}
                onClick={() => setInvoiceDialogOpen(true)}
              >
                New Invoice
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ===== INVOICES TABLE ===== */}
        <Card elevation={3}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(invoice => {
                      const statusConfig = INVOICE_STATUSES[invoice.status];
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-semibold">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>
                            {new Date(invoice.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.total?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={statusConfig.label}
                              size="small"
                              sx={{
                                bgcolor: statusConfig.color,
                                color: 'white',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box className="flex gap-1">
                              <IconButton size="small">
                                <Eye className="w-4 h-4" />
                              </IconButton>
                              <IconButton size="small">
                                <Download className="w-4 h-4" />
                              </IconButton>
                              <IconButton size="small">
                                <Send className="w-4 h-4" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredInvoices.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // REMAINING TABS (SIMPLIFIED)
  // ============================================

  const renderPaymentsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          💳 Payment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.slice(0, 10).map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.clientName}</TableCell>
                  <TableCell>${payment.amount?.toLocaleString()}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      size="small"
                      color={payment.status === 'completed' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderSubscriptionsTab = () => (
    <Box className="space-y-6">
      <Grid container spacing={3}>
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <Grid item xs={12} md={4} key={key}>
            <Card elevation={2} sx={{ borderTop: `4px solid ${plan.color}` }}>
              <CardContent>
                <Typography variant="h5" className="font-bold mb-2">
                  {plan.name}
                </Typography>
                <Typography variant="h3" className="font-bold mb-4" style={{ color: plan.color }}>
                  ${plan.price}
                  <Typography variant="caption" className="text-gray-600">
                    /{plan.interval}
                  </Typography>
                </Typography>
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Active Subscriptions ({subscriptions.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Next Billing</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.clientName}</TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell>${sub.amount}</TableCell>
                    <TableCell>{new Date(sub.nextBillingDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label="Active" size="small" color="success" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderReportsTab = () => (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          📊 Financial Reports
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileText />}
              sx={{ py: 2 }}
            >
              Generate Revenue Report
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileText />}
              sx={{ py: 2 }}
            >
              Generate Tax Report
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <Box className="text-center">
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="body2" className="text-gray-600">
            Loading billing data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="p-4">
      <Box className="max-w-7xl mx-auto">
        {/* ===== HEADER ===== */}
        <Box className="mb-6">
          <Typography variant="h4" className="font-bold mb-2">
            Billing & Payments
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Manage invoices, subscriptions, and revenue
          </Typography>
        </Box>

        {/* ===== TABS ===== */}
        <Paper elevation={3} className="mb-6">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" />
            <Tab icon={<FileText className="w-5 h-5" />} label="Invoices" />
            <Tab icon={<CreditCard className="w-5 h-5" />} label="Payments" />
            <Tab icon={<RefreshCw className="w-5 h-5" />} label="Subscriptions" />
            <Tab icon={<Receipt className="w-5 h-5" />} label="Reports" />
          </Tabs>
        </Paper>

        {/* ===== TAB CONTENT ===== */}
        <Box>
          {activeTab === 0 && renderDashboardTab()}
          {activeTab === 1 && renderInvoicesTab()}
          {activeTab === 2 && renderPaymentsTab()}
          {activeTab === 3 && renderSubscriptionsTab()}
          {activeTab === 4 && renderReportsTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default BillingPaymentsHub;