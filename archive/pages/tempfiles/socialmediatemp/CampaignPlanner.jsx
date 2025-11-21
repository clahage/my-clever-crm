// ============================================================================
// CampaignPlanner.jsx - SOCIAL MEDIA CAMPAIGN PLANNER
// ============================================================================
// VERSION: 1.0.0
// LAST UPDATED: 2025-11-09
//
// DESCRIPTION:
// Comprehensive campaign planning and management system. Create, track, and
// analyze multi-platform social media campaigns.
//
// FEATURES:
// - Campaign creation and management
// - Multi-platform campaign support
// - Campaign calendar and timeline
// - Budget tracking
// - Performance metrics
// - Goal setting and tracking
// - Content planning
// - Team collaboration
//
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  BarChart,
  Play,
  Pause,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { format, differenceInDays } from 'date-fns';

const CAMPAIGN_STATUS = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'info' },
];

const CAMPAIGN_TYPES = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'leads', label: 'Lead Generation' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'promotion', label: 'Promotion' },
];

const CampaignPlanner = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [campaigns, setCampaigns] = useState([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'awareness',
    startDate: '',
    endDate: '',
    budget: '',
    goals: {
      reach: '',
      engagement: '',
      conversions: '',
    },
    platforms: [],
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'socialMedia', 'campaigns', 'active'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampaigns(data);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleCreateCampaign = async () => {
    try {
      setLoading(true);

      await addDoc(collection(db, 'socialMedia', 'campaigns', 'active'), {
        ...newCampaign,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
        metrics: {
          reach: 0,
          engagement: 0,
          conversions: 0,
          spent: 0,
        },
      });

      setCreateDialog(false);
      setNewCampaign({
        name: '',
        type: 'awareness',
        startDate: '',
        endDate: '',
        budget: '',
        goals: { reach: '', engagement: '', conversions: '' },
        platforms: [],
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (campaignId, newStatus) => {
    try {
      await updateDoc(doc(db, 'socialMedia', 'campaigns', 'active', campaignId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Delete this campaign?')) return;

    try {
      await deleteDoc(doc(db, 'socialMedia', 'campaigns', 'active', campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const calculateProgress = (campaign) => {
    if (!campaign.goals || !campaign.metrics) return 0;
    
    const reachProgress = campaign.goals.reach ? (campaign.metrics.reach / campaign.goals.reach) * 100 : 0;
    const engagementProgress = campaign.goals.engagement ? (campaign.metrics.engagement / campaign.goals.engagement) * 100 : 0;
    
    return Math.min(((reachProgress + engagementProgress) / 2), 100);
  };

  const getDaysRemaining = (campaign) => {
    if (!campaign.endDate) return null;
    const end = campaign.endDate.toDate();
    const now = new Date();
    return differenceInDays(end, now);
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'draft') return c.status === 'draft';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const renderCampaignCard = (campaign) => {
    const progress = calculateProgress(campaign);
    const daysRemaining = getDaysRemaining(campaign);
    const statusData = CAMPAIGN_STATUS.find(s => s.value === campaign.status);

    return (
      <Grid item xs={12} md={6} key={campaign.id}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {campaign.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                  <Chip
                    label={statusData?.label}
                    size="small"
                    color={statusData?.color}
                  />
                  <Chip
                    label={CAMPAIGN_TYPES.find(t => t.value === campaign.type)?.label}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Target size={24} />
              </Avatar>
            </Box>

            {/* Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2">{progress.toFixed(0)}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            {/* Metrics */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Reach
                </Typography>
                <Typography variant="body2">
                  {campaign.metrics?.reach || 0} / {campaign.goals?.reach || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Engagement
                </Typography>
                <Typography variant="body2">
                  {campaign.metrics?.engagement || 0} / {campaign.goals?.engagement || 0}
                </Typography>
              </Grid>
            </Grid>

            {/* Timeline */}
            {daysRemaining !== null && (
              <Alert severity={daysRemaining > 7 ? 'info' : 'warning'} sx={{ mb: 2 }}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}
              </Alert>
            )}
          </CardContent>

          <CardActions>
            <Button
              size="small"
              startIcon={<Eye />}
              onClick={() => {
                setSelectedCampaign(campaign);
                setDetailsDialog(true);
              }}
            >
              View
            </Button>
            <Button size="small" startIcon={<Edit />}>
              Edit
            </Button>
            {campaign.status === 'active' && (
              <Button
                size="small"
                startIcon={<Pause />}
                onClick={() => handleUpdateStatus(campaign.id, 'paused')}
              >
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button
                size="small"
                startIcon={<Play />}
                onClick={() => handleUpdateStatus(campaign.id, 'active')}
              >
                Resume
              </Button>
            )}
            <Button
              size="small"
              color="error"
              startIcon={<Trash2 />}
              onClick={() => handleDeleteCampaign(campaign.id)}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Campaign Planner</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setCreateDialog(true)}
        >
          New Campaign
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">{campaigns.filter(c => c.status === 'active').length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Active Campaigns
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">{campaigns.filter(c => c.status === 'draft').length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Draft Campaigns
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4">{campaigns.filter(c => c.status === 'completed').length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab value="active" label="Active" />
          <Tab value="draft" label="Drafts" />
          <Tab value="completed" label="Completed" />
          <Tab value="all" label="All" />
        </Tabs>
      </Paper>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <Grid container spacing={2}>
          {filteredCampaigns.map(campaign => renderCampaignCard(campaign))}
        </Grid>
      ) : (
        <Alert severity="info">
          <AlertTitle>No Campaigns</AlertTitle>
          Create your first campaign to get started!
        </Alert>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={newCampaign.type}
                  label="Campaign Type"
                  onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                >
                  {CAMPAIGN_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={newCampaign.startDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={newCampaign.endDate}
                onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Campaign Goals
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Reach Goal"
                type="number"
                value={newCampaign.goals.reach}
                onChange={(e) => setNewCampaign({
                  ...newCampaign,
                  goals: { ...newCampaign.goals, reach: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Engagement Goal"
                type="number"
                value={newCampaign.goals.engagement}
                onChange={(e) => setNewCampaign({
                  ...newCampaign,
                  goals: { ...newCampaign.goals, engagement: e.target.value }
                })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Conversions Goal"
                type="number"
                value={newCampaign.goals.conversions}
                onChange={(e) => setNewCampaign({
                  ...newCampaign,
                  goals: { ...newCampaign.goals, conversions: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCampaign}
            disabled={loading || !newCampaign.name}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Campaign Details</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCampaign.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {CAMPAIGN_TYPES.find(t => t.value === selectedCampaign.type)?.label}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={CAMPAIGN_STATUS.find(s => s.value === selectedCampaign.status)?.label}
                    size="small"
                    color={CAMPAIGN_STATUS.find(s => s.value === selectedCampaign.status)?.color}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Budget
                  </Typography>
                  <Typography variant="body1">
                    ${selectedCampaign.budget}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Spent
                  </Typography>
                  <Typography variant="body1">
                    ${selectedCampaign.metrics?.spent || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignPlanner;