// Path: /src/pages/hubs/revenue/DashboardTab.jsx
// ============================================================================
// REVENUE HUB - DASHBOARD TAB
// ============================================================================
// Purpose: Revenue metrics and forecasting dashboard
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
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const DashboardTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [periodTab, setPeriodTab] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    mrr: 0,
    arr: 0,
    activeSubscriptions: 0,
    revenueGrowth: 0,
    averageInvoice: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [revenueBySource, setRevenueBySource] = useState([]);

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to invoices for revenue calculations
    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('status', '==', 'paid'),
      orderBy('paidAt', 'desc')
    );
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total revenue
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      // Calculate average invoice
      const averageInvoice = invoices.length > 0 ? totalRevenue / invoices.length : 0;

      // Calculate revenue by month for chart
      const revenueByMonth = {};
      invoices.forEach(inv => {
        const date = inv.paidAt?.toDate();
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (inv.amount || 0);
        }
      });

      // Convert to chart data
      const chartData = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: amount
        }));

      setRevenueData(chartData);

      // Calculate top clients by revenue
      const clientRevenue = {};
      invoices.forEach(inv => {
        const clientId = inv.clientId || 'unknown';
        const clientName = inv.clientName || 'Unknown Client';
        if (!clientRevenue[clientId]) {
          clientRevenue[clientId] = { name: clientName, total: 0, invoices: 0 };
        }
        clientRevenue[clientId].total += (inv.amount || 0);
        clientRevenue[clientId].invoices += 1;
      });

      const topClientsList = Object.values(clientRevenue)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setTopClients(topClientsList);

      // Calculate revenue growth (compare last 2 months)
      const months = Object.keys(revenueByMonth).sort().slice(-2);
      let growth = 0;
      if (months.length === 2) {
        const lastMonth = revenueByMonth[months[1]];
        const prevMonth = revenueByMonth[months[0]];
        growth = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
      }

      setStats(prev => ({
        ...prev,
        totalRevenue,
        averageInvoice,
        revenueGrowth: growth
      }));

      setLoading(false);
    });
    unsubscribers.push(unsubInvoices);

    // Subscribe to subscriptions
    const subscriptionsQuery = query(
      collection(db, 'subscriptions'),
      where('status', '==', 'active')
    );
    const unsubSubscriptions = onSnapshot(subscriptionsQuery, (snapshot) => {
      const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate MRR (Monthly Recurring Revenue)
      const mrr = subscriptions.reduce((sum, sub) => {
        const amount = sub.amount || 0;
        const interval = sub.interval || 'month';
        // Convert to monthly
        if (interval === 'year') return sum + (amount / 12);
        if (interval === 'month') return sum + amount;
        return sum;
      }, 0);

      const arr = mrr * 12;

      setStats(prev => ({
        ...prev,
        mrr,
        arr,
        activeSubscriptions: subscriptions.length
      }));
    });
    unsubscribers.push(unsubSubscriptions);

    // Subscribe to payments for revenue sources
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Group by source
      const sourceData = {};
      payments.forEach(payment => {
        const source = payment.source || 'Direct';
        sourceData[source] = (sourceData[source] || 0) + (payment.amount || 0);
      });

      const sources = Object.entries(sourceData).map(([name, value]) => ({
        name,
        value
      }));

      setRevenueBySource(sources);
    });
    unsubscribers.push(unsubPayments);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ title, value, icon: Icon, color, change, prefix = '' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change >= 0 ? (
                  <ArrowUpRight size={16} color="green" />
                ) : (
                  <ArrowDownRight size={16} color="red" />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: change >= 0 ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.50`,
              color: `${color}.main`
            }}
          >
            <Icon size={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
          Revenue Dashboard
        </Typography>
        <IconButton onClick={() => window.location.reload()}>
          <RefreshCw size={20} />
        </IconButton>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            color="primary"
            prefix="$"
            change={stats.revenueGrowth}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Monthly Recurring Revenue"
            value={stats.mrr}
            icon={TrendingUp}
            color="success"
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Annual Recurring Revenue"
            value={stats.arr}
            icon={Calendar}
            color="info"
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={Users}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Invoice"
            value={stats.averageInvoice}
            icon={CreditCard}
            color="secondary"
            prefix="$"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Revenue Growth"
            value={`${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`}
            icon={stats.revenueGrowth >= 0 ? TrendingUp : TrendingDown}
            color={stats.revenueGrowth >= 0 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Over Time Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Source */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Revenue by Source
              </Typography>
              {revenueBySource.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No revenue data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Revenue Clients */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Revenue Clients
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client Name</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Invoices</TableCell>
                      <TableCell align="right">Avg Invoice</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No client data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topClients.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell>{client.name}</TableCell>
                          <TableCell align="right">
                            ${client.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">{client.invoices}</TableCell>
                          <TableCell align="right">
                            ${(client.total / client.invoices).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;
