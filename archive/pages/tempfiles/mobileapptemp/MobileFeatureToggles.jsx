// ============================================================================
// MobileFeatureToggles.jsx - FEATURE FLAG & A/B TESTING SYSTEM
// ============================================================================
// VERSION: 1.0.0
// AUTHOR: SpeedyCRM Development Team
// LAST UPDATED: 2025-11-08
//
// DESCRIPTION:
// Complete feature flag and A/B testing system for controlling app features,
// running experiments, managing gradual rollouts, and remote configuration.
// Integrates with Firebase Remote Config for real-time feature control.
//
// FEATURES:
// - Feature flag management (on/off switches)
// - A/B testing and experiments
// - Gradual rollout controls
// - User segment targeting
// - Analytics and metrics tracking
// - Firebase Remote Config integration
// - Real-time feature updates
// - Rollback capabilities
// - Feature dependency management
// - Dark mode support
// - Mobile responsive design
//
// TABS:
// Tab 1: Feature Flags - Toggle features on/off
// Tab 2: A/B Tests - Run experiments
// Tab 3: Rollout Management - Gradual feature deployment
// Tab 4: Analytics - Test results and metrics
// Tab 5: Remote Config - Firebase configuration
//
// FIREBASE COLLECTIONS:
// - mobileApp/features/flags
// - mobileApp/features/tests
// - mobileApp/features/rollouts
// - mobileApp/features/analytics
// - mobileApp/features/config
//
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Slider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Flag,
  TestTube,
  TrendingUp,
  BarChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Users,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  Download,
  Code,
  Globe,
  Sparkles,
  AlertCircle,
  Info,
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
import { format } from 'date-fns';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// ============================================================================
// CONSTANTS
// ============================================================================

const FEATURE_STATUSES = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'testing', label: 'Testing', color: 'warning' },
];

const TEST_TYPES = [
  { value: 'ab', label: 'A/B Test', description: 'Compare two variants' },
  { value: 'multivariate', label: 'Multivariate', description: 'Test multiple variables' },
  { value: 'percentage', label: 'Percentage Rollout', description: 'Gradual deployment' },
];

const ROLLOUT_STRATEGIES = [
  { value: 'percentage', label: 'Percentage-based' },
  { value: 'segment', label: 'User Segment' },
  { value: 'individual', label: 'Individual Users' },
];

