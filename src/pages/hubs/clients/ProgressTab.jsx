// Path: /src/pages/hubs/clients/ProgressTab.jsx
// ============================================================================
// CLIENTS HUB - PROGRESS TAB
// ============================================================================
// Purpose: Milestones and success metrics tracking with timeline view
// Version: 1.0.0
// Last Updated: 2025-12-10
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  CreditCard,
  DollarSign,
  Activity,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../contexts/AuthContext';

const ProgressTab = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    clientId: '',
    milestoneType: 'score_increase',
    title: '',
    description: '',
    currentScore: '',
    previousScore: '',
    goalScore: '',
    itemsRemoved: 0,
    accountsUpdated: 0,
    status: 'in_progress'
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const q = query(
        collection(db, 'clientProgress'),
        where('clientId', '==', selectedClient),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const progress = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProgressData(progress);

        const milestoneData = progress.filter(p => p.status === 'completed');
        setMilestones(milestoneData);
      });

      return () => unsubscribe();
    }
  }, [selectedClient]);

  const handleAddMilestone = () => {
    setFormData({
      clientId: selectedClient,
      milestoneType: 'score_increase',
      title: '',
      description: '',
      currentScore: '',
      previousScore: '',
      goalScore: '',
      itemsRemoved: 0,
      accountsUpdated: 0,
      status: 'in_progress'
    });
    setDialogOpen(true);
  };

  const handleSaveMilestone = async () => {
    try {
      await addDoc(collection(db, 'clientProgress'), {
        ...formData,
        createdAt: serverTimestamp(),
        createdBy: userProfile?.email,
        updatedAt: serverTimestamp()
      });

      setSnackbar({
        open: true,
        message: 'Milestone added successfully',
        severity: 'success'
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving milestone:', error);
      setSnackbar({
        open: true,
        message: 'Error saving milestone',
        severity: 'error'
      });
    }
  };

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'score_increase':
        return <TrendingUp size={20} />;
      case 'item_removed':
        return <CheckCircle size={20} />;
      case 'goal_reached':
        return <Award size={20} />;
      case 'account_updated':
        return <CreditCard size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getMilestoneColor = (type, status) => {
    if (status === 'completed') return 'success';
    if (status === 'in_progress') return 'primary';
    if (status === 'pending') return 'warning';
    return 'default';
  };

  const calculateProgress = () => {
    if (!selectedClient || progressData.length === 0) return 0;

    const completed = progressData.filter(p => p.status === 'completed').length;
    return Math.round((completed / progressData.length) * 100);
  };

  const calculateScoreImprovement = () => {
    if (progressData.length === 0) return 0;

    const scoreChanges = progressData
      .filter(p => p.currentScore && p.previousScore)
      .map(p => parseInt(p.currentScore) - parseInt(p.previousScore));

    if (scoreChanges.length === 0) return 0;

    return scoreChanges.reduce((sum, change) => sum + change, 0);
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Client Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Select Client"
                >
                  <MenuItem value="">
                    <em>Choose a client to view progress</em>
                  </MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleAddMilestone}
                disabled={!selectedClient}
              >
                Add Milestone
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedClient ? (
        <>
          {/* Progress Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'success.50',
                        color: 'success.main'
                      }}
                    >
                      <TrendingUp size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Score Improvement
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        +{calculateScoreImprovement()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.50',
                        color: 'primary.main'
                      }}
                    >
                      <Target size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Overall Progress
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {calculateProgress()}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        color: 'warning.main'
                      }}
                    >
                      <Award size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Milestones
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {milestones.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'info.50',
                        color: 'info.main'
                      }}
                    >
                      <Activity size={24} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Goals
                      </Typography>
                      <Typography variant="h5" fontWeight={600}>
                        {progressData.filter(p => p.status === 'in_progress').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Progress Details */}
          <Grid container spacing={3}>
            {/* Timeline */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Progress Timeline
                  </Typography>

                  {progressData.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AlertCircle size={48} color="#999" style={{ marginBottom: 16 }} />
                      <Typography variant="body1" color="text.secondary">
                        No progress milestones yet
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Plus size={18} />}
                        onClick={handleAddMilestone}
                        sx={{ mt: 2 }}
                      >
                        Add First Milestone
                      </Button>
                    </Box>
                  ) : (
                    <Timeline position="right">
                      {progressData.map((item, index) => (
                        <TimelineItem key={item.id}>
                          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                            <Typography variant="caption">
                              {item.createdAt?.toDate().toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {item.createdAt?.toDate().toLocaleTimeString()}
                            </Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot color={getMilestoneColor(item.milestoneType, item.status)}>
                              {getMilestoneIcon(item.milestoneType)}
                            </TimelineDot>
                            {index < progressData.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {item.title}
                                </Typography>
                                <Chip
                                  label={item.status}
                                  color={getMilestoneColor(item.milestoneType, item.status)}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {item.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {item.currentScore && (
                                  <Chip
                                    label={`Current: ${item.currentScore}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {item.previousScore && (
                                  <Chip
                                    label={`Previous: ${item.previousScore}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {item.itemsRemoved > 0 && (
                                  <Chip
                                    label={`${item.itemsRemoved} items removed`}
                                    size="small"
                                    color="success"
                                  />
                                )}
                                {item.accountsUpdated > 0 && (
                                  <Chip
                                    label={`${item.accountsUpdated} accounts updated`}
                                    size="small"
                                    color="info"
                                  />
                                )}
                              </Box>
                            </Paper>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Client Info & Goals */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Client Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                      {selectedClientData?.name?.[0] || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedClientData?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedClientData?.email}
                      </Typography>
                      <Chip
                        label={selectedClientData?.status}
                        size="small"
                        color={selectedClientData?.status === 'active' ? 'success' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body1">
                      {selectedClientData?.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quick Stats
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Total Milestones"
                        secondary={progressData.length}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Completed"
                        secondary={progressData.filter(p => p.status === 'completed').length}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="In Progress"
                        secondary={progressData.filter(p => p.status === 'in_progress').length}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Items Removed"
                        secondary={progressData.reduce((sum, p) => sum + (p.itemsRemoved || 0), 0)}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Accounts Updated"
                        secondary={progressData.reduce((sum, p) => sum + (p.accountsUpdated || 0), 0)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BarChart3 size={64} color="#999" style={{ marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                Select a Client
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a client from the dropdown above to view their progress and milestones
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Progress Milestone</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Milestone Type</InputLabel>
                <Select
                  value={formData.milestoneType}
                  onChange={(e) => setFormData({ ...formData, milestoneType: e.target.value })}
                  label="Milestone Type"
                >
                  <MenuItem value="score_increase">Score Increase</MenuItem>
                  <MenuItem value="item_removed">Negative Item Removed</MenuItem>
                  <MenuItem value="goal_reached">Goal Reached</MenuItem>
                  <MenuItem value="account_updated">Account Updated</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Credit Score Increased to 700"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the progress or achievement..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Previous Score"
                value={formData.previousScore}
                onChange={(e) => setFormData({ ...formData, previousScore: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Current Score"
                value={formData.currentScore}
                onChange={(e) => setFormData({ ...formData, currentScore: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Items Removed"
                value={formData.itemsRemoved}
                onChange={(e) => setFormData({ ...formData, itemsRemoved: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Accounts Updated"
                value={formData.accountsUpdated}
                onChange={(e) => setFormData({ ...formData, accountsUpdated: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveMilestone} variant="contained">
            Add Milestone
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProgressTab;
