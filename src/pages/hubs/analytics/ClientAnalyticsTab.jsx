// Path: /src/pages/hubs/analytics/ClientAnalyticsTab.jsx
// ============================================================================
// ANALYTICS HUB - CLIENT ANALYTICS TAB
// ============================================================================
// Purpose: Client behavior and metrics with retention analysis
// Version: 1.0.0
// Last Updated: 2025-12-10
// Firebase Collections: clients
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
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Activity,
  Award
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  active: '#10b981',
  pending: '#f59e0b',
  inactive: '#ef4444',
  onboarding: '#3b82f6'
};

const ClientAnalyticsTab = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    newThisMonth: 0,
    retentionRate: 0,
    avgLifetime: 0
  });
  const [clientGrowth, setClientGrowth] = useState([]);
  const [clientsByStatus, setClientsByStatus] = useState([]);
  const [clientsBySource, setClientsBySource] = useState([]);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch all clients
      const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const clientsSnap = await getDocs(clientsQuery);
      const clientsData = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const active = clientsData.filter(c => c.status === 'active').length;
      const pending = clientsData.filter(c => c.status === 'pending').length;
      const inactive = clientsData.filter(c => c.status === 'inactive').length;
      const newThisMonth = clientsData.filter(c => {
        const createdAt = c.createdAt?.toDate();
        return createdAt && createdAt >= firstDayOfMonth;
      }).length;

      // Calculate retention rate (simplified)
      const retentionRate = clientsData.length > 0 ? (active / clientsData.length) * 100 : 0;

      // Calculate monthly growth
      const monthlyGrowth = calculateMonthlyGrowth(clientsData);
      setClientGrowth(monthlyGrowth);

      // Client status distribution
      const statusDistribution = [
        { name: 'Active', value: active, color: STATUS_COLORS.active },
        { name: 'Pending', value: pending, color: STATUS_COLORS.pending },
        { name: 'Inactive', value: inactive, color: STATUS_COLORS.inactive }
      ];
      setClientsByStatus(statusDistribution);

      // Clients by source
      const sourceData = calculateClientsBySource(clientsData);
      setClientsBySource(sourceData);

      setStats({
        total: clientsData.length,
        active,
        pending,
        inactive,
        newThisMonth,
        retentionRate,
        avgLifetime: calculateAvgLifetime(clientsData)
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching client data:', error);
      setLoading(false);
    }
  };

  const calculateMonthlyGrowth = (clients) => {
    const monthlyData = {};
    clients.forEach(client => {
      const date = client.createdAt?.toDate();
      if (date) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => ({
        month: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: monthlyData[key]
      }));
  };

  const calculateClientsBySource = (clients) => {
    const sources = {};
    clients.forEach(client => {
      const source = client.source || 'Direct';
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.keys(sources).map(source => ({
      name: source,
      value: sources[source]
    }));
  };

  const calculateAvgLifetime = (clients) => {
    const activeClients = clients.filter(c => c.status === 'active');
    if (activeClients.length === 0) return 0;

    const totalDays = activeClients.reduce((sum, client) => {
      const createdAt = client.createdAt?.toDate();
      if (createdAt) {
        const days = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
        return sum + days;
      }
      return sum;
    }, 0);

    return Math.floor(totalDays / activeClients.length);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
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
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats.total}
            subtitle={`${stats.newThisMonth} new this month`}
            icon={Users}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Clients"
            value={stats.active}
            subtitle={`${((stats.active / stats.total) * 100).toFixed(0)}% of total`}
            icon={UserCheck}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Retention Rate"
            value={`${stats.retentionRate.toFixed(1)}%`}
            subtitle="Last 30 days"
            icon={Activity}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Lifetime"
            value={`${stats.avgLifetime} days`}
            subtitle="Active clients"
            icon={Calendar}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Client Growth Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Client Growth (Last 6 Months)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={clientGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="New Clients"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Client Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Client Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={clientsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clientsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Divider sx={{ my: 2 }} />
            <Box>
              {clientsByStatus.map((status, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: status.color }} />
                    <Typography variant="body2">{status.name}</Typography>
                  </Box>
                  <Chip label={status.value} size="small" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Clients by Source */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Client Acquisition Sources
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clientsBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="Clients">
                  {clientsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Key Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Strong Retention
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.retentionRate.toFixed(1)}% of clients remain active, indicating strong product-market fit
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Healthy Growth
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.newThisMonth} new clients added this month, showing consistent growth
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Client Engagement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average client lifetime of {stats.avgLifetime} days indicates good engagement
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientAnalyticsTab;
