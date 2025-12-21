import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Add as AddIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CardGiftcard as GiftIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const REFERRAL_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'default' },
  { value: 'contacted', label: 'Contacted', color: 'info' },
  { value: 'converted', label: 'Converted', color: 'success' },
  { value: 'lost', label: 'Lost', color: 'error' }
];

const REWARD_TYPES = [
  { value: 'credit', label: 'Account Credit', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'gift', label: 'Gift Card', icon: '🎁' }
];

function AddReferralDialog({ open, onClose, onAdd }) {
  const [referral, setReferral] = useState({
    referrerId: '',
    referrerName: '',
    referredName: '',
    referredEmail: '',
    referredPhone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!referral.referredName || !referral.referredEmail) return;
    setLoading(true);
    await onAdd(referral);
    setLoading(false);
    setReferral({
      referrerId: '',
      referrerName: '',
      referredName: '',
      referredEmail: '',
      referredPhone: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Referral</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Referred By (Client Name)"
              value={referral.referrerName}
              onChange={(e) => setReferral({ ...referral, referrerName: e.target.value })}
              helperText="Enter the name of the client who made the referral"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Referred Person's Name"
              value={referral.referredName}
              onChange={(e) => setReferral({ ...referral, referredName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={referral.referredEmail}
              onChange={(e) => setReferral({ ...referral, referredEmail: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={referral.referredPhone}
              onChange={(e) => setReferral({ ...referral, referredPhone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={referral.notes}
              onChange={(e) => setReferral({ ...referral, notes: e.target.value })}
              placeholder="Any additional information..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={loading || !referral.referredName || !referral.referredEmail}
          startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
        >
          Add Referral
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ReferralManager() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const getAnalytics = httpsCallable(functions, 'getReferralAnalytics');
      const result = await getAnalytics({});
      setAnalytics(result.data.analytics);
      setReferrals(result.data.referrals || []);
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReferral = async (referralData) => {
    try {
      // In real implementation, we'd need to look up the referrer's client ID
      const createReferral = httpsCallable(functions, 'createReferral');
      await createReferral({
        ...referralData,
        referrerId: 'placeholder' // Would be actual client ID
      });
      loadData();
    } catch (err) {
      console.error('Error adding referral:', err);
    }
  };

  const getFilteredReferrals = () => {
    switch (activeTab) {
      case 0: return referrals.filter(r => r.status === 'pending');
      case 1: return referrals.filter(r => r.status === 'contacted');
      case 2: return referrals.filter(r => r.status === 'converted');
      case 3: return referrals;
      default: return referrals;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Referral Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and reward client referrals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Referral
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold">
                {analytics?.totalReferrals || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Referrals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {analytics?.convertedReferrals || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Converted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ color: 'info.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {analytics?.conversionRate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GiftIcon sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                ${analytics?.totalRewardsAwarded || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Rewards Paid</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Referrers */}
      {analytics?.topReferrers?.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🏆 Top Referrers
          </Typography>
          <Grid container spacing={2}>
            {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={referrer.referrerId}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 1,
                        bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'grey.400' : index === 2 ? 'warning.700' : 'primary.main'
                      }}
                    >
                      {index < 3 ? <TrophyIcon /> : referrer.referrerName?.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                      {referrer.referrerName}
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {referrer.converted}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      converted ({referrer.total} total)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Referrals Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pending
                <Chip size="small" label={referrals.filter(r => r.status === 'pending').length} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Contacted
                <Chip size="small" label={referrals.filter(r => r.status === 'contacted').length} color="info" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Converted
                <Chip size="small" label={referrals.filter(r => r.status === 'converted').length} color="success" />
              </Box>
            }
          />
          <Tab label="All Referrals" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Referred By</TableCell>
                <TableCell>Referral Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reward</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredReferrals().map((referral, index) => {
                const status = REFERRAL_STATUSES.find(s => s.value === referral.status);
                return (
                  <TableRow key={referral.id || index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {referral.referrerName?.charAt(0) || 'R'}
                        </Avatar>
                        <Typography variant="body2">{referral.referrerName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {referral.referredName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{referral.referredEmail}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {referral.referredPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={status?.label} color={status?.color} />
                    </TableCell>
                    <TableCell>
                      {referral.status === 'converted' ? (
                        <Chip
                          size="small"
                          icon={<GiftIcon />}
                          label={`$${referral.rewardAmount || 0} ${referral.rewardType || ''}`}
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {referral.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" href={`mailto:${referral.referredEmail}`}>
                        <EmailIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" href={`tel:${referral.referredPhone}`}>
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {getFilteredReferrals().length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      No referrals in this category
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Referral Program Info */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.50' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🎁 Referral Reward Program
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>💳</Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Account Credit</Typography>
                <Typography variant="body2" color="text.secondary">
                  $50 credit per converted referral
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>🎁</Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">Gift Cards</Typography>
                <Typography variant="body2" color="text.secondary">
                  $25 gift card for 3+ referrals
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>🏆</Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">VIP Status</Typography>
                <Typography variant="body2" color="text.secondary">
                  Free month after 5 converted referrals
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Add Referral Dialog */}
      <AddReferralDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={addReferral}
      />
    </Box>
  );
}

// Fix missing import
const CheckCircle = CheckIcon;