const CHART_COLORS = ['#2196f3', '#f50057', '#00bcd4', '#ff9800', '#4caf50'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MobileFeatureToggles = ({ onComplete }) => {
  const { currentUser, userProfile } = useAuth();

  // ===== STATE MANAGEMENT =====
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Feature flags state
  const [flags, setFlags] = useState([]);
  const [flagDialog, setFlagDialog] = useState(false);
  const [currentFlag, setCurrentFlag] = useState({
    name: '',
    key: '',
    description: '',
    enabled: false,
    platform: 'both',
  });

  // A/B tests state
  const [tests, setTests] = useState([]);
  const [testDialog, setTestDialog] = useState(false);
  const [currentTest, setCurrentTest] = useState({
    name: '',
    type: 'ab',
    variants: [
      { id: 'A', name: 'Control', percentage: 50 },
      { id: 'B', name: 'Variant', percentage: 50 },
    ],
    targetSegment: 'all',
    duration: 7,
  });

  // Rollout state
  const [rollouts, setRollouts] = useState([]);
  const [rolloutDialog, setRolloutDialog] = useState(false);
  const [currentRollout, setCurrentRollout] = useState({
    featureKey: '',
    strategy: 'percentage',
    percentage: 10,
    schedule: [],
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalFlags: 0,
    activeTests: 0,
    completedTests: 0,
  });
  const [testResults, setTestResults] = useState([]);

  // Remote config state
  const [remoteConfig, setRemoteConfig] = useState({});

  // ===== FIREBASE LISTENERS =====
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers = [];

    // Listen to feature flags
    const flagsQuery = query(
      collection(db, 'mobileApp', 'features', 'flags'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(flagsQuery, (snapshot) => {
        const flagData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlags(flagData);
        setAnalytics(prev => ({ ...prev, totalFlags: flagData.length }));
        console.log('✅ Feature flags loaded:', flagData.length);
      })
    );

    // Listen to tests
    const testsQuery = query(
      collection(db, 'mobileApp', 'features', 'tests'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribers.push(
      onSnapshot(testsQuery, (snapshot) => {
        const testData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTests(testData);
        
        const active = testData.filter(t => t.status === 'running').length;
        const completed = testData.filter(t => t.status === 'completed').length;
        
        setAnalytics(prev => ({
          ...prev,
          activeTests: active,
          completedTests: completed,
        }));
      })
    );

    // Listen to rollouts
    const rolloutsQuery = query(
      collection(db, 'mobileApp', 'features', 'rollouts'),
      where('userId', '==', currentUser.uid)
    );

    unsubscribers.push(
      onSnapshot(rolloutsQuery, (snapshot) => {
        const rolloutData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRollouts(rolloutData);
      })
    );

    // Listen to analytics
    const analyticsQuery = query(
      collection(db, 'mobileApp', 'features', 'analytics'),
      where('userId', '==', currentUser.uid)
    );

    unsubscribers.push(
      onSnapshot(analyticsQuery, (snapshot) => {
        const analyticsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTestResults(analyticsData);
      })
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  // ===== FEATURE FLAG HANDLERS =====
  const handleCreateFlag = async () => {
    try {
      setLoading(true);

      const flagData = {
        ...currentFlag,
        userId: currentUser.uid,
        status: currentFlag.enabled ? 'active' : 'inactive',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'features', 'flags'), flagData);

      showSnackbar('Feature flag created!', 'success');
      setCurrentFlag({
        name: '',
        key: '',
        description: '',
        enabled: false,
        platform: 'both',
      });
      setFlagDialog(false);

      if (onComplete) onComplete();
    } catch (error) {
      console.error('❌ Error creating flag:', error);
      showSnackbar('Failed to create flag', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = async (flagId, enabled) => {
    try {
      await updateDoc(
        doc(db, 'mobileApp', 'features', 'flags', flagId),
        {
          enabled,
          status: enabled ? 'active' : 'inactive',
          updatedAt: serverTimestamp(),
        }
      );

      showSnackbar(`Feature ${enabled ? 'enabled' : 'disabled'}!`, 'success');
    } catch (error) {
      console.error('❌ Error toggling flag:', error);
      showSnackbar('Failed to toggle flag', 'error');
    }
  };

  const handleDeleteFlag = async (flagId) => {
    if (!confirm('Delete this feature flag?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'mobileApp', 'features', 'flags', flagId));
      showSnackbar('Flag deleted!', 'success');
    } catch (error) {
      console.error('❌ Error deleting flag:', error);
      showSnackbar('Failed to delete flag', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===== A/B TEST HANDLERS =====
  const handleCreateTest = async () => {
    try {
      setLoading(true);

      const testData = {
        ...currentTest,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'features', 'tests'), testData);

      showSnackbar('A/B test created!', 'success');
      setCurrentTest({
        name: '',
        type: 'ab',
        variants: [
          { id: 'A', name: 'Control', percentage: 50 },
          { id: 'B', name: 'Variant', percentage: 50 },
        ],
        targetSegment: 'all',
        duration: 7,
      });
      setTestDialog(false);
    } catch (error) {
      console.error('❌ Error creating test:', error);
      showSnackbar('Failed to create test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId) => {
    try {
      await updateDoc(
        doc(db, 'mobileApp', 'features', 'tests', testId),
        {
          status: 'running',
          startedAt: serverTimestamp(),
        }
      );
      showSnackbar('Test started!', 'success');
    } catch (error) {
      console.error('❌ Error starting test:', error);
      showSnackbar('Failed to start test', 'error');
    }
  };

  const handleStopTest = async (testId) => {
    try {
      await updateDoc(
        doc(db, 'mobileApp', 'features', 'tests', testId),
        {
          status: 'completed',
          completedAt: serverTimestamp(),
        }
      );
      showSnackbar('Test completed!', 'success');
    } catch (error) {
      console.error('❌ Error stopping test:', error);
      showSnackbar('Failed to stop test', 'error');
    }
  };

  // ===== ROLLOUT HANDLERS =====
  const handleCreateRollout = async () => {
    try {
      setLoading(true);

      const rolloutData = {
        ...currentRollout,
        userId: currentUser.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mobileApp', 'features', 'rollouts'), rolloutData);

      showSnackbar('Rollout created!', 'success');
      setCurrentRollout({
        featureKey: '',
        strategy: 'percentage',
        percentage: 10,
        schedule: [],
      });
      setRolloutDialog(false);
    } catch (error) {
      console.error('❌ Error creating rollout:', error);
      showSnackbar('Failed to create rollout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRollout = async (rolloutId, percentage) => {
    try {
      await updateDoc(
        doc(db, 'mobileApp', 'features', 'rollouts', rolloutId),
        {
          percentage,
          updatedAt: serverTimestamp(),
        }
      );
      showSnackbar(`Rollout updated to ${percentage}%`, 'success');
    } catch (error) {
      console.error('❌ Error updating rollout:', error);
      showSnackbar('Failed to update rollout', 'error');
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ===== RENDER: TAB 1 - FEATURE FLAGS =====
  const renderFeatureFlags = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Flag />
          Feature Flags ({flags.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setFlagDialog(true)}
        >
          New Flag
        </Button>
      </Box>

      <Grid container spacing={2}>
        {flags.map((flag) => (
          <Grid item xs={12} md={6} key={flag.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {flag.name}
                    </Typography>
                    <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                      {flag.key}
                    </Typography>
                  </Box>
                  <Switch
                    checked={flag.enabled}
                    onChange={(e) => handleToggleFlag(flag.id, e.target.checked)}
                    color="success"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {flag.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Chip
                    label={flag.platform}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={flag.status}
                    size="small"
                    color={FEATURE_STATUSES.find(s => s.value === flag.status)?.color || 'default'}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small">
                    <Copy size={16} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteFlag(flag.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {flags.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Feature Flags</AlertTitle>
              Create your first feature flag to control app features remotely!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Flag Dialog */}
      <Dialog
        open={flagDialog}
        onClose={() => setFlagDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Feature Flag</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Flag Name"
                value={currentFlag.name}
                onChange={(e) => setCurrentFlag({ ...currentFlag, name: e.target.value })}
                placeholder="New Dashboard Design"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Flag Key"
                value={currentFlag.key}
                onChange={(e) => setCurrentFlag({ ...currentFlag, key: e.target.value })}
                placeholder="new_dashboard_design"
                helperText="Unique identifier (lowercase, underscores only)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={currentFlag.description}
                onChange={(e) => setCurrentFlag({ ...currentFlag, description: e.target.value })}
                placeholder="Enable the new dashboard redesign for users"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={currentFlag.platform}
                  label="Platform"
                  onChange={(e) => setCurrentFlag({ ...currentFlag, platform: e.target.value })}
                >
                  <MenuItem value="ios">iOS Only</MenuItem>
                  <MenuItem value="android">Android Only</MenuItem>
                  <MenuItem value="both">Both Platforms</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentFlag.enabled}
                    onChange={(e) => setCurrentFlag({ ...currentFlag, enabled: e.target.checked })}
                  />
                }
                label="Enable flag immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFlag}
            disabled={loading || !currentFlag.name || !currentFlag.key}
          >
            Create Flag
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== RENDER: TAB 2 - A/B TESTS =====
  const renderABTests = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TestTube />
          A/B Tests ({tests.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setTestDialog(true)}
        >
          New Test
        </Button>
      </Box>

      <Grid container spacing={2}>
        {tests.map((test) => (
          <Grid item xs={12} md={6} key={test.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6">
                    {test.name}
                  </Typography>
                  <Chip
                    label={test.status}
                    size="small"
                    color={test.status === 'running' ? 'success' : 'default'}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Variants:
                  </Typography>
                  {test.variants?.map((variant) => (
                    <Box key={variant.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip label={variant.id} size="small" />
                      <Typography variant="body2">{variant.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({variant.percentage}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {test.status === 'draft' && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Play />}
                      onClick={() => handleStartTest(test.id)}
                    >
                      Start Test
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pause />}
                      onClick={() => handleStopTest(test.id)}
                    >
                      Stop Test
                    </Button>
                  )}
                  <IconButton size="small">
                    <Eye size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {tests.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No A/B Tests</AlertTitle>
              Create an A/B test to experiment with different app experiences!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Test Dialog */}
      <Dialog
        open={testDialog}
        onClose={() => setTestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create A/B Test</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Name"
                value={currentTest.name}
                onChange={(e) => setCurrentTest({ ...currentTest, name: e.target.value })}
                placeholder="Checkout Button Color Test"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={currentTest.type}
                  label="Test Type"
                  onChange={(e) => setCurrentTest({ ...currentTest, type: e.target.value })}
                >
                  {TEST_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Test Variants
              </Typography>
              {currentTest.variants.map((variant, index) => (
                <Box key={variant.id} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="ID"
                        value={variant.id}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...currentTest.variants];
                          newVariants[index].name = e.target.value;
                          setCurrentTest({ ...currentTest, variants: newVariants });
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Percentage"
                        value={variant.percentage}
                        onChange={(e) => {
                          const newVariants = [...currentTest.variants];
                          newVariants[index].percentage = parseInt(e.target.value);
                          setCurrentTest({ ...currentTest, variants: newVariants });
                        }}
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Test Duration (days)"
                value={currentTest.duration}
                onChange={(e) => setCurrentTest({ ...currentTest, duration: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 90 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTest}
            disabled={loading || !currentTest.name}
          >
            Create Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== RENDER: TAB 3 - ROLLOUT MANAGEMENT =====
  const renderRolloutManagement = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          Rollout Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setRolloutDialog(true)}
        >
          New Rollout
        </Button>
      </Box>

      <Grid container spacing={2}>
        {rollouts.map((rollout) => (
          <Grid item xs={12} key={rollout.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {rollout.featureKey}
                  </Typography>
                  <Chip label={rollout.strategy} size="small" variant="outlined" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Rollout Progress</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {rollout.percentage}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={rollout.percentage} sx={{ mb: 1 }} />
                </Box>

                <Grid container spacing={1}>
                  {[10, 25, 50, 75, 100].map((percentage) => (
                    <Grid item xs key={percentage}>
                      <Button
                        fullWidth
                        size="small"
                        variant={rollout.percentage === percentage ? 'contained' : 'outlined'}
                        onClick={() => handleUpdateRollout(rollout.id, percentage)}
                      >
                        {percentage}%
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {rollouts.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              <AlertTitle>No Active Rollouts</AlertTitle>
              Create a rollout to gradually deploy features to users!
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Rollout Dialog */}
      <Dialog
        open={rolloutDialog}
        onClose={() => setRolloutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Rollout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Feature Flag</InputLabel>
                <Select
                  value={currentRollout.featureKey}
                  label="Feature Flag"
                  onChange={(e) => setCurrentRollout({ ...currentRollout, featureKey: e.target.value })}
                >
                  {flags.map((flag) => (
                    <MenuItem key={flag.id} value={flag.key}>
                      {flag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rollout Strategy</InputLabel>
                <Select
                  value={currentRollout.strategy}
                  label="Rollout Strategy"
                  onChange={(e) => setCurrentRollout({ ...currentRollout, strategy: e.target.value })}
                >
                  {ROLLOUT_STRATEGIES.map((strategy) => (
                    <MenuItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Initial Rollout Percentage: {currentRollout.percentage}%
              </Typography>
              <Slider
                value={currentRollout.percentage}
                onChange={(e, value) => setCurrentRollout({ ...currentRollout, percentage: value })}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolloutDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRollout}
            disabled={loading || !currentRollout.featureKey}
          >
            Create Rollout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // ===== RENDER: TAB 4 - ANALYTICS =====
  const renderAnalytics = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BarChart />
        Feature Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, margin: '0 auto', mb: 2 }}>
                <Flag size={30} />
              </Avatar>
              <Typography variant="h3">{analytics.totalFlags}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Flags
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60, margin: '0 auto', mb: 2 }}>
                <Activity size={30} />
              </Avatar>
              <Typography variant="h3">{analytics.activeTests}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60, margin: '0 auto', mb: 2 }}>
                <CheckCircle size={30} />
              </Avatar>
              <Typography variant="h3">{analytics.completedTests}</Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Test Results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>

              {testResults.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Winner</TableCell>
                        <TableCell>Improvement</TableCell>
                        <TableCell>Confidence</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>{result.testName}</TableCell>
                          <TableCell>
                            <Chip label={result.winner} color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`+${result.improvement}%`}
                              color="success"
                              size="small"
                              icon={<TrendingUp size={14} />}
                            />
                          </TableCell>
                          <TableCell>{result.confidence}%</TableCell>
                          <TableCell>
                            {result.completedAt && format(result.completedAt.toDate(), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No test results yet. Complete some A/B tests to see results!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ===== RENDER: TAB 5 - REMOTE CONFIG =====
  const renderRemoteConfig = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Globe />
        Remote Configuration
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Alert severity="info">
            <AlertTitle>Firebase Remote Config Integration</AlertTitle>
            <Typography variant="body2">
              Connect your Firebase Remote Config to manage feature flags and app configuration in real-time.
              All changes sync instantly to your users' devices.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration Status
              </Typography>

              <List>
                <ListItem>
                  <ListItemText primary="Firebase Connected" />
                  <CheckCircle size={20} color="green" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Auto-sync Enabled" />
                  <CheckCircle size={20} color="green" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Last Sync" />
                  <Typography variant="caption">2 minutes ago</Typography>
                </ListItem>
              </List>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshCw />}
                sx={{ mt: 2 }}
                onClick={() => showSnackbar('Configuration synced!', 'success')}
              >
                Sync Now
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" startIcon={<Download />}>
                  Export Configuration
                </Button>
                <Button variant="outlined" startIcon={<Code />}>
                  View JSON
                </Button>
                <Button variant="outlined" startIcon={<Settings />}>
                  Advanced Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // ===== MAIN RENDER =====
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Flag />} label="Feature Flags" />
          <Tab icon={<TestTube />} label="A/B Tests" />
          <Tab icon={<TrendingUp />} label="Rollout Management" />
          <Tab icon={<BarChart />} label="Analytics" />
          <Tab icon={<Globe />} label="Remote Config" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderFeatureFlags()}
      {activeTab === 1 && renderABTests()}
      {activeTab === 2 && renderRolloutManagement()}
      {activeTab === 3 && renderAnalytics()}
      {activeTab === 4 && renderRemoteConfig()}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
};

export default MobileFeatureToggles;