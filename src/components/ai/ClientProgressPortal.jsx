// ============================================================================
// CLIENT PROGRESS PORTAL - VISUAL TIMELINE & MILESTONES
// ============================================================================
// Real-time visual timeline of client's credit repair journey
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Gavel,
  Delete,
  EmojiEvents,
  Assessment,
  Star,
  Refresh,
  Flag,
  Celebration,
  Speed,
  ArrowUpward,
  Schedule,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Score Trend Chart (simplified)
const ScoreTrendChart = ({ progression }) => {
  if (!progression || progression.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Not enough data for trend
      </Typography>
    );
  }

  const first = progression[0]?.average || 0;
  const last = progression[progression.length - 1]?.average || 0;
  const change = last - first;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Starting Score</Typography>
          <Typography variant="h5" fontWeight="bold">{first}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          {change >= 0 ? (
            <TrendingUp sx={{ fontSize: 48, color: 'success.main' }} />
          ) : (
            <TrendingDown sx={{ fontSize: 48, color: 'error.main' }} />
          )}
          <Typography
            variant="h6"
            fontWeight="bold"
            color={change >= 0 ? 'success.main' : 'error.main'}
          >
            {change >= 0 ? '+' : ''}{change} pts
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">Current Score</Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">{last}</Typography>
        </Box>
      </Box>

      {/* Simple visual bar */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        {progression.map((p, idx) => (
          <Tooltip key={idx} title={`${p.date?.toLocaleDateString?.() || 'Date'}: ${p.average}`}>
            <Box
              sx={{
                width: 40,
                height: Math.max(20, (p.average - 300) / 5),
                bgcolor: idx === progression.length - 1 ? 'primary.main' : 'primary.light',
                borderRadius: 1,
                transition: 'all 0.3s',
                '&:hover': { transform: 'scaleY(1.1)' },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

// Milestone Badge
const MilestoneBadge = ({ milestone }) => {
  const icons = {
    star: <Star />,
    stars: <EmojiEvents />,
    emoji_events: <Celebration />,
    trending_up: <TrendingUp />,
    rocket: <Speed />,
    check_circle: <CheckCircle />,
  };

  return (
    <Chip
      icon={icons[milestone.icon] || <Star />}
      label={milestone.name}
      color={milestone.achieved ? 'success' : 'default'}
      variant={milestone.achieved ? 'filled' : 'outlined'}
      size="small"
      sx={{ m: 0.5 }}
    />
  );
};

// Timeline Event Card
const TimelineEventCard = ({ event }) => {
  const icons = {
    dispute_created: <Gavel />,
    item_deleted: <Delete />,
    credit_report: <Assessment />,
    victory: <EmojiEvents />,
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${event.color || '#6366f1'}`,
        bgcolor: event.celebration ? 'success.lighter' : 'background.paper',
      }}
    >
      <CardContent sx={{ py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${event.color}20`, color: event.color, width: 36, height: 36 }}>
            {icons[event.type] || <Flag />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {event.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {event.description}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              {event.date?.toLocaleDateString?.() || 'Recent'}
            </Typography>
            {event.celebration && (
              <Celebration sx={{ color: 'warning.main', fontSize: 20, ml: 1 }} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ClientProgressPortal = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [timeline, setTimeline] = useState(null);

  // Load clients
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsQuery = query(
        collection(db, 'contacts'),
        where('type', '==', 'client'),
        orderBy('lastName'),
        limit(100)
      );
      const snap = await getDocs(clientsQuery);
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadTimeline = async () => {
    if (!selectedClient) return;

    setLoading(true);
    setError(null);

    try {
      const generate = httpsCallable(functions, 'generateProgressTimeline');
      const result = await generate({ clientId: selectedClient.id });

      if (result.data.success) {
        setTimeline(result.data);
      }
    } catch (err) {
      console.error('Timeline error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      loadTimeline();
    }
  }, [selectedClient]);

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <TimelineIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Client Progress Portal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Visual timeline of credit repair journey
              </Typography>
            </Box>
          </Box>
          {selectedClient && (
            <IconButton onClick={loadTimeline} sx={{ color: 'white' }} disabled={loading}>
              <Refresh />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Client Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Autocomplete
          options={clients}
          getOptionLabel={(c) => `${c.firstName} ${c.lastName} - ${c.email}`}
          value={selectedClient}
          onChange={(e, v) => setSelectedClient(v)}
          renderInput={(params) => (
            <TextField {...params} label="Select Client" variant="outlined" />
          )}
        />
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Timeline Content */}
      {timeline && !loading && (
        <Grid container spacing={3}>
          {/* Progress Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                <Assessment sx={{ verticalAlign: 'middle', mr: 1 }} />
                Progress Overview
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {timeline.progress?.totalDisputes || 0}
                    </Typography>
                    <Typography variant="caption">Total Disputes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {timeline.progress?.deletedItems || 0}
                    </Typography>
                    <Typography variant="caption">Items Deleted</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Deletion Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(timeline.progress?.deletionRate) || 0}
                    sx={{ flex: 1, height: 10, borderRadius: 5 }}
                    color="success"
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {timeline.progress?.deletionRate}%
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Score Change */}
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: timeline.scoreChange >= 0 ? 'success.lighter' : 'error.lighter', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {timeline.scoreChange >= 0 ? (
                    <ArrowUpward sx={{ color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ color: 'error.main' }} />
                  )}
                  <Typography variant="h4" fontWeight="bold" color={timeline.scoreChange >= 0 ? 'success.main' : 'error.main'}>
                    {timeline.scoreChange >= 0 ? '+' : ''}{timeline.scoreChange || 0}
                  </Typography>
                </Box>
                <Typography variant="caption">Score Change</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Score Trend */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                Credit Score Journey
              </Typography>
              <ScoreTrendChart progression={timeline.scoreProgression} />
            </Paper>
          </Grid>

          {/* Milestones */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                Milestones & Achievements
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {timeline.milestones?.map((milestone, idx) => (
                  <MilestoneBadge key={idx} milestone={milestone} />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Timeline Events */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Activity Timeline
              </Typography>
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {timeline.timeline?.map((event, idx) => (
                  <TimelineEventCard key={idx} event={event} />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!timeline && !loading && !selectedClient && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a client to view their progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            See their complete credit repair journey with milestones and achievements
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ClientProgressPortal;
