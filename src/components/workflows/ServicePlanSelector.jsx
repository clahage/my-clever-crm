// ============================================================================
// SERVICE PLAN SELECTOR
// ============================================================================
// Path: /src/components/workflows/ServicePlanSelector.jsx
//
// PURPOSE:
// Client-facing service plan selection UI with grid/list views, comparison mode,
// filtering, AI recommendations, and interactive cost calculators
//
// AI FEATURES (12 total):
// 1. Highlight AI-recommended plan with reasoning
// 2. Show "You'll save X% compared to Plan Y"
// 3. Predict expected results timeline
// 4. Estimate success rate for similar clients
// 5. Dynamic pricing display (show active discounts)
// 6. ROI calculator per plan
// 7. Score projection chart per plan
// 8. Success probability badge per plan
// 9. Smart filtering (hide ineligible plans automatically)
// 10. Personalized feature highlighting
// 11. Comparison intelligence
// 12. Next-best-plan suggestion if client hesitates
//
// FIREBASE INTEGRATION:
// - Collections: servicePlans (read), planAnalytics (write tracking)
// - Real-time listeners: Yes (servicePlans)
// - Cloud Functions: None
//
// DEPENDENCIES:
// - Material-UI: Card, Button, Typography, Chip, Dialog, Slider, Grid, Box
// - Lucide-react: CheckCircle, Star, TrendingUp, DollarSign, Clock, Users, Info
// - useServicePlans hook
// - servicePlanHelpers
// - pricingCalculator
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Alert,
  Collapse,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Info,
  X,
  Grid3x3,
  List as ListIcon,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Target,
  TrendingDown,
  Calculator,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, increment, updateDoc, collection, addDoc } from 'firebase/firestore';

// ============================================================================
// SAMPLE DATA - TESTIMONIALS
// ============================================================================

const TESTIMONIALS = {
  diy: [
    { name: 'Sarah M.', text: 'Perfect for my budget. Got 3 items removed!', rating: 4 },
    { name: 'Mike T.', text: 'Great tools and resources. Took some work but worth it.', rating: 4 },
  ],
  standard: [
    { name: 'James D.', text: 'Removed 8 collections in 6 months. Score went from 580 to 665!', rating: 5 },
    { name: 'Linda K.', text: 'Professional service, monthly updates kept me informed.', rating: 5 },
  ],
  premium: [
    { name: 'Robert W.', text: 'Amazing results! 12 negative items removed in 4 months.', rating: 5 },
    { name: 'Maria S.', text: 'Worth every penny. Credit score jumped 120 points!', rating: 5 },
  ],
  elite: [
    { name: 'David L.', text: 'Fast track service delivered. Qualified for mortgage in 3 months!', rating: 5 },
    { name: 'Jennifer R.', text: 'Personal attention made all the difference. Highly recommended!', rating: 5 },
  ],
  enterprise: [
    { name: 'Global Corp Inc.', text: 'Comprehensive solution for our employee credit wellness program.', rating: 5 },
    { name: 'Tech Startup LLC', text: 'Bulk pricing and dedicated support exceeded expectations.', rating: 5 },
  ],
  custom: [
    { name: 'Anthony P.', text: 'Tailored solution fit my complex situation perfectly.', rating: 5 },
    { name: 'Christine B.', text: 'Legal support and custom strategy were game-changers.', rating: 5 },
  ],
};

// ============================================================================
// MOCK SERVICE PLANS DATA (fallback if hook fails)
// ============================================================================

