// Path: /src/pages/hubs/revenue/CollectionsTab.jsx
// ============================================================================
// REVENUE HUB - COLLECTIONS TAB
// ============================================================================
// Purpose: Collections and accounts receivable management
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
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  DollarSign,
  AlertCircle,
  Clock,
  Send,
  Phone,
  Mail,
  FileText,
  TrendingDown
} from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
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

const CollectionsTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [agingData, setAgingData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const unsubscribers = [];

    // Subscribe to overdue invoices
    const overdueQuery = query(
      collection(db, 'invoices'),
      where('status', 'in', ['sent', 'overdue']),
      orderBy('dueDate', 'asc')
    );

    const unsubOverdue = onSnapshot(overdueQuery, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const now = new Date();
      const overdueList = invoices.filter(inv => {
        const dueDate = inv.dueDate?.toDate();
        return dueDate && dueDate < now;
      });

      // Calculate days overdue and categorize
      const categorizedInvoices = overdueList.map(inv => {
        const dueDate = inv.dueDate?.toDate();
        const daysOverdue = dueDate ? Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)) : 0;

        let category = 'current';
        if (daysOverdue > 90) category = '90+ days';
        else if (daysOverdue > 60) category = '60-90 days';
        else if (daysOverdue > 30) category = '30-60 days';
        else if (daysOverdue > 0) category = '1-30 days';

        return {
          ...inv,
          daysOverdue,
          category
        };
      });

      setOverdueInvoices(categorizedInvoices);

      // Calculate aging report data
      const aging = {
        'current': 0,
        '1-30 days': 0,
        '30-60 days': 0,
        '60-90 days': 0,
        '90+ days': 0
      };

      categorizedInvoices.forEach(inv => {
        aging[inv.category] += (inv.amount || 0);
      });

      const agingChartData = Object.entries(aging).map(([name, value]) => ({
        name,
        value
      }));

      setAgingData(agingChartData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching overdue invoices:', error);
      setSnackbar({ open: true, message: 'Error loading collections data', severity: 'error' });
      setLoading(false);
    });

    unsubscribers.push(unsubOverdue);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const handleSendReminder = async (invoice) => {
    try {
      await updateDoc(doc(db, 'invoices', invoice.id), {
        lastReminder: new Date()
      });
      setSnackbar({ open: true, message: 'Payment reminder sent', severity: 'success' });
    } catch (error) {
      console.error('Error sending reminder:', error);
      setSnackbar({ open: true, message: 'Error sending reminder', severity: 'error' });
    }
  };

  const stats = {
    totalOverdue: overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    overdueCount: overdueInvoices.length,
    critical: overdueInvoices.filter(inv => inv.daysOverdue > 60).length,
    averageDaysOverdue: overdueInvoices.length > 0
      ? Math.floor(overdueInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / overdueInvoices.length)
      : 0
  };

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

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
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Collections & Accounts Receivable
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Overdue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    ${stats.totalOverdue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.50', color: 'error.main' }}>
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
                    Overdue Invoices
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.overdueCount}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main' }}>
                  <AlertCircle size={24} />
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
                    Critical (60+ Days)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {stats.critical}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.50', color: 'error.main' }}>
                  <TrendingDown size={24} />
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
                    Avg Days Overdue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.averageDaysOverdue}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.50', color: 'info.main' }}>
                  <Clock size={24} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Overdue Invoices" />
          <Tab label="Aging Report" />
          <Tab label="Collection Tools" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Days Overdue</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overdueInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No overdue invoices
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invoice.clientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.clientEmail}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate?.toDate ? invoice.dueDate.toDate().toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${invoice.daysOverdue} days`}
                          size="small"
                          color={invoice.daysOverdue > 60 ? 'error' : invoice.daysOverdue > 30 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.category}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleSendReminder(invoice)}
                          title="Send Reminder"
                        >
                          <Send size={16} />
                        </IconButton>
                        <IconButton size="small" title="Call Client">
                          <Phone size={16} />
                        </IconButton>
                        <IconButton size="small" title="Email Client">
                          <Mail size={16} />
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Aging Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: $${value.toLocaleString()}` : ''}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {agingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Aging by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Automated Reminders
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Set up automatic payment reminders for overdue invoices.
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Reminder Frequency"
                  defaultValue="7days"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="3days">Every 3 Days</MenuItem>
                  <MenuItem value="7days">Every 7 Days</MenuItem>
                  <MenuItem value="14days">Every 14 Days</MenuItem>
                  <MenuItem value="30days">Every 30 Days</MenuItem>
                </TextField>
                <Button variant="contained" fullWidth disabled>
                  Enable Automation (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Collection Templates
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage email and SMS templates for collection communications.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" fullWidth startIcon={<Mail size={18} />}>
                    Email Templates
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<Phone size={18} />}>
                    SMS Templates
                  </Button>
                  <Button variant="outlined" fullWidth startIcon={<FileText size={18} />}>
                    Letter Templates
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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

export default CollectionsTab;
