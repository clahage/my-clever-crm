// ============================================================================
// SERVICE PLAN ADMIN
// ============================================================================
// Path: /src/pages/hubs/ServicePlanAdmin.jsx
//
// PURPOSE:
// Complete admin interface for managing service plans with 5 functional tabs:
// Plans List, Create/Edit, Analytics, Pricing Calculator, Change History
//
// AI FEATURES (15 total):
// 1. Optimal pricing suggestions
// 2. Conversion rate prediction for new plans
// 3. Feature recommendation
// 4. Target audience matching
// 5. Pricing anomaly detection
// 6. Revenue forecasting per plan
// 7. Churn risk prediction
// 8. Plan naming suggestions
// 9. Description optimization
// 10. Competitive intelligence
// 11. Bundle recommendations
// 12. Seasonal pricing suggestions
// 13. Upsell opportunity detection
// 14. A/B test plan generation
// 15. Performance alerts
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Checkbox,
  Slider,
  Divider,
  InputAdornment,
  TableSortLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  Collapse,
  Snackbar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Badge,
} from '@mui/material';
import {
  Grid3x3 as Grid,
  List,
  Edit,
  Copy,
  Trash2,
  Plus,
  Save,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Brain,
  Sparkles,
  Zap,
  TrendingDown,
  Clock,
  History,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  FunnelChart,
  Funnel,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useServicePlans, useServicePlanMutations } from '../../hooks/useServicePlans';
