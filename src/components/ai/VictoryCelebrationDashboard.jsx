// ============================================================================
// VICTORY CELEBRATION DASHBOARD - CLIENT WINS TRACKER
// ============================================================================
// Track and celebrate client victories with automated celebrations
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  EmojiEvents,
  Celebration,
  Star,
  Delete,
  CheckCircle,
  TrendingUp,
  Send,
  Email,
  Sms,
  Notifications,
  Refresh,
  Add,
  Visibility,
  Timeline,
  Favorite,
} from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

// Victory Card Component
const VictoryCard = ({ victory, onCelebrate, onView }) => {
  const victoryIcons = {
    item_deleted: <Delete sx={{ color: '#22c55e' }} />,
    score_increase: <TrendingUp sx={{ color: '#3b82f6' }} />,
    collection_removed: <CheckCircle sx={{ color: '#8b5cf6' }} />,
    dispute_won: <EmojiEvents sx={{ color: '#f59e0b' }} />,
    goal_reached: <Star sx={{ color: '#ec4899' }} />,
    all_disputes_complete: <Celebration sx={{ color: '#06b6d4' }} />,
  };

  const victoryColors = {
    item_deleted: '#22c55e',
    score_increase: '#3b82f6',
    collection_removed: '#8b5cf6',
    dispute_won: '#f59e0b',
    goal_reached: '#ec4899',
    all_disputes_complete: '#06b6d4',
  };

  const color = victoryColors[victory.victoryType] || '#6366f1';

  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: `${color}20` }}>
              {victoryIcons[victory.victoryType] || <EmojiEvents />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {victory.clientName || 'Client'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {victory.victoryType?.replace(/_/g, ' ').toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={victory.celebrated ? 'Celebrated' : 'New'}
            size="small"
            color={victory.celebrated ? 'default' : 'success'}
          />
        </Box>

        {victory.details && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2">
              {victory.details.creditor && `Creditor: ${victory.details.creditor}`}
              {victory.details.pointsGained && ` • +${victory.details.pointsGained} points`}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Celebration />}
            onClick={() => onCelebrate(victory)}
            disabled={victory.celebrated}
            sx={{ bgcolor: color }}
          >
            Celebrate
          </Button>
          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => onView(victory)}>
            View
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          {victory.createdAt?.toDate ? victory.createdAt.toDate().toLocaleDateString() : 'Recently'}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Stats Card
const StatsCard = ({ icon: Icon, title, value, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color="success.main">
              {trend}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48 }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const VictoryCelebrationDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [victories, setVictories] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [celebrateDialog, setCelebrateDialog] = useState({ open: false, victory: null });
  const [stats, setStats] = useState({
    totalVictories: 0,
    thisWeek: 0,
    itemsDeleted: 0,
    scoreIncreases: 0,
  });

  // Load victories
  useEffect(() => {
    const q = query(
      collection(db, 'victories'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const victoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVictories(victoriesData);

      // Calculate stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      setStats({
        totalVictories: victoriesData.length,
        thisWeek: victoriesData.filter(v => {
          const date = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt);
          return date > weekAgo;
        }).length,
        itemsDeleted: victoriesData.filter(v => v.victoryType === 'item_deleted').length,
        scoreIncreases: victoriesData.filter(v => v.victoryType === 'score_increase').length,
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const triggerCelebration = async (victory) => {
    try {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
      });

      const celebrate = httpsCallable(functions, 'triggerVictoryCelebration');
      await celebrate({
        clientId: victory.clientId,
        victoryType: victory.victoryType,
        details: victory.details,
      });

      setCelebrateDialog({ open: false, victory: null });
    } catch (error) {
      console.error('Celebration error:', error);
    }
  };

  const newVictories = victories.filter(v => !v.celebrated);
  const celebratedVictories = victories.filter(v => v.celebrated);

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
              <EmojiEvents sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Victory Celebration Center
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Celebrate client wins and boost engagement
              </Typography>
            </Box>
          </Box>
          <Badge badgeContent={newVictories.length} color="error">
            <Chip
              icon={<Celebration />}
              label="New Wins!"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Badge>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatsCard
            icon={EmojiEvents}
            title="Total Victories"
            value={stats.totalVictories}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            icon={Star}
            title="This Week"
            value={stats.thisWeek}
            color="#3b82f6"
            trend="+12% from last week"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            icon={Delete}
            title="Items Deleted"
            value={stats.itemsDeleted}
            color="#22c55e"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard
            icon={TrendingUp}
            title="Score Increases"
            value={stats.scoreIncreases}
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab
            icon={<Badge badgeContent={newVictories.length} color="error"><Celebration /></Badge>}
            label="New Wins"
          />
          <Tab icon={<CheckCircle />} label="Celebrated" />
          <Tab icon={<Timeline />} label="All Time" />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(activeTab === 0 ? newVictories : activeTab === 1 ? celebratedVictories : victories).map((victory) => (
            <Grid item xs={12} sm={6} md={4} key={victory.id}>
              <VictoryCard
                victory={victory}
                onCelebrate={(v) => setCelebrateDialog({ open: true, victory: v })}
                onView={(v) => console.log('View victory:', v)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && victories.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No victories yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Victories will appear here as disputes are won
          </Typography>
        </Paper>
      )}

      {/* Celebrate Dialog */}
      <Dialog
        open={celebrateDialog.open}
        onClose={() => setCelebrateDialog({ open: false, victory: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Celebration sx={{ color: 'warning.main' }} />
            Celebrate Victory!
          </Box>
        </DialogTitle>
        <DialogContent>
          {celebrateDialog.victory && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {celebrateDialog.victory.clientName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Victory: {celebrateDialog.victory.victoryType?.replace(/_/g, ' ')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Celebration will include:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light' }}><Email /></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Personalized celebration email" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}><Sms /></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Congratulations SMS" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}><Notifications /></Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="In-app celebration banner" />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCelebrateDialog({ open: false, victory: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Celebration />}
            onClick={() => triggerCelebration(celebrateDialog.victory)}
            sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' }}
          >
            Send Celebration!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VictoryCelebrationDashboard;