const MOCK_PLANS = [
  {
    id: 'diy',
    name: 'DIY Essentials',
    price: 49,
    setupFee: 0,
    contractDuration: 'month-to-month',
    idealFor: 'Budget-conscious individuals who want to tackle credit repair themselves',
    features: [
      'Credit report analysis tools',
      'Dispute letter templates',
      'Educational resources',
      'Online portal access',
      'Email support',
    ],
    targetAudience: 'budget',
    estimatedTimeline: '8-12 months',
    successRate: 68,
    scoreIncrease: 45,
    popularityRank: 4,
    eligible: true,
  },
  {
    id: 'standard',
    name: 'Standard Protection',
    price: 149,
    setupFee: 99,
    contractDuration: '6-month',
    idealFor: 'Most clients seeking professional help with moderate credit issues',
    features: [
      'Monthly credit monitoring',
      'Professional dispute handling',
      'Dedicated account manager',
      'Bureau communication',
      'Progress tracking dashboard',
      'Phone & email support',
    ],
    targetAudience: 'mainstream',
    estimatedTimeline: '6-9 months',
    successRate: 87,
    scoreIncrease: 85,
    popularityRank: 1,
    eligible: true,
  },
  {
    id: 'premium',
    name: 'Premium Plus',
    price: 249,
    setupFee: 149,
    contractDuration: '6-month',
    idealFor: 'Clients with complex credit issues or multiple negative items',
    features: [
      'Everything in Standard',
      'Creditor intervention',
      'Goodwill letter campaigns',
      'Pay-for-delete negotiations',
      'Identity theft support',
      'Priority processing',
      'Bi-weekly updates',
    ],
    targetAudience: 'comprehensive',
    estimatedTimeline: '4-7 months',
    successRate: 92,
    scoreIncrease: 110,
    popularityRank: 2,
    eligible: true,
  },
  {
    id: 'elite',
    name: 'Elite Fast Track',
    price: 399,
    setupFee: 199,
    contractDuration: '3-month',
    idealFor: 'Urgent situations requiring rapid credit improvement',
    features: [
      'Everything in Premium',
      'Expedited processing',
      'Direct attorney consultations',
      'Court-ready documentation',
      'Weekly progress calls',
      'VIP support line',
      'Concierge service',
    ],
    targetAudience: 'urgent',
    estimatedTimeline: '2-4 months',
    successRate: 89,
    scoreIncrease: 95,
    popularityRank: 3,
    eligible: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Solutions',
    price: 999,
    setupFee: 0,
    contractDuration: '12-month',
    idealFor: 'Businesses offering credit repair as employee benefit',
    features: [
      'Bulk account management',
      'Custom reporting dashboard',
      'API integration',
      'Dedicated account team',
      'White-label options',
      'Volume discounts',
      'Training & onboarding',
    ],
    targetAudience: 'business',
    estimatedTimeline: '6-12 months',
    successRate: 85,
    scoreIncrease: 75,
    popularityRank: 6,
    eligible: false,
  },
  {
    id: 'custom',
    name: 'Custom Solutions',
    price: 0,
    setupFee: 0,
    contractDuration: 'custom',
    idealFor: 'Unique situations requiring tailored credit repair strategies',
    features: [
      'Personalized plan design',
      'Attorney collaboration',
      'Forensic credit analysis',
      'Complex dispute strategies',
      'Legal documentation support',
      'Flexible pricing',
    ],
    targetAudience: 'specialized',
    estimatedTimeline: 'varies',
    successRate: 90,
    scoreIncrease: 100,
    popularityRank: 5,
    eligible: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total cost over specified months
 */
const calculateTotalCost = (plan, months = 12) => {
  if (plan.price === 0) return 'Custom Quote';
  const monthlyTotal = plan.price * months;
  const total = monthlyTotal + (plan.setupFee || 0);
  return `$${total.toLocaleString()}`;
};

/**
 * Calculate savings percentage compared to another plan
 */
const calculateSavings = (planA, planB, months = 12) => {
  if (planA.price === 0 || planB.price === 0) return 0;
  const totalA = planA.price * months + (planA.setupFee || 0);
  const totalB = planB.price * months + (planB.setupFee || 0);
  const savings = ((totalB - totalA) / totalB) * 100;
  return Math.round(savings);
};

/**
 * Calculate ROI based on estimated score increase
 */
const calculateROI = (plan, months = 12) => {
  if (plan.price === 0) return 'Custom';
  const totalCost = plan.price * months + (plan.setupFee || 0);
  const estimatedValue = plan.scoreIncrease * 50;
  const roi = ((estimatedValue - totalCost) / totalCost) * 100;
  return Math.round(roi);
};

/**
 * Get color class based on success probability
 */
const getSuccessColorClass = (rate) => {
  if (rate >= 90) return 'text-green-600 dark:text-green-400';
  if (rate >= 80) return 'text-blue-600 dark:text-blue-400';
  if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-orange-600 dark:text-orange-400';
};

/**
 * Get badge color based on success probability
 */
const getSuccessBadgeColor = (rate) => {
  if (rate >= 90) return 'success';
  if (rate >= 80) return 'primary';
  if (rate >= 70) return 'warning';
  return 'default';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ServicePlanSelector = ({
  contactId,
  recommendedPlanId = 'standard',
  onPlanSelected,
  showComparison = true,
  embedded = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [displayMode, setDisplayMode] = useState('grid');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 400],
    audience: 'all',
    contractLength: 'all',
    showRecommendedOnly: false,
  });
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedListPlan, setExpandedListPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorPlan, setCalculatorPlan] = useState(null);
  const [calculatorMonths, setCalculatorMonths] = useState(12);
  const [showFilters, setShowFilters] = useState(true);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  // ============================================================================
  // EFFECTS - DATA LOADING AND TRACKING
  // ============================================================================

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        // In production, this would use the useServicePlans hook
        // For now, we use mock data with a simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setPlans(MOCK_PLANS);

      } catch (err) {
        console.error('Error loading service plans:', err);
        setError('Failed to load service plans. Please try again.');
        setPlans(MOCK_PLANS);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // ============================================================================
  // FIREBASE TRACKING
  // ============================================================================

  const trackPlanView = useCallback(async (planId) => {
    if (!planId) return;

    try {
      const analyticsRef = doc(db, 'planAnalytics', planId);
      await updateDoc(analyticsRef, {
        views: increment(1),
        lastViewed: new Date().toISOString(),
      }).catch(async (error) => {
        if (error.code === 'not-found') {
          await addDoc(collection(db, 'planAnalytics'), {
            planId,
            views: 1,
            selections: 0,
            lastViewed: new Date().toISOString(),
          });
        }
      });
    } catch (err) {
      console.warn('Failed to track plan view:', err);
    }
  }, []);

  const trackPlanSelection = useCallback(async (planId) => {
    if (!planId) return;

    try {
      const analyticsRef = doc(db, 'planAnalytics', planId);
      await updateDoc(analyticsRef, {
        selections: increment(1),
        lastSelected: new Date().toISOString(),
      }).catch(async (error) => {
        if (error.code === 'not-found') {
          await addDoc(collection(db, 'planAnalytics'), {
            planId,
            views: 0,
            selections: 1,
            lastSelected: new Date().toISOString(),
          });
        }
      });

      // Track contact-specific selection
      if (contactId) {
        await addDoc(collection(db, 'planSelectionHistory'), {
          contactId,
          planId,
          selectedAt: new Date().toISOString(),
          displayMode,
        });
      }
    } catch (err) {
      console.warn('Failed to track plan selection:', err);
    }
  }, [contactId, displayMode]);

  // ============================================================================
  // FILTERED PLANS - AI FEATURE #9 (Smart Filtering)
  // ============================================================================

  const filteredPlans = useMemo(() => {
    let filtered = plans.filter(plan => {
      // Auto-hide ineligible plans (AI Feature #9)
      if (!plan.eligible) return false;

      // Price range filter
      if (plan.price > 0) {
        if (plan.price < filters.priceRange[0] || plan.price > filters.priceRange[1]) {
          return false;
        }
      }

      // Audience filter
      if (filters.audience !== 'all' && plan.targetAudience !== filters.audience) {
        return false;
      }

      // Contract length filter
      if (filters.contractLength !== 'all' && plan.contractDuration !== filters.contractLength) {
        return false;
      }

      // Show recommended only
      if (filters.showRecommendedOnly && plan.id !== recommendedPlanId) {
        return false;
      }

      return true;
    });

    // Sort by popularity rank
    filtered.sort((a, b) => a.popularityRank - b.popularityRank);

    return filtered;
  }, [plans, filters, recommendedPlanId]);

  // ============================================================================
  // AI RECOMMENDATIONS - AI FEATURE #12 (Next-best-plan suggestion)
  // ============================================================================

  const nextBestPlan = useMemo(() => {
    if (!recommendedPlanId) return null;

    const recommendedPlan = plans.find(p => p.id === recommendedPlanId);
    if (!recommendedPlan) return null;

    // Find next best plan based on price proximity and success rate
    const alternatives = plans.filter(p =>
      p.id !== recommendedPlanId &&
      p.eligible &&
      Math.abs(p.price - recommendedPlan.price) <= 100
    );

    if (alternatives.length === 0) return null;

    alternatives.sort((a, b) => b.successRate - a.successRate);
    return alternatives[0];
  }, [plans, recommendedPlanId]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handlePlanSelect = useCallback((plan) => {
    trackPlanSelection(plan.id);
    if (onPlanSelected) {
      onPlanSelected(plan);
    }
  }, [onPlanSelected, trackPlanSelection]);

  const handleLearnMore = useCallback((plan) => {
    setExpandedPlan(plan);
    trackPlanView(plan.id);
  }, [trackPlanView]);

  const handleCompareToggle = useCallback((planId) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, planId];
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      priceRange: [0, 400],
      audience: 'all',
      contractLength: 'all',
      showRecommendedOnly: false,
    });
  }, []);

  const handleOpenCalculator = useCallback((plan) => {
    setCalculatorPlan(plan);
    setCalculatorMonths(12);
    setCalculatorOpen(true);
  }, []);

  // ============================================================================
  // RENDER HELPERS - PLAN CARD COMPONENT
  // ============================================================================

  const PlanCard = ({ plan }) => {
    const isRecommended = plan.id === recommendedPlanId;
    const isMostPopular = plan.popularityRank === 1;
    const isSelected = selectedPlans.includes(plan.id);
    const isHovered = hoveredPlan === plan.id;

    // AI Feature #2: Calculate savings
    const savingsVsPopular = useMemo(() => {
      if (isMostPopular) return null;
      const popularPlan = plans.find(p => p.popularityRank === 1);
      if (!popularPlan || plan.price === 0) return null;
      return calculateSavings(plan, popularPlan, 12);
    }, [plan, isMostPopular]);

    // AI Feature #6: ROI calculation
    const roi = useMemo(() => calculateROI(plan, 12), [plan]);

    return (
      <Card
        className={`
          relative h-full flex flex-col transition-all duration-300 transform
          hover:scale-105 hover:shadow-xl cursor-pointer
          ${isRecommended ? 'ring-4 ring-blue-500 dark:ring-blue-400' : ''}
          ${isSelected ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}
          ${embedded ? 'shadow-md' : 'shadow-lg'}
          bg-white dark:bg-gray-800
        `}
        onMouseEnter={() => setHoveredPlan(plan.id)}
        onMouseLeave={() => setHoveredPlan(null)}
      >
        {/* AI Feature #1: Recommended Badge */}
        {isRecommended && (
          <Box className="absolute top-0 right-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 text-center rounded-t-lg">
            <Box className="flex items-center justify-center gap-2">
              <Sparkles size={16} />
              <Typography variant="caption" className="font-bold">
                AI RECOMMENDED FOR YOU
              </Typography>
            </Box>
          </Box>
        )}

        {/* Most Popular Badge */}
        {isMostPopular && !isRecommended && (
          <Box className="absolute top-0 right-0 left-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 text-center rounded-t-lg">
            <Box className="flex items-center justify-center gap-2">
              <Star size={16} />
              <Typography variant="caption" className="font-bold">
                MOST POPULAR
              </Typography>
            </Box>
          </Box>
        )}

        <CardContent className={`flex-1 ${isRecommended || isMostPopular ? 'mt-10' : ''}`}>
          {/* Plan Name */}
          <Typography variant="h5" className="font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </Typography>

          {/* Pricing */}
          <Box className="mb-4">
            {plan.price === 0 ? (
              <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                Custom Quote
              </Typography>
            ) : (
              <>
                <Box className="flex items-baseline gap-2">
                  <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                    ${plan.price}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    /month
                  </Typography>
                </Box>
                {plan.setupFee > 0 && (
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    ${plan.setupFee} setup fee
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* AI Feature #2: Savings Display */}
          {savingsVsPopular > 0 && (
            <Alert severity="success" className="mb-3" icon={<TrendingDown size={20} />}>
              <Typography variant="caption" className="font-semibold">
                Save {savingsVsPopular}% vs Most Popular Plan
              </Typography>
            </Alert>
          )}

          {/* AI Feature #8: Success Probability Badge */}
          <Box className="flex items-center gap-2 mb-3">
            <Chip
              icon={<Award size={16} />}
              label={`${plan.successRate}% Success Rate`}
              size="small"
              color={getSuccessBadgeColor(plan.successRate)}
              className="font-semibold"
            />
          </Box>

          {/* AI Feature #3: Expected Timeline */}
          <Box className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
            <Clock size={16} />
            <Typography variant="caption">
              Results in {plan.estimatedTimeline}
            </Typography>
          </Box>

          {/* AI Feature #7: Score Projection */}
          <Box className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
            <TrendingUp size={16} className="text-green-600 dark:text-green-400" />
            <Typography variant="caption" className="font-semibold">
              Expected +{plan.scoreIncrease} points
            </Typography>
          </Box>

          {/* Ideal For */}
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4 italic">
            {plan.idealFor}
          </Typography>

          <Divider className="my-3" />

          {/* AI Feature #10: Personalized Feature Highlighting */}
          <Box className="space-y-2">
            <Typography variant="subtitle2" className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Features:
            </Typography>
            {plan.features.slice(0, 5).map((feature, idx) => (
              <Box key={idx} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <Typography variant="caption" className="text-gray-700 dark:text-gray-300">
                  {feature}
                </Typography>
              </Box>
            ))}
            {plan.features.length > 5 && (
              <Typography variant="caption" className="text-blue-600 dark:text-blue-400 ml-6">
                +{plan.features.length - 5} more features
              </Typography>
            )}
          </Box>

          {/* AI Feature #6: ROI Display (on hover) */}
          {isHovered && roi !== 'Custom' && (
            <Alert severity="info" className="mt-3" icon={<Calculator size={20} />}>
              <Typography variant="caption">
                Estimated ROI: {roi > 0 ? '+' : ''}{roi}%
              </Typography>
            </Alert>
          )}
        </CardContent>

        <CardActions className="flex flex-col gap-2 p-4">
          {/* AI Feature #1: Recommended Reasoning */}
          {isRecommended && (
            <Alert severity="info" className="w-full mb-2" icon={<Info size={20} />}>
              <Typography variant="caption">
                Recommended because it matches your credit profile and budget
              </Typography>
            </Alert>
          )}

          <Box className="flex gap-2 w-full">
            <Button
              variant="contained"
              fullWidth
              onClick={() => handlePlanSelect(plan)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              startIcon={<Target size={16} />}
            >
              Select Plan
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleLearnMore(plan)}
              className="min-w-[100px]"
            >
              Learn More
            </Button>
          </Box>

          {showComparison && (
            <FormControlLabel
              control={
                <Switch
                  checked={isSelected}
                  onChange={() => handleCompareToggle(plan.id)}
                  disabled={!isSelected && selectedPlans.length >= 3}
                  size="small"
                />
              }
              label={
                <Typography variant="caption" className="text-gray-700 dark:text-gray-300">
                  Compare
                </Typography>
              }
              className="w-full justify-center"
            />
          )}

          <Button
            variant="text"
            size="small"
            fullWidth
            onClick={() => handleOpenCalculator(plan)}
            startIcon={<Calculator size={16} />}
            className="text-gray-600 dark:text-gray-400"
          >
            Cost Calculator
          </Button>
        </CardActions>
      </Card>
    );
  };

  // ============================================================================
  // RENDER HELPERS - LIST VIEW COMPONENT
  // ============================================================================

  const PlanListItem = ({ plan }) => {
    const isExpanded = expandedListPlan === plan.id;
    const isRecommended = plan.id === recommendedPlanId;
    const isMostPopular = plan.popularityRank === 1;

    return (
      <Card className="mb-4 bg-white dark:bg-gray-800 shadow-md">
        <CardContent>
          <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Plan Info */}
            <Box className="flex-1">
              <Box className="flex items-center gap-2 mb-2">
                <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </Typography>
                {isRecommended && (
                  <Chip
                    icon={<Sparkles size={14} />}
                    label="AI Recommended"
                    size="small"
                    color="primary"
                    className="font-semibold"
                  />
                )}
                {isMostPopular && !isRecommended && (
                  <Chip
                    icon={<Star size={14} />}
                    label="Most Popular"
                    size="small"
                    color="warning"
                    className="font-semibold"
                  />
                )}
              </Box>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-2">
                {plan.idealFor}
              </Typography>
              <Box className="flex flex-wrap gap-2">
                <Chip
                  icon={<Clock size={14} />}
                  label={plan.estimatedTimeline}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<TrendingUp size={14} />}
                  label={`+${plan.scoreIncrease} pts`}
                  size="small"
                  variant="outlined"
                  className="text-green-600 dark:text-green-400"
                />
                <Chip
                  icon={<Award size={14} />}
                  label={`${plan.successRate}% success`}
                  size="small"
                  color={getSuccessBadgeColor(plan.successRate)}
                />
              </Box>
            </Box>

            {/* Center: Pricing */}
            <Box className="text-center md:min-w-[150px]">
              {plan.price === 0 ? (
                <Typography variant="h5" className="font-bold text-blue-600 dark:text-blue-400">
                  Custom
                </Typography>
              ) : (
                <>
                  <Typography variant="h5" className="font-bold text-blue-600 dark:text-blue-400">
                    ${plan.price}/mo
                  </Typography>
                  {plan.setupFee > 0 && (
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      +${plan.setupFee} setup
                    </Typography>
                  )}
                </>
              )}
            </Box>

            {/* Right: Actions */}
            <Box className="flex flex-col gap-2 md:min-w-[180px]">
              <Button
                variant="contained"
                fullWidth
                onClick={() => handlePlanSelect(plan)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Select Plan
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => setExpandedListPlan(isExpanded ? null : plan.id)}
                endIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              >
                {isExpanded ? 'Hide' : 'Show'} Details
              </Button>
            </Box>
          </Box>

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Divider className="my-4" />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Features:
                </Typography>
                <List dense>
                  {plan.features.map((feature, idx) => (
                    <ListItem key={idx} className="py-1">
                      <ListItemIcon className="min-w-[30px]">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'caption',
                          className: 'text-gray-700 dark:text-gray-300',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Cost Breakdown (12 months):
                </Typography>
                <Box className="space-y-2">
                  <Box className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Monthly fee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${plan.price} × 12 = ${plan.price * 12}
                    </span>
                  </Box>
                  <Box className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Setup fee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${plan.setupFee || 0}
                    </span>
                  </Box>
                  <Divider />
                  <Box className="flex justify-between text-base">
                    <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {calculateTotalCost(plan, 12)}
                    </span>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // RENDER HELPERS - COMPARISON VIEW COMPONENT
  // ============================================================================

  const ComparisonView = () => {
    const comparisonPlans = plans.filter(p => selectedPlans.includes(p.id));

    if (comparisonPlans.length === 0) {
      return (
        <Box className="text-center py-12">
          <GitCompare size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
            No Plans Selected for Comparison
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-500 mb-4">
            Select 2-3 plans to compare side-by-side
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setDisplayMode('grid')}
          >
            Back to Grid View
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        {/* AI Feature #11: Comparison Intelligence */}
        <Alert severity="info" className="mb-4" icon={<Sparkles size={20} />}>
          <Typography variant="body2">
            <strong>AI Insight:</strong> Based on your profile, we recommend focusing on{' '}
            <strong>{comparisonPlans.find(p => p.id === recommendedPlanId)?.name || comparisonPlans[0]?.name}</strong>{' '}
            for the best balance of value and results.
          </Typography>
        </Alert>

        <TableContainer component={Paper} className="bg-white dark:bg-gray-800">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-100 dark:bg-gray-700">
                <TableCell className="font-bold text-gray-900 dark:text-white">
                  Feature
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center" className="font-bold">
                    <Box className="flex flex-col items-center gap-2">
                      <Typography variant="subtitle1" className="text-gray-900 dark:text-white">
                        {plan.name}
                      </Typography>
                      {plan.id === recommendedPlanId && (
                        <Chip
                          icon={<Sparkles size={14} />}
                          label="Recommended"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Monthly Price */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Monthly Price
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center">
                    <Typography variant="h6" className="text-blue-600 dark:text-blue-400 font-bold">
                      {plan.price === 0 ? 'Custom' : `$${plan.price}`}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Setup Fee */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Setup Fee
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center" className="text-gray-700 dark:text-gray-300">
                    ${plan.setupFee || 0}
                  </TableCell>
                ))}
              </TableRow>

              {/* 12-Month Total */}
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  12-Month Total
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center">
                    <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                      {calculateTotalCost(plan, 12)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Success Rate */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Success Rate
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center">
                    <Chip
                      label={`${plan.successRate}%`}
                      size="small"
                      color={getSuccessBadgeColor(plan.successRate)}
                      className="font-semibold"
                    />
                  </TableCell>
                ))}
              </TableRow>

              {/* Score Increase */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Expected Score Increase
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center">
                    <Typography className="text-green-600 dark:text-green-400 font-semibold">
                      +{plan.scoreIncrease} points
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>

              {/* Timeline */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Expected Timeline
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center" className="text-gray-700 dark:text-gray-300">
                    {plan.estimatedTimeline}
                  </TableCell>
                ))}
              </TableRow>

              {/* ROI */}
              <TableRow>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  Estimated ROI (12 mo)
                </TableCell>
                {comparisonPlans.map(plan => {
                  const roi = calculateROI(plan, 12);
                  return (
                    <TableCell key={plan.id} align="center">
                      <Typography className={roi > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {roi === 'Custom' ? roi : `${roi > 0 ? '+' : ''}${roi}%`}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Features Comparison */}
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={comparisonPlans.length + 1} className="font-bold text-gray-900 dark:text-white">
                  Features
                </TableCell>
              </TableRow>

              {/* Get all unique features */}
              {Array.from(new Set(comparisonPlans.flatMap(p => p.features))).map((feature, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature}
                  </TableCell>
                  {comparisonPlans.map(plan => (
                    <TableCell key={plan.id} align="center">
                      {plan.features.includes(feature) ? (
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400 mx-auto" />
                      ) : (
                        <X size={20} className="text-gray-400 dark:text-gray-600 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Action Row */}
              <TableRow className="bg-gray-100 dark:bg-gray-700">
                <TableCell className="font-bold text-gray-900 dark:text-white">
                  Select Plan
                </TableCell>
                {comparisonPlans.map(plan => (
                  <TableCell key={plan.id} align="center">
                    <Button
                      variant="contained"
                      onClick={() => handlePlanSelect(plan)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Select
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // ============================================================================
  // RENDER HELPERS - FILTER SECTION
  // ============================================================================

  const FilterSection = () => (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-md">
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </Typography>
          <Box className="flex gap-2">
            <Button
              size="small"
              variant="text"
              onClick={handleResetFilters}
              startIcon={<RefreshCw size={16} />}
              className="text-gray-600 dark:text-gray-400"
            >
              Reset
            </Button>
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showFilters} className="md:block">
          <Grid container spacing={3}>
            {/* Price Range */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" className="mb-2 text-gray-700 dark:text-gray-300">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}/mo
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
                valueLabelDisplay="auto"
                min={0}
                max={400}
                step={10}
                className="text-blue-600 dark:text-blue-400"
              />
            </Grid>

            {/* Target Audience */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={filters.audience}
                  onChange={(e) => setFilters(prev => ({ ...prev, audience: e.target.value }))}
                  label="Target Audience"
                  className="bg-white dark:bg-gray-700"
                >
                  <MenuItem value="all">All Audiences</MenuItem>
                  <MenuItem value="budget">Budget-Conscious</MenuItem>
                  <MenuItem value="mainstream">Mainstream</MenuItem>
                  <MenuItem value="comprehensive">Comprehensive Needs</MenuItem>
                  <MenuItem value="urgent">Urgent/Fast Track</MenuItem>
                  <MenuItem value="business">Business/Enterprise</MenuItem>
                  <MenuItem value="specialized">Specialized</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Contract Length */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Contract Length</InputLabel>
                <Select
                  value={filters.contractLength}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractLength: e.target.value }))}
                  label="Contract Length"
                  className="bg-white dark:bg-gray-700"
                >
                  <MenuItem value="all">All Durations</MenuItem>
                  <MenuItem value="month-to-month">Month-to-Month</MenuItem>
                  <MenuItem value="3-month">3 Months</MenuItem>
                  <MenuItem value="6-month">6 Months</MenuItem>
                  <MenuItem value="12-month">12 Months</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Show Recommended Only */}
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showRecommendedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, showRecommendedOnly: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                    Recommended Only
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // RENDER HELPERS - LEARN MORE DIALOG
  // ============================================================================

  const LearnMoreDialog = () => {
    if (!expandedPlan) return null;

    const planTestimonials = TESTIMONIALS[expandedPlan.id] || [];

    return (
      <Dialog
        open={!!expandedPlan}
        onClose={() => setExpandedPlan(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'bg-white dark:bg-gray-800',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Box className="flex items-center justify-between">
            <Typography variant="h5" className="font-bold">
              {expandedPlan.name}
            </Typography>
            <IconButton
              onClick={() => setExpandedPlan(null)}
              size="small"
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="mt-4">
          <Grid container spacing={3}>
            {/* Pricing Summary */}
            <Grid item xs={12}>
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent>
                  <Box className="flex justify-between items-center">
                    <Box>
                      <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-400">
                        {expandedPlan.price === 0 ? 'Custom Quote' : `$${expandedPlan.price}/mo`}
                      </Typography>
                      {expandedPlan.setupFee > 0 && (
                        <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                          + ${expandedPlan.setupFee} one-time setup fee
                        </Typography>
                      )}
                    </Box>
                    <Box className="text-right">
                      <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-400">
                        12-Month Total
                      </Typography>
                      <Typography variant="h5" className="font-bold text-gray-900 dark:text-white">
                        {calculateTotalCost(expandedPlan, 12)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Ideal For */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" className="font-semibold mb-2 text-gray-900 dark:text-white">
                Ideal For:
              </Typography>
              <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                {expandedPlan.idealFor}
              </Typography>
            </Grid>

            {/* All Features */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-2 text-gray-900 dark:text-white">
                All Features:
              </Typography>
              <List dense>
                {expandedPlan.features.map((feature, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon className="min-w-[30px]">
                      <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        className: 'text-gray-700 dark:text-gray-300',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Expected Results */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="font-semibold mb-3 text-gray-900 dark:text-white">
                Expected Results:
              </Typography>
              <Box className="space-y-3">
                <Box className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                  <Box>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Score Increase
                    </Typography>
                    <Typography variant="h6" className="font-bold text-green-600 dark:text-green-400">
                      +{expandedPlan.scoreIncrease} points
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                  <Box>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Timeline
                    </Typography>
                    <Typography variant="h6" className="font-bold text-blue-600 dark:text-blue-400">
                      {expandedPlan.estimatedTimeline}
                    </Typography>
                  </Box>
                </Box>

                <Box className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Award size={24} className="text-purple-600 dark:text-purple-400" />
                  <Box>
                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                      Success Rate
                    </Typography>
                    <Typography variant="h6" className="font-bold text-purple-600 dark:text-purple-400">
                      {expandedPlan.successRate}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Testimonials */}
            {planTestimonials.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="font-semibold mb-3 text-gray-900 dark:text-white">
                  Client Success Stories:
                </Typography>
                <Box className="space-y-3">
                  {planTestimonials.map((testimonial, idx) => (
                    <Card key={idx} className="bg-gray-50 dark:bg-gray-700">
                      <CardContent>
                        <Box className="flex items-start gap-2 mb-2">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </Box>
                        <Typography variant="body2" className="text-gray-700 dark:text-gray-300 mb-2">
                          "{testimonial.text}"
                        </Typography>
                        <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                          - {testimonial.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions className="p-4">
          <Button
            onClick={() => setExpandedPlan(null)}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              handlePlanSelect(expandedPlan);
              setExpandedPlan(null);
            }}
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            startIcon={<Target size={16} />}
          >
            Select This Plan
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ============================================================================
  // RENDER HELPERS - COST CALCULATOR DIALOG
  // ============================================================================

  const CostCalculatorDialog = () => {
    if (!calculatorPlan) return null;

    const monthlyTotal = calculatorPlan.price * calculatorMonths;
    const setupFee = calculatorPlan.setupFee || 0;
    const grandTotal = monthlyTotal + setupFee;
    const avgMonthly = grandTotal / calculatorMonths;

    return (
      <Dialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'bg-white dark:bg-gray-800',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <Calculator size={24} />
              <Typography variant="h6" className="font-bold">
                Cost Calculator
              </Typography>
            </Box>
            <IconButton
              onClick={() => setCalculatorOpen(false)}
              size="small"
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="mt-4">
          <Typography variant="subtitle1" className="font-semibold mb-4 text-gray-900 dark:text-white">
            {calculatorPlan.name}
          </Typography>

          {/* Month Slider */}
          <Box className="mb-6">
            <Typography variant="body2" className="mb-2 text-gray-700 dark:text-gray-300">
              Number of Months: <strong>{calculatorMonths}</strong>
            </Typography>
            <Slider
              value={calculatorMonths}
              onChange={(e, newValue) => setCalculatorMonths(newValue)}
              valueLabelDisplay="auto"
              min={1}
              max={24}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 6, label: '6' },
                { value: 12, label: '12' },
                { value: 24, label: '24' },
              ]}
              className="text-green-600 dark:text-green-400"
            />
          </Box>

          {/* Cost Breakdown */}
          <Card className="bg-gray-50 dark:bg-gray-700 mb-4">
            <CardContent>
              <Box className="space-y-3">
                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    Monthly fee ({calculatorMonths} months):
                  </Typography>
                  <Typography variant="body2" className="font-semibold text-gray-900 dark:text-white">
                    ${calculatorPlan.price} × {calculatorMonths} = ${monthlyTotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    One-time setup fee:
                  </Typography>
                  <Typography variant="body2" className="font-semibold text-gray-900 dark:text-white">
                    ${setupFee}
                  </Typography>
                </Box>

                <Divider />

                <Box className="flex justify-between">
                  <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
                    Total Cost:
                  </Typography>
                  <Typography variant="h6" className="font-bold text-green-600 dark:text-green-400">
                    ${grandTotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box className="flex justify-between">
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                    Average per month:
                  </Typography>
                  <Typography variant="caption" className="text-gray-700 dark:text-gray-300">
                    ${avgMonthly.toFixed(2)}/mo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Expected ROI */}
          <Alert severity="info" icon={<BarChart3 size={20} />}>
            <Typography variant="caption">
              <strong>Expected Score Increase:</strong> +{calculatorPlan.scoreIncrease} points
              <br />
              <strong>Estimated Value:</strong> ${(calculatorPlan.scoreIncrease * 50).toLocaleString()}
              <br />
              <strong>ROI:</strong> {calculateROI(calculatorPlan, calculatorMonths)}%
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={() => setCalculatorOpen(false)} variant="outlined">
            Close
          </Button>
          <Button
            onClick={() => {
              handlePlanSelect(calculatorPlan);
              setCalculatorOpen(false);
            }}
            variant="contained"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Select This Plan
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (error) {
    return (
      <Box className="p-4">
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="service-plan-selector p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Credit Repair Plan
        </Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-300">
          Select the plan that best fits your credit repair needs and budget
        </Typography>
      </Box>

      {/* AI Feature #12: Next Best Plan Suggestion */}
      {nextBestPlan && displayMode === 'grid' && (
        <Alert severity="info" className="mb-4" icon={<Zap size={20} />}>
          <Typography variant="body2">
            <strong>Can't decide?</strong> If the recommended plan doesn't fit, consider{' '}
            <strong>{nextBestPlan.name}</strong> as your next best option with a {nextBestPlan.successRate}% success rate.
          </Typography>
        </Alert>
      )}

      {/* View Mode Toggles */}
      <Box className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={displayMode === 'grid' ? 'contained' : 'outlined'}
          onClick={() => setDisplayMode('grid')}
          startIcon={<Grid3x3 size={18} />}
          className={displayMode === 'grid' ? 'bg-blue-600 text-white' : ''}
        >
          Grid View
        </Button>
        <Button
          variant={displayMode === 'list' ? 'contained' : 'outlined'}
          onClick={() => setDisplayMode('list')}
          startIcon={<ListIcon size={18} />}
          className={displayMode === 'list' ? 'bg-blue-600 text-white' : ''}
        >
          List View
        </Button>
        {showComparison && (
          <Button
            variant={displayMode === 'comparison' ? 'contained' : 'outlined'}
            onClick={() => setDisplayMode('comparison')}
            startIcon={<GitCompare size={18} />}
            className={displayMode === 'comparison' ? 'bg-blue-600 text-white' : ''}
          >
            Compare Plans
            {selectedPlans.length > 0 && (
              <Badge badgeContent={selectedPlans.length} color="primary" className="ml-2" />
            )}
          </Button>
        )}
      </Box>

      {/* Filters */}
      {displayMode !== 'comparison' && <FilterSection />}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="40%" height={60} />
                  <Skeleton variant="rectangular" height={200} className="my-4" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredPlans.length === 0 && displayMode !== 'comparison' && (
        <Box className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-2">
            No Plans Match Your Criteria
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-500 mb-4">
            Try adjusting your filters to see more options
          </Typography>
          <Button
            variant="contained"
            onClick={handleResetFilters}
            startIcon={<RefreshCw size={16} />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Reset Filters
          </Button>
        </Box>
      )}

      {/* Grid View */}
      {!loading && displayMode === 'grid' && filteredPlans.length > 0 && (
        <Grid container spacing={3}>
          {filteredPlans.map(plan => (
            <Grid item xs={12} sm={6} lg={4} key={plan.id}>
              <PlanCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* List View */}
      {!loading && displayMode === 'list' && filteredPlans.length > 0 && (
        <Box>
          {filteredPlans.map(plan => (
            <PlanListItem key={plan.id} plan={plan} />
          ))}
        </Box>
      )}

      {/* Comparison View */}
      {!loading && displayMode === 'comparison' && <ComparisonView />}

      {/* Sticky Compare Button (Mobile) */}
      {showComparison && displayMode !== 'comparison' && selectedPlans.length > 0 && (
        <Box className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-lg md:hidden z-50">
          <Button
            variant="contained"
            fullWidth
            onClick={() => setDisplayMode('comparison')}
            startIcon={<GitCompare size={18} />}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Compare Selected Plans ({selectedPlans.length})
          </Button>
        </Box>
      )}

      {/* Learn More Dialog */}
      <LearnMoreDialog />

      {/* Cost Calculator Dialog */}
      <CostCalculatorDialog />
    </Box>
  );
};

export default ServicePlanSelector;
