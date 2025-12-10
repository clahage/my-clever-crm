// Path: /src/pages/hubs/analytics/RevenueAnalyticsTab.jsx
// ============================================================================
// ANALYTICS HUB - REVENUE ANALYTICS TAB
// ============================================================================
// Purpose: Revenue performance analysis with charts and trends
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: invoices, payments
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar
} from '@mui/material';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area
} from 'recharts';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const RevenueAnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [revenueData, setRevenueData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    avgInvoiceValue: 0,
    revenueGrowth: 0,
    outstandingBalance: 0
  });

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Fetch invoices
      const invoicesQuery = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
      const invoicesSnap = await getDocs(invoicesQuery);
      const invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch payments
      const paymentsQuery = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const paymentsSnap = await getDocs(paymentsQuery);
      const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate stats
      const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const outstanding = invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

      // Calculate monthly revenue
      const monthlyRevenue = calculateMonthlyRevenue(payments);
      setRevenueData(monthlyRevenue);

      // Calculate revenue growth
      const growth = monthlyRevenue.length > 1 ?
        ((monthlyRevenue[monthlyRevenue.length - 1].amount - monthlyRevenue[monthlyRevenue.length - 2].amount) /
         monthlyRevenue[monthlyRevenue.length - 2].amount * 100) : 0;

      // Payment methods breakdown
      const methodsData = calculatePaymentMethods(payments);
      setPaymentMethods(methodsData);

      // Top clients by revenue
      const topClientsData = calculateTopClients(payments);
      setTopClients(topClientsData);

      setStats({
        totalRevenue,
        totalInvoices: invoices.length,
        paidInvoices,
        avgInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        revenueGrowth: growth,
        outstandingBalance: outstanding
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (payments) => {
    const monthlyData = {};
    payments.forEach(payment => {
      const date = payment.createdAt?.toDate();
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        monthlyData[monthKey].amount += parseFloat(payment.amount) || 0;
        monthlyData[monthKey].count += 1;
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: monthlyData[key].amount,
        count: monthlyData[key].count
      }));
  };

  const calculatePaymentMethods = (payments) => {
    const methods = {};
    payments.forEach(payment => {
      const method = payment.method || 'Unknown';
      methods[method] = (methods[method] || 0) + (parseFloat(payment.amount) || 0);
    });

    return Object.keys(methods).map(method => ({
      name: method,
      value: methods[method]
    }));
  };

  const calculateTopClients = (payments) => {
    const clientRevenue = {};
    payments.forEach(payment => {
      const clientId = payment.clientId || 'Unknown';
      const clientName = payment.clientName || 'Unknown Client';
      if (!clientRevenue[clientId]) {
        clientRevenue[clientId] = { name: clientName, revenue: 0, count: 0 };
      }
      clientRevenue[clientId].revenue += parseFloat(payment.amount) || 0;
      clientRevenue[clientId].count += 1;
    });

    return Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change >= 0 ? (
                  <ArrowUpRight size={16} color="#10b981" />
                ) : (
                  <ArrowDownRight size={16} color="#ef4444" />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: change >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.100`, color: `${color}.main` }}>
            <Icon size={24} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
  }

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueGrowth}
            icon={DollarSign}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Invoice Value"
            value={formatCurrency(stats.avgInvoiceValue)}
            icon={Receipt}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(stats.outstandingBalance)}
            icon={CreditCard}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Revenue Trend
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Payment Methods
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Clients */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Top 5 Clients by Revenue
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Payments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topClients.map((client, index) => (
                    <TableRow key={index}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(client.revenue)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={client.count} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {topClients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No revenue data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueAnalyticsTab;