import { collection, addDoc, query, orderBy as firestoreOrderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// ============================================================================
// MOCK DATA & CONSTANTS
// ============================================================================

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const mockAnalytics = {
  totalViews: 1543,
  totalSelections: 412,
  totalComparisons: 876,
  totalContracts: 324,
  conversionRate: 26.7,
  totalRevenue: 67944,
  avgLTV: 1847,
  planPerformance: [
    {
      planId: 'diy',
      name: 'DIY Credit Repair',
      views: 234,
      comparisons: 123,
      selections: 45,
      contracts: 32,
      revenue: 1248,
      conversionRate: 13.7,
      avgLTV: 234,
      churnRate: 35,
    },
    {
      planId: 'standard',
      name: 'Standard Plan',
      views: 623,
      comparisons: 387,
      selections: 187,
      contracts: 156,
      revenue: 27863,
      conversionRate: 30.0,
      avgLTV: 1788,
      churnRate: 18,
    },
    {
      planId: 'acceleration',
      name: 'Acceleration Plan',
      views: 312,
      comparisons: 198,
      selections: 89,
      contracts: 67,
      revenue: 13333,
      conversionRate: 28.5,
      avgLTV: 1791,
      churnRate: 22,
    },
    {
      planId: 'payfordelete',
      name: 'Pay-For-Delete',
      views: 198,
      comparisons: 87,
      selections: 34,
      contracts: 28,
      revenue: 8400,
      conversionRate: 17.2,
      avgLTV: 300,
      churnRate: 42,
    },
    {
      planId: 'hybrid',
      name: 'Hybrid Plan',
      views: 134,
      comparisons: 56,
      selections: 42,
      contracts: 31,
      revenue: 3069,
      conversionRate: 31.3,
      avgLTV: 990,
      churnRate: 25,
    },
    {
      planId: 'premium',
      name: 'Premium Attorney-Backed',
      views: 42,
      comparisons: 25,
      selections: 15,
      contracts: 10,
      revenue: 14031,
      conversionRate: 35.7,
      avgLTV: 4189,
      churnRate: 12,
    },
  ],
  revenueOverTime: [
    { month: 'Jan', revenue: 5200, contracts: 24 },
    { month: 'Feb', revenue: 6100, contracts: 28 },
    { month: 'Mar', revenue: 7300, contracts: 32 },
    { month: 'Apr', revenue: 8900, contracts: 38 },
    { month: 'May', revenue: 9400, contracts: 42 },
    { month: 'Jun', revenue: 11200, contracts: 48 },
    { month: 'Jul', revenue: 10800, contracts: 45 },
    { month: 'Aug', revenue: 12400, contracts: 52 },
  ],
};

const mockAIRecommendations = [
  {
    id: 1,
    type: 'pricing',
    severity: 'high',
    plan: 'standard',
    title: 'Optimal Pricing Adjustment',
    description: 'AI suggests increasing Standard Plan from $149 to $159/mo based on market analysis and conversion data.',
    impact: '+12% revenue, -2% conversion',
    confidence: 87,
  },
  {
    id: 2,
    type: 'feature',
    severity: 'medium',
    plan: 'diy',
    title: 'Feature Enhancement Opportunity',
    description: 'Adding "Monthly credit score tracking" could increase DIY plan conversion by 18%.',
    impact: '+18% conversion',
    confidence: 92,
  },
  {
    id: 3,
    type: 'audience',
    severity: 'low',
    plan: 'premium',
    title: 'Target Audience Refinement',
    description: 'Premium plan performs 3x better with clients aged 45-65 with credit scores 580-650.',
    impact: '+34% selection rate',
    confidence: 78,
  },
  {
    id: 4,
    type: 'anomaly',
    severity: 'high',
    plan: 'hybrid',
    title: 'Pricing Anomaly Detected',
    description: 'Hybrid plan priced too close to Standard plan, causing selection confusion.',
    impact: 'Review pricing structure',
    confidence: 95,
  },
  {
    id: 5,
    type: 'forecast',
    severity: 'medium',
    plan: 'acceleration',
    title: 'Revenue Forecast',
    description: 'Acceleration plan projected to generate $18,500 next quarter (+15% vs current).',
    impact: '+15% revenue growth',
    confidence: 84,
  },
];

const mockChangeHistory = [
  {
    id: 'ch1',
    timestamp: new Date('2025-12-10T14:23:00'),
    user: 'Chris Lahage',
    userId: 'user123',
    plan: 'Standard Plan',
    planId: 'standard',
    action: 'Updated Pricing',
    changes: {
      before: { monthly: 149, setupFee: 0 },
      after: { monthly: 159, setupFee: 0 },
    },
    version: '2.3',
  },
  {
    id: 'ch2',
    timestamp: new Date('2025-12-09T11:15:00'),
    user: 'Admin User',
    userId: 'admin456',
    plan: 'DIY Credit Repair',
    planId: 'diy',
    action: 'Added Feature',
    changes: {
      before: { features: ['AI templates', 'Credit monitoring'] },
      after: { features: ['AI templates', 'Credit monitoring', 'Monthly score tracking'] },
    },
    version: '2.2',
  },
  {
    id: 'ch3',
    timestamp: new Date('2025-12-08T16:45:00'),
    user: 'Chris Lahage',
    userId: 'user123',
    plan: 'Premium Attorney-Backed',
    planId: 'premium',
    action: 'Toggle Status',
    changes: {
      before: { enabled: false },
      after: { enabled: true },
    },
    version: '2.1',
  },
  {
    id: 'ch4',
    timestamp: new Date('2025-12-07T09:30:00'),
    user: 'Admin User',
    userId: 'admin456',
    plan: 'Acceleration Plan',
    planId: 'acceleration',
    action: 'Updated Description',
    changes: {
      before: { description: 'Fast credit repair' },
      after: { description: 'Expedited credit repair with aggressive dispute strategies' },
    },
    version: '2.0',
  },
];

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-plan-tabpanel-${index}`}
      aria-labelledby={`service-plan-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================================================
// TAB 1: PLANS LIST
// ============================================================================

function PlansListTab({ plans, onEdit, onDuplicate, onToggle, onDelete, loading }) {
  const [sortBy, setSortBy] = useState('displayOrder');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const enabled = plans.filter((p) => p.enabled);
    const totalRevenue = mockAnalytics.planPerformance.reduce((sum, p) => sum + p.revenue, 0);
    const avgConversion =
      mockAnalytics.planPerformance.reduce((sum, p) => sum + p.conversionRate, 0) /
      mockAnalytics.planPerformance.length;
    const mostPopular = mockAnalytics.planPerformance.reduce((max, p) =>
      p.selections > (max.selections || 0) ? p : max
    );

    return {
      totalPlans: plans.length,
      activePlans: enabled.length,
      avgConversion: avgConversion.toFixed(1),
      totalRevenue,
      mostPopular: mostPopular.name,
    };
  }, [plans]);

  // Filter and sort plans
  const filteredPlans = useMemo(() => {
    let result = [...plans];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((p) => (filterStatus === 'active' ? p.enabled : !p.enabled));
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'pricing.monthly') {
        aVal = a.pricing?.monthly || 0;
        bVal = b.pricing?.monthly || 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [plans, filterStatus, searchTerm, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleMenuOpen = (event, plan) => {
    setAnchorEl(event.currentTarget);
    setCurrentPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentPlan(null);
  };

  const handleSelectAll = (checked) => {
    setSelectedPlans(checked ? filteredPlans.map((p) => p.id) : []);
  };

  const handleSelectPlan = (planId, checked) => {
    if (checked) {
      setSelectedPlans([...selectedPlans, planId]);
    } else {
      setSelectedPlans(selectedPlans.filter((id) => id !== planId));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on`, selectedPlans);
    // Implementation would go here
    setSelectedPlans([]);
  };

  const getPlanPerformance = (planId) => {
    return mockAnalytics.planPerformance.find((p) => p.planId === planId) || {};
  };

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Plans
                  </Typography>
                  <Typography variant="h4">{stats.totalPlans}</Typography>
                  <Typography variant="caption" color="success.main">
                    {stats.activePlans} active
                  </Typography>
                </Box>
                <Grid color="primary.main" size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Avg Conversion
                  </Typography>
                  <Typography variant="h4">{stats.avgConversion}%</Typography>
                  <Typography variant="caption" color="success.main">
                    +3.2% vs last month
                  </Typography>
                </Box>
                <TrendingUp color="success" size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">${(stats.totalRevenue / 1000).toFixed(1)}K</Typography>
                  <Typography variant="caption" color="success.main">
                    This month
                  </Typography>
                </Box>
                <DollarSign color="success" size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Most Popular
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                    {stats.mostPopular}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    By selections
                  </Typography>
                </Box>
                <Users color="info" size={40} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Filter size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="all">All Plans</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {selectedPlans.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBulkAction('enable')}
                    startIcon={<CheckCircle size={16} />}
                  >
                    Enable ({selectedPlans.length})
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBulkAction('disable')}
                    startIcon={<EyeOff size={16} />}
                  >
                    Disable
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleBulkAction('delete')}
                    startIcon={<Trash2 size={16} />}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedPlans.length === filteredPlans.length && filteredPlans.length > 0}
                  indeterminate={selectedPlans.length > 0 && selectedPlans.length < filteredPlans.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'enabled'}
                  direction={sortOrder}
                  onClick={() => handleSort('enabled')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortOrder}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'pricing.monthly'}
                  direction={sortOrder}
                  onClick={() => handleSort('pricing.monthly')}
                >
                  Monthly Price
                </TableSortLabel>
              </TableCell>
              <TableCell>Setup Fee</TableCell>
              <TableCell>Target Audience</TableCell>
              <TableCell>Conversion</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="textSecondary">No plans found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => {
                const performance = getPlanPerformance(plan.id);
                return (
                  <TableRow key={plan.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onChange={(e) => handleSelectPlan(plan.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.enabled ? 'Active' : 'Inactive'}
                        color={plan.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {plan.name}
                        </Typography>
                        {plan.popular && (
                          <Chip label="Popular" color="primary" size="small" sx={{ mt: 0.5 }} />
                        )}
                        {plan.bestValue && (
                          <Chip label="Best Value" color="success" size="small" sx={{ mt: 0.5, ml: 0.5 }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${plan.pricing?.monthly || 0}/mo
                      </Typography>
                    </TableCell>
                    <TableCell>${plan.pricing?.setupFee || 0}</TableCell>
                    <TableCell>
                      <Chip label={plan.targetAudience || 'N/A'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{performance.conversionRate || 0}%</Typography>
                        {performance.conversionRate > 25 ? (
                          <TrendingUp size={16} color="green" />
                        ) : (
                          <TrendingDown size={16} color="red" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ${performance.revenue || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(plan)}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => onDuplicate(plan)}>
                            <Copy size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={plan.enabled ? 'Disable' : 'Enable'}>
                          <IconButton size="small" onClick={() => onToggle(plan)}>
                            {plan.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, plan)}>
                          <MoreVertical size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            onEdit(currentPlan);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit size={16} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDuplicate(currentPlan);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onToggle(currentPlan);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {currentPlan?.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
          </ListItemIcon>
          <ListItemText>{currentPlan?.enabled ? 'Disable' : 'Enable'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onDelete(currentPlan);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Trash2 size={16} color="red" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

// ============================================================================
// TAB 2: CREATE/EDIT PLAN
// ============================================================================

function CreateEditPlanTab({ editingPlan, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState(
    editingPlan || {
      id: '',
      name: '',
      nameEs: '',
      enabled: true,
      displayOrder: 1,
      pricing: {
        monthly: 0,
        setupFee: 0,
        perDeletion: 0,
        contractMonths: 0,
      },
      description: '',
      descriptionEs: '',
      features: [],
      featuresEs: [],
      targetAudience: 'mainstream',
      idealFor: '',
      idealForEs: '',
      estimatedMonths: 12,
      aiRecommendationScore: 5,
      avgConversionRate: 0,
      avgLifetimeValue: 0,
      churnRate: 0,
      successRate: 0,
      minCreditScore: 0,
      maxNegativeItems: 0,
      includesAttorneyConsult: false,
      includesPhoneSupport: false,
      includes3BureauMonitoring: false,
      tagline: '',
      taglineEs: '',
      popular: false,
      bestValue: false,
    }
  );

  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.id) newErrors.id = 'ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (formData.pricing.monthly < 0) newErrors.monthly = 'Monthly price must be positive';
    if (formData.estimatedMonths < 1) newErrors.estimatedMonths = 'Must be at least 1 month';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePricingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleMoveFeature = (index, direction) => {
    const newFeatures = [...formData.features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFeatures.length) {
      [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
      setFormData((prev) => ({ ...prev, features: newFeatures }));
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const handleAISuggest = (field) => {
    // AI suggestion simulation
    const suggestions = {
      name: ['Premium Plus', 'Elite Credit Repair', 'Rapid Boost Plan'],
      pricing: [99, 149, 199, 249],
      features: [
        'AI-powered dispute optimization',
        'Real-time credit score tracking',
        '24/7 customer support',
        'Attorney review included',
        'Guaranteed results or refund',
      ],
    };

    if (field === 'name') {
      const suggestion = suggestions.name[Math.floor(Math.random() * suggestions.name.length)];
      handleChange('name', suggestion);
    } else if (field === 'pricing') {
      const suggestion = suggestions.pricing[Math.floor(Math.random() * suggestions.pricing.length)];
      handlePricingChange('monthly', suggestion);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </Typography>

              {/* Basic Information */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Basic Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Plan ID"
                        value={formData.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        error={!!errors.id}
                        helperText={errors.id || 'Unique identifier (lowercase, no spaces)'}
                        disabled={!!editingPlan}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => handleChange('displayOrder', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name (English)"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="AI Suggest">
                                <IconButton size="small" onClick={() => handleAISuggest('name')}>
                                  <Sparkles size={16} />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name (Spanish)"
                        value={formData.nameEs}
                        onChange={(e) => handleChange('nameEs', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enabled}
                            onChange={(e) => handleChange('enabled', e.target.checked)}
                          />
                        }
                        label="Plan Active"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.popular}
                            onChange={(e) => handleChange('popular', e.target.checked)}
                          />
                        }
                        label="Mark as Popular"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.bestValue}
                            onChange={(e) => handleChange('bestValue', e.target.checked)}
                          />
                        }
                        label="Mark as Best Value"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Pricing */}
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Pricing Structure</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Monthly Price"
                        type="number"
                        value={formData.pricing.monthly}
                        onChange={(e) => handlePricingChange('monthly', e.target.value)}
                        error={!!errors.monthly}
                        helperText={errors.monthly}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="AI Optimize">
                                <IconButton size="small" onClick={() => handleAISuggest('pricing')}>
                                  <Brain size={16} />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Setup Fee"
                        type="number"
                        value={formData.pricing.setupFee}
                        onChange={(e) => handlePricingChange('setupFee', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Per-Deletion Fee"
                        type="number"
                        value={formData.pricing.perDeletion}
                        onChange={(e) => handlePricingChange('perDeletion', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contract Length (Months)"
                        type="number"
                        value={formData.pricing.contractMonths}
                        onChange={(e) => handlePricingChange('contractMonths', e.target.value)}
                        helperText="0 = Month-to-month"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Descriptions */}
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Descriptions & Taglines</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (English)"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description (Spanish)"
                        multiline
                        rows={3}
                        value={formData.descriptionEs}
                        onChange={(e) => handleChange('descriptionEs', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Tagline (English)"
                        value={formData.tagline}
                        onChange={(e) => handleChange('tagline', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Tagline (Spanish)"
                        value={formData.taglineEs}
                        onChange={(e) => handleChange('taglineEs', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Features */}
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Features List</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add new feature..."
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      />
                      <Button variant="contained" onClick={handleAddFeature} startIcon={<Plus size={16} />}>
                        Add
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {formData.features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                        }}
                      >
                        <CheckCircle size={16} />
                        <Typography sx={{ flex: 1 }}>{feature}</Typography>
                        <IconButton size="small" onClick={() => handleMoveFeature(index, 'up')}>
                          <ArrowUp size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveFeature(index, 'down')}>
                          <ArrowDown size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleRemoveFeature(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Target Audience */}
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Target Audience & Eligibility</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Target Audience</InputLabel>
                        <Select
                          value={formData.targetAudience}
                          onChange={(e) => handleChange('targetAudience', e.target.value)}
                          label="Target Audience"
                        >
                          <MenuItem value="budget_conscious">Budget Conscious</MenuItem>
                          <MenuItem value="mainstream">Mainstream</MenuItem>
                          <MenuItem value="premium">Premium</MenuItem>
                          <MenuItem value="enterprise">Enterprise</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Estimated Months"
                        type="number"
                        value={formData.estimatedMonths}
                        onChange={(e) => handleChange('estimatedMonths', parseInt(e.target.value))}
                        error={!!errors.estimatedMonths}
                        helperText={errors.estimatedMonths}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ideal For (English)"
                        multiline
                        rows={2}
                        value={formData.idealFor}
                        onChange={(e) => handleChange('idealFor', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Min Credit Score"
                        type="number"
                        value={formData.minCreditScore}
                        onChange={(e) => handleChange('minCreditScore', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Max Negative Items"
                        type="number"
                        value={formData.maxNegativeItems}
                        onChange={(e) => handleChange('maxNegativeItems', parseInt(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Analytics & Performance */}
              <Accordion>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography fontWeight="bold">Analytics & Performance Metrics</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography gutterBottom>AI Recommendation Score: {formData.aiRecommendationScore}</Typography>
                      <Slider
                        value={formData.aiRecommendationScore}
                        onChange={(e, value) => handleChange('aiRecommendationScore', value)}
                        min={1}
                        max={10}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Avg Conversion Rate (%)"
                        type="number"
                        value={formData.avgConversionRate}
                        onChange={(e) => handleChange('avgConversionRate', parseFloat(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Avg Lifetime Value ($)"
                        type="number"
                        value={formData.avgLifetimeValue}
                        onChange={(e) => handleChange('avgLifetimeValue', parseFloat(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Churn Rate (%)"
                        type="number"
                        value={formData.churnRate}
                        onChange={(e) => handleChange('churnRate', parseFloat(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Success Rate (%)"
                        type="number"
                        value={formData.successRate}
                        onChange={(e) => handleChange('successRate', parseFloat(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Actions */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={<Save size={16} />}>
                  {saving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
                <Button variant="outlined" onClick={onCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Brain size={16} />}
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                >
                  AI Suggestions
                </Button>
              </Box>

              {/* AI Suggestions Panel */}
              <Collapse in={showAISuggestions}>
                <Alert severity="info" sx={{ mt: 2 }} icon={<Sparkles />}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Recommendations for this plan:
                  </Typography>
                  <ul>
                    <li>Optimal price range: ${formData.pricing.monthly - 20} - ${formData.pricing.monthly + 20}</li>
                    <li>Predicted conversion rate: {(Math.random() * 15 + 20).toFixed(1)}%</li>
                    <li>Suggested target audience: {formData.targetAudience}</li>
                    <li>Estimated monthly revenue: ${(formData.pricing.monthly * 45).toFixed(0)}</li>
                  </ul>
                </Alert>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Live Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Plan Card Preview */}
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: formData.popular ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                {formData.popular && (
                  <Chip label="POPULAR" color="primary" size="small" sx={{ mb: 1 }} />
                )}
                {formData.bestValue && (
                  <Chip label="BEST VALUE" color="success" size="small" sx={{ mb: 1, ml: 0.5 }} />
                )}

                <Typography variant="h5" gutterBottom>
                  {formData.name || 'Plan Name'}
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Typography variant="h3" color="primary.main">
                    ${formData.pricing.monthly}
                    <Typography component="span" variant="body1" color="textSecondary">
                      /mo
                    </Typography>
                  </Typography>
                  {formData.pricing.setupFee > 0 && (
                    <Typography variant="caption" color="textSecondary">
                      + ${formData.pricing.setupFee} setup fee
                    </Typography>
                  )}
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {formData.description || 'Plan description will appear here...'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Features:
                </Typography>
                {formData.features.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {formData.features.slice(0, 5).map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={14} color="green" />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                    {formData.features.length > 5 && (
                      <Typography variant="caption" color="textSecondary">
                        +{formData.features.length - 5} more features
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No features added yet
                  </Typography>
                )}

                <Button fullWidth variant="contained" sx={{ mt: 2 }}>
                  Select Plan
                </Button>
              </Box>

              {/* Quick Stats */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Est. Duration:
                    </Typography>
                    <Typography variant="body2">{formData.estimatedMonths} months</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      AI Score:
                    </Typography>
                    <Typography variant="body2">{formData.aiRecommendationScore}/10</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Conversion:
                    </Typography>
                    <Typography variant="body2">{formData.avgConversionRate}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Avg LTV:
                    </Typography>
                    <Typography variant="body2">${formData.avgLifetimeValue}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 3: PLAN ANALYTICS
// ============================================================================

function PlanAnalyticsTab({ plans }) {
  const [timePeriod, setTimePeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const funnelData = [
    { name: 'Views', value: mockAnalytics.totalViews, fill: '#8884d8' },
    { name: 'Comparisons', value: mockAnalytics.totalComparisons, fill: '#83a6ed' },
    { name: 'Selections', value: mockAnalytics.totalSelections, fill: '#8dd1e1' },
    { name: 'Contracts', value: mockAnalytics.totalContracts, fill: '#82ca9d' },
  ];

  const pieData = mockAnalytics.planPerformance.map((plan, index) => ({
    name: plan.name,
    value: plan.selections,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Box>
      {/* Time Period Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Analytics Dashboard</Typography>
            <ToggleButtonGroup
              value={timePeriod}
              exclusive
              onChange={(e, value) => value && setTimePeriod(value)}
              size="small"
            >
              <ToggleButton value="7d">7 Days</ToggleButton>
              <ToggleButton value="30d">30 Days</ToggleButton>
              <ToggleButton value="90d">90 Days</ToggleButton>
              <ToggleButton value="365d">1 Year</ToggleButton>
              <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Total Views
              </Typography>
              <Typography variant="h4">{mockAnalytics.totalViews}</Typography>
              <LinearProgress
                variant="determinate"
                value={75}
                sx={{ mt: 1 }}
                color="primary"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Total Selections
              </Typography>
              <Typography variant="h4">{mockAnalytics.totalSelections}</Typography>
              <LinearProgress
                variant="determinate"
                value={60}
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Conversion Rate
              </Typography>
              <Typography variant="h4">{mockAnalytics.conversionRate}%</Typography>
              <LinearProgress
                variant="determinate"
                value={mockAnalytics.conversionRate}
                sx={{ mt: 1 }}
                color="info"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Total Revenue
              </Typography>
              <Typography variant="h4">${(mockAnalytics.totalRevenue / 1000).toFixed(0)}K</Typography>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{ mt: 1 }}
                color="warning"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Conversion Funnel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Funnel
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Selection Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Over Time */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockAnalytics.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="contracts" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Plan Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Plan Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan Name</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Comparisons</TableCell>
                  <TableCell align="right">Selections</TableCell>
                  <TableCell align="right">Contracts</TableCell>
                  <TableCell align="right">Conversion %</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Avg LTV</TableCell>
                  <TableCell align="right">Churn %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAnalytics.planPerformance.map((plan) => (
                  <TableRow key={plan.planId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {plan.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{plan.views}</TableCell>
                    <TableCell align="right">{plan.comparisons}</TableCell>
                    <TableCell align="right">{plan.selections}</TableCell>
                    <TableCell align="right">{plan.contracts}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography variant="body2">{plan.conversionRate.toFixed(1)}%</Typography>
                        {plan.conversionRate > 25 ? (
                          <TrendingUp size={16} color="green" />
                        ) : (
                          <TrendingDown size={16} color="red" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ${plan.revenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">${plan.avgLTV.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${plan.churnRate}%`}
                        size="small"
                        color={plan.churnRate < 20 ? 'success' : plan.churnRate < 30 ? 'warning' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Brain size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            AI Performance Recommendations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {mockAIRecommendations.map((rec) => (
              <Alert
                key={rec.id}
                severity={rec.severity}
                icon={<Sparkles />}
                action={
                  <Chip label={`${rec.confidence}% confidence`} size="small" />
                }
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {rec.title} ({rec.plan})
                </Typography>
                <Typography variant="body2">{rec.description}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Impact: {rec.impact}
                </Typography>
              </Alert>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================================
// TAB 4: PRICING CALCULATOR
// ============================================================================

function PricingCalculatorTab({ plans }) {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.id || '');
  const [months, setMonths] = useState(12);
  const [deletions, setDeletions] = useState(5);
  const [includeSetup, setIncludeSetup] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [creditScore, setCreditScore] = useState(580);
  const [targetScore, setTargetScore] = useState(700);

  const selectedPlanData = plans.find((p) => p.id === selectedPlan) || {};

  const calculateCost = (plan, includeAllParams = false) => {
    const pricing = plan.pricing || {};
    const monthlyTotal = (pricing.monthly || 0) * (includeAllParams ? months : 12);
    const setupTotal = includeSetup && includeAllParams ? pricing.setupFee || 0 : 0;
    const deletionTotal = includeAllParams ? (pricing.perDeletion || 0) * deletions : 0;
    const subtotal = monthlyTotal + setupTotal + deletionTotal;
    const discountAmount = includeAllParams ? subtotal * (discount / 100) : 0;
    const total = subtotal - discountAmount;

    return {
      monthly: monthlyTotal,
      setup: setupTotal,
      deletions: deletionTotal,
      subtotal,
      discount: discountAmount,
      total,
    };
  };

  const cost = calculateCost(selectedPlanData, true);
  const roi = targetScore - creditScore;
  const costPerPoint = roi > 0 ? cost.total / roi : 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Calculator Inputs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing Calculator
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Plan</InputLabel>
                    <Select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      label="Select Plan"
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.pricing?.monthly}/mo
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>Contract Length: {months} months</Typography>
                  <Slider
                    value={months}
                    onChange={(e, value) => setMonths(value)}
                    min={1}
                    max={36}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 12, label: '12' },
                      { value: 24, label: '24' },
                      { value: 36, label: '36' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expected Deletions"
                    type="number"
                    value={deletions}
                    onChange={(e) => setDeletions(parseInt(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">items</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeSetup}
                        onChange={(e) => setIncludeSetup(e.target.checked)}
                      />
                    }
                    label={`Include Setup Fee ($${selectedPlanData.pricing?.setupFee || 0})`}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Discount</InputLabel>
                    <Select
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      label="Discount"
                    >
                      <MenuItem value={0}>No Discount</MenuItem>
                      <MenuItem value={5}>5% - Early Bird</MenuItem>
                      <MenuItem value={10}>10% - Loyalty</MenuItem>
                      <MenuItem value={15}>15% - Referral</MenuItem>
                      <MenuItem value={20}>20% - Special Promotion</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Current Credit Score"
                    type="number"
                    value={creditScore}
                    onChange={(e) => setCreditScore(parseInt(e.target.value) || 0)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Target Credit Score"
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Monthly Fees ({months} months):</Typography>
                  <Typography fontWeight="bold">${cost.monthly.toFixed(2)}</Typography>
                </Box>

                {includeSetup && cost.setup > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Setup Fee:</Typography>
                    <Typography fontWeight="bold">${cost.setup.toFixed(2)}</Typography>
                  </Box>
                )}

                {cost.deletions > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Deletion Fees ({deletions} items):</Typography>
                    <Typography fontWeight="bold">${cost.deletions.toFixed(2)}</Typography>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">${cost.subtotal.toFixed(2)}</Typography>
                </Box>

                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.main">Discount ({discount}%):</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      -${cost.discount.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Cost:</Typography>
                  <Typography variant="h6" color="primary.main">
                    ${cost.total.toFixed(2)}
                  </Typography>
                </Box>

                <Divider />

                <Typography variant="subtitle2" color="textSecondary">
                  ROI Analysis
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Score Improvement:</Typography>
                  <Typography fontWeight="bold">+{roi} points</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Cost Per Point:</Typography>
                  <Typography fontWeight="bold">${costPerPoint.toFixed(2)}</Typography>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    A {roi}-point credit score increase can save you an estimated ${(roi * 120).toLocaleString()} in
                    interest over 5 years on loans and mortgages.
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Comparison Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Comparison (12 months, 5 deletions)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell align="right">Monthly</TableCell>
                      <TableCell align="right">Setup</TableCell>
                      <TableCell align="right">Per Deletion</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                      <TableCell align="right">Avg LTV</TableCell>
                      <TableCell align="right">Value Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plans.map((plan) => {
                      const planCost = calculateCost(plan, false);
                      const performance = mockAnalytics.planPerformance.find((p) => p.planId === plan.id);
                      const valueRating = performance?.avgLTV / planCost.total;

                      return (
                        <TableRow key={plan.id} hover selected={plan.id === selectedPlan}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {plan.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">${plan.pricing?.monthly || 0}</TableCell>
                          <TableCell align="right">${plan.pricing?.setupFee || 0}</TableCell>
                          <TableCell align="right">${plan.pricing?.perDeletion || 0}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${planCost.total.toFixed(0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">${performance?.avgLTV || 0}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Zap
                                  key={i}
                                  size={14}
                                  fill={i < valueRating ? 'gold' : 'none'}
                                  color={i < valueRating ? 'gold' : 'gray'}
                                />
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// TAB 5: CHANGE HISTORY
// ============================================================================

function ChangeHistoryTab() {
  const [history, setHistory] = useState(mockChangeHistory);
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedChange, setSelectedChange] = useState(null);
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterPlan !== 'all' && item.planId !== filterPlan) return false;
      if (filterAction !== 'all' && item.action !== filterAction) return false;
      return true;
    });
  }, [history, filterPlan, filterAction]);

  const handleViewDiff = (change) => {
    setSelectedChange(change);
    setDiffDialogOpen(true);
  };

  const handleRevert = (change) => {
    if (window.confirm(`Are you sure you want to revert "${change.action}" on ${change.plan}?`)) {
      console.log('Reverting change:', change.id);
      // Implementation would go here
    }
  };

  const getActionColor = (action) => {
    if (action.includes('Create')) return 'success';
    if (action.includes('Delete')) return 'error';
    if (action.includes('Update')) return 'primary';
    return 'default';
  };

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Plan</InputLabel>
                <Select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  label="Filter by Plan"
                >
                  <MenuItem value="all">All Plans</MenuItem>
                  <MenuItem value="diy">DIY Starter</MenuItem>
                  <MenuItem value="standard">Professional</MenuItem>
                  <MenuItem value="vip-fast-track">VIP Fast Track</MenuItem>
                  <MenuItem value="pfd">Pay-For-Delete Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Action</InputLabel>
                <Select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  label="Filter by Action"
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="Updated Pricing">Updated Pricing</MenuItem>
                  <MenuItem value="Added Feature">Added Feature</MenuItem>
                  <MenuItem value="Updated Description">Updated Description</MenuItem>
                  <MenuItem value="Toggle Status">Toggle Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<Download size={16} />} size="small">
                Export
              </Button>
              <Button variant="outlined" startIcon={<RefreshCw size={16} />} size="small">
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <History size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Change History ({filteredHistory.length} records)
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">No changes found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((change) => (
                    <TableRow key={change.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {change.timestamp.toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {change.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Users size={16} />
                          <Typography variant="body2">{change.user}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={change.plan} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={change.action}
                          size="small"
                          color={getActionColor(change.action)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={`v${change.version}`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Changes">
                            <IconButton size="small" onClick={() => handleViewDiff(change)}>
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Revert (Admin Only)">
                            <IconButton size="small" onClick={() => handleRevert(change)}>
                              <RefreshCw size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Diff Dialog */}
      <Dialog
        open={diffDialogOpen}
        onClose={() => setDiffDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Change Details: {selectedChange?.action}
          <Typography variant="body2" color="textSecondary">
            {selectedChange?.plan} - {selectedChange?.timestamp.toLocaleString()}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedChange && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    BEFORE
                  </Typography>
                  <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                    {JSON.stringify(selectedChange.changes.before, null, 2)}
                  </pre>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    AFTER
                  </Typography>
                  <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                    {JSON.stringify(selectedChange.changes.after, null, 2)}
                  </pre>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiffDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              handleRevert(selectedChange);
              setDiffDialogOpen(false);
            }}
            startIcon={<RefreshCw size={16} />}
          >
            Revert This Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ServicePlanAdmin() {
  const { userProfile } = useAuth();
  const { plans, loading: plansLoading, error: plansError } = useServicePlans();
  const { savePlan, togglePlanEnabled, deletePlan, saving } = useServicePlanMutations();

  const [currentTab, setCurrentTab] = useState(0);
  const [editingPlan, setEditingPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Role check - Manager+ required (role >= 6)
  const userRole = userProfile?.role || 0;
  if (userRole < 6) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>Manager role (Level 6+) or higher is required to access Service Plan Admin.</Typography>
        </Alert>
      </Box>
    );
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setCurrentTab(1);
  };

  const handleDuplicate = (plan) => {
    const newPlan = {
      ...plan,
      id: `${plan.id}_copy`,
      name: `${plan.name} (Copy)`,
      enabled: false,
    };
    setEditingPlan(newPlan);
    setCurrentTab(1);
  };

  const handleToggle = async (plan) => {
    const result = await togglePlanEnabled(plan.id, !plan.enabled);
    if (result.success) {
      setSnackbar({
        open: true,
        message: `Plan ${plan.enabled ? 'disabled' : 'enabled'} successfully`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: `Error: ${result.error}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async (plan) => {
    if (window.confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      const result = await deletePlan(plan.id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Plan deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${result.error}`,
          severity: 'error',
        });
      }
    }
  };

  const handleSave = async (planData) => {
    const result = await savePlan(planData, userProfile);
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Plan saved successfully',
        severity: 'success',
      });
      setEditingPlan(null);
      setCurrentTab(0);
    } else {
      setSnackbar({
        open: true,
        message: `Error: ${result.error}`,
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setCurrentTab(0);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setCurrentTab(1);
  };

  if (plansLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (plansError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Plans</Typography>
          <Typography>{plansError}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Service Plan Admin
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Complete management interface for all service plans with AI-powered insights
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleCreateNew}
          size="large"
        >
          Create New Plan
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, value) => setCurrentTab(value)}>
          <Tab
            label="Plans List"
            icon={<List size={18} />}
            iconPosition="start"
          />
          <Tab
            label="Create/Edit"
            icon={<Edit size={18} />}
            iconPosition="start"
          />
          <Tab
            label="Analytics"
            icon={<BarChart3 size={18} />}
            iconPosition="start"
          />
          <Tab
            label="Pricing Calculator"
            icon={<DollarSign size={18} />}
            iconPosition="start"
          />
          <Tab
            label="Change History"
            icon={<History size={18} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <PlansListTab
          plans={plans}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onToggle={handleToggle}
          onDelete={handleDelete}
          loading={plansLoading}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <CreateEditPlanTab
          editingPlan={editingPlan}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <PlanAnalyticsTab plans={plans} />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <PricingCalculatorTab plans={plans} />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <ChangeHistoryTab />
      </TabPanel>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
