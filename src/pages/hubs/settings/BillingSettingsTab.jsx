import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, LinearProgress
} from '@mui/material';
import { CreditCard, Download, CheckCircle, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    interval: 'month',
    features: [
      'Up to 50 clients',
      '100 credit reports/month',
      'Email support',
      'Basic features',
      'Single user'
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    popular: true,
    features: [
      'Up to 200 clients',
      '500 credit reports/month',
      'Priority support',
      'Advanced features',
      'API access',
      'Up to 5 users'
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited clients',
      'Unlimited credit reports',
      '24/7 support',
      'All features',
      'Custom integrations',
      'Dedicated account manager',
      'Unlimited users',
      'White label option'
    ],
  },
];

const BillingSettingsTab = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usage, setUsage] = useState({
    clients: 145,
    maxClients: 200,
    reports: 312,
    maxReports: 500
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);

      // Load current subscription
      const subRef = doc(db, 'billingSettings', currentUser.uid);
      const subSnap = await getDoc(subRef);
      if (subSnap.exists()) {
        setCurrentPlan(subSnap.data());
      } else {
        // Default to professional plan
        setCurrentPlan({
          plan: 'professional',
          status: 'active',
          nextBilling: new Date(2026, 0, 15), // January 15, 2026
          amount: 99.00
        });
      }

      // Load billing history
      const historyQuery = query(
        collection(db, 'billingHistory'),
        orderBy('date', 'desc'),
        limit(12)
      );
      const historySnap = await getDocs(historyQuery);
      const historyData = historySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (historyData.length > 0) {
        setBillingHistory(historyData);
      } else {
        // Generate sample billing history
        const sampleHistory = Array.from({ length: 6 }, (_, i) => ({
          id: `inv-${i}`,
          date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
          description: 'Professional Plan - Monthly',
          amount: 99.00,
          status: 'paid'
        }));
        setBillingHistory(sampleHistory);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentPlanInfo = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan?.plan) || SUBSCRIPTION_PLANS[1];
  const clientsPercent = (usage.clients / usage.maxClients) * 100;
  const reportsPercent = (usage.reports / usage.maxReports) * 100;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CreditCard size={24} />
        <div>
          <Typography variant="h5" fontWeight="bold">
            Billing & Subscription
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your subscription and billing settings
          </Typography>
        </div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current Plan */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
              Current Plan: {currentPlanInfo.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              Your subscription renews on {format(currentPlan?.nextBilling || new Date(), 'MMMM dd, yyyy')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Clients
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {usage.clients} / {usage.maxClients}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={clientsPercent}
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Reports
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {usage.reports} / {usage.maxReports}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={reportsPercent}
                  sx={{
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Monthly Cost
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${currentPlan?.amount?.toFixed(2) || '99.00'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Status
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {currentPlan?.status || 'Active'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Upgrade Plan
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Manage Billing
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Available Plans */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
        Available Plans
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  size="small"
                  color="primary"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  {plan.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h3" fontWeight="bold">
                    ${plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    /{plan.interval}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, mb: 2 }}>
                  {plan.features.map((feature, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <CheckCircle size={16} style={{ color: '#10B981' }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant={plan.id === currentPlan?.plan ? 'outlined' : 'contained'}
                  fullWidth
                  disabled={plan.id === currentPlan?.plan}
                >
                  {plan.id === currentPlan?.plan ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Billing History */}
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="600">
            Billing History
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingHistory.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell>
                    {format(invoice.date.toDate ? invoice.date.toDate() : new Date(invoice.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell fontWeight="600">
                    ${invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      size="small"
                      color={invoice.status === 'paid' ? 'success' : 'warning'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<Download size={16} />}
                      variant="outlined"
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BillingSettingsTab;
