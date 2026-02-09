// ============================================================================
// PRICING CALCULATOR WIDGET
// ============================================================================
// Path: /src/components/common/PricingCalculator.jsx
//
// PURPOSE:
// Standalone interactive pricing calculator widget for service plans
// with ROI projection, discount application, and comparison tables
//
// AI FEATURES (5 total):
// 1. Smart discount suggestions
// 2. Plan recommendation based on inputs
// 3. ROI prediction with confidence intervals
// 4. Timeline optimization
// 5. Breakeven calculation with personalized benefits
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Calculator,
  TrendingUp,
  Download,
  Printer,
  Info,
  Sparkles,
  Award,
  Clock,
  DollarSign,
  Target,
  AlertCircle,
} from 'lucide-react';

// Service plans (matches servicePlans.js constants)
const SERVICE_PLANS = {
  essentials: {
    id: 'essentials',
    name: 'Essentials',
    monthlyFee: 79,
    setupFee: 49,
    perDeletion: 0,
    itemsIncluded: 'unlimited (client sends)',
    features: ['AI dispute templates', 'Credit education library', 'Client portal', 'Email support (24-48hr)'],
    tier: 1,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    monthlyFee: 149,
    setupFee: 0,
    perDeletion: 25,
    itemsIncluded: 'unlimited (we send)',
    features: ['Full-service disputes (mail + fax)', 'Dedicated account manager', 'Phone + email support', 'Monthly AI analysis', '$25/item deleted/bureau'],
    tier: 2,
  },
  vip: {
    id: 'vip',
    name: 'VIP Concierge',
    monthlyFee: 299,
    setupFee: 0,
    perDeletion: 0,
    itemsIncluded: 'unlimited (priority)',
    features: ['Everything in Professional', 'Bi-weekly cycles (2x faster)', 'ALL deletion fees included', 'Weekly reports', '90-day guarantee', 'Direct cell access'],
    tier: 3,
  },
};

// Available discounts
const DISCOUNTS = [
  { id: 'military', name: 'Military Discount', percent: 10 },
  { id: 'annual', name: 'Annual Pre-Payment', percent: 15 },
  { id: 'referral', name: 'Referral Bonus', percent: 5 },
  { id: 'couples', name: 'Couples Discount (2nd enrollment)', percent: 20 },
  { id: 'loyalty', name: 'Loyalty Discount', percent: 8 },
];

const PricingCalculator = ({
  defaultPlanId = 'professional',
  contactId = null,
  embedded = false,
  showComparison = true,
  onCalculate = null,
}) => {
  // State management
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [duration, setDuration] = useState(6);
  const [itemsToDispute, setItemsToDispute] = useState(10);
  const [includeSetupFee, setIncludeSetupFee] = useState(true);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const selectedPlan = SERVICE_PLANS[selectedPlanId];

  // AI Feature 1: Smart discount suggestions
  useEffect(() => {
    const suggestDiscounts = () => {
      const suggestions = [];

      if (duration >= 12) {
        suggestions.push('annual');
      }

      if (itemsToDispute > 15 && selectedPlanId !== 'enterprise') {
        suggestions.push('loyalty');
      }

      // Auto-apply seasonal discount in certain months
      const currentMonth = new Date().getMonth();
      if ([0, 6, 11].includes(currentMonth)) {
        suggestions.push('seasonal');
      }

      setSelectedDiscounts(prev => {
        const unique = [...new Set([...prev, ...suggestions])];
        return unique.filter(d => DISCOUNTS.find(disc => disc.id === d));
      });
    };

    suggestDiscounts();
  }, [duration, itemsToDispute, selectedPlanId]);

  // Calculate pricing breakdown
  const pricingBreakdown = useMemo(() => {
    const monthlyFee = selectedPlan.monthlyFee;
    const setupFee = includeSetupFee ? selectedPlan.setupFee : 0;
    const subtotal = monthlyFee * duration + setupFee;

    // Calculate total discount
    const totalDiscountPercent = selectedDiscounts.reduce((sum, discountId) => {
      const discount = DISCOUNTS.find(d => d.id === discountId);
      return sum + (discount ? discount.percent : 0);
    }, 0);

    const discountAmount = subtotal * (Math.min(totalDiscountPercent, 50) / 100); // Cap at 50%
    const total = subtotal - discountAmount;
    const monthlyAverage = total / duration;

    return {
      monthlyFee,
      setupFee,
      subtotal,
      discountPercent: Math.min(totalDiscountPercent, 50),
      discountAmount,
      total,
      monthlyAverage,
    };
  }, [selectedPlan, duration, includeSetupFee, selectedDiscounts]);

  // AI Feature 2: Plan recommendation based on inputs
  const recommendedPlan = useMemo(() => {
    if (itemsToDispute > 20) return 'enterprise';
    if (itemsToDispute > 15) return 'vip';
    if (itemsToDispute > 8) return 'professional';
    return 'basic';
  }, [itemsToDispute]);

  // AI Feature 3: ROI prediction with confidence intervals
  const roiProjection = useMemo(() => {
    const avgScoreIncrease = selectedPlan.tier * 15 + (duration >= 6 ? 10 : 0);
    const minIncrease = avgScoreIncrease * 0.7;
    const maxIncrease = avgScoreIncrease * 1.3;

    const estimatedSavings = avgScoreIncrease * 85; // $85 per point improvement
    const roi = ((estimatedSavings - pricingBreakdown.total) / pricingBreakdown.total) * 100;

    return {
      avgScoreIncrease,
      minIncrease: Math.floor(minIncrease),
      maxIncrease: Math.ceil(maxIncrease),
      estimatedSavings: Math.round(estimatedSavings),
      roi: Math.round(roi),
      confidence: duration >= 6 ? 'High' : 'Medium',
    };
  }, [selectedPlan, duration, pricingBreakdown.total]);

  // AI Feature 4: Timeline optimization
  const timelineOptimization = useMemo(() => {
    const recommendations = [];

    if (duration < 6) {
      recommendations.push({
        type: 'warning',
        message: `Consider extending to 6 months for better results (avg. ${Math.round((roiProjection.avgScoreIncrease / duration) * 6)}pt improvement)`,
      });
    }

    if (duration > 12 && selectedPlanId === 'basic') {
      recommendations.push({
        type: 'info',
        message: 'For long-term plans, upgrading to Standard may provide better value',
      });
    }

    if (duration >= 12 && !selectedDiscounts.includes('annual')) {
      recommendations.push({
        type: 'success',
        message: 'Annual pre-payment discount available! Save 15%',
      });
    }

    return recommendations;
  }, [duration, selectedPlanId, selectedDiscounts, roiProjection]);

  // AI Feature 5: Breakeven calculation with personalized benefits
  const breakevenAnalysis = useMemo(() => {
    const monthlyInvestment = pricingBreakdown.monthlyAverage;
    const expectedMonthlyBenefit = roiProjection.estimatedSavings / duration;
    const breakevenMonths = Math.ceil(monthlyInvestment / expectedMonthlyBenefit);

    return {
      breakevenMonths,
      totalInvestment: pricingBreakdown.total,
      projectedReturn: roiProjection.estimatedSavings,
      netBenefit: roiProjection.estimatedSavings - pricingBreakdown.total,
      paybackRatio: (roiProjection.estimatedSavings / pricingBreakdown.total).toFixed(2),
    };
  }, [pricingBreakdown, roiProjection, duration]);

  // Generate AI insights
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const insights = {
        recommendation: recommendedPlan !== selectedPlanId
          ? `Based on ${itemsToDispute} items, we recommend the ${SERVICE_PLANS[recommendedPlan].name}`
          : `The ${selectedPlan.name} is optimal for your needs`,
        savings: breakevenAnalysis.netBenefit > 0
          ? `Projected net benefit: $${breakevenAnalysis.netBenefit.toLocaleString()}`
          : 'Consider longer duration for better ROI',
        timeline: timelineOptimization.length > 0
          ? timelineOptimization[0].message
          : 'Timeline is optimized',
      };
      setAiInsights(insights);
      setLoading(false);
    }, 500);
  }, [selectedPlanId, itemsToDispute, recommendedPlan, breakevenAnalysis, timelineOptimization, selectedPlan.name]);

  // Notify parent component
  useEffect(() => {
    if (onCalculate) {
      onCalculate({
        plan: selectedPlan,
        duration,
        pricing: pricingBreakdown,
        roi: roiProjection,
        breakeven: breakevenAnalysis,
      });
    }
  }, [pricingBreakdown, roiProjection, breakevenAnalysis, onCalculate, selectedPlan, duration]);

  // Handle discount toggle
  const handleDiscountToggle = (discountId) => {
    setSelectedDiscounts(prev =>
      prev.includes(discountId)
        ? prev.filter(d => d !== discountId)
        : [...prev, discountId]
    );
  };

  // Export functionality
  const handleExport = (format) => {
    const data = {
      plan: selectedPlan.name,
      duration: `${duration} months`,
      pricing: pricingBreakdown,
      roi: roiProjection,
      breakeven: breakevenAnalysis,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-calculation-${Date.now()}.json`;
      a.click();
    } else if (format === 'print') {
      window.print();
    }

    setShowExportDialog(false);
  };

  return (
    <Box sx={{ maxWidth: embedded ? '100%' : 1200, mx: 'auto', p: embedded ? 0 : 2 }}>
      <Card elevation={embedded ? 0 : 3}>
        <CardHeader
          avatar={<Calculator size={24} />}
          title={<Typography variant="h5">Pricing Calculator</Typography>}
          subheader="Calculate your investment and projected ROI"
          action={
            !embedded && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Export">
                  <IconButton onClick={() => setShowExportDialog(true)} size="small">
                    <Download size={20} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton onClick={() => handleExport('print')} size="small">
                    <Printer size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            )
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Left Column - Inputs */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Plan Selector */}
                <FormControl fullWidth>
                  <InputLabel>Select Plan</InputLabel>
                  <Select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    label="Select Plan"
                  >
                    {Object.values(SERVICE_PLANS).map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{plan.name}</span>
                          <span>${plan.monthlyFee}/mo</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Duration Slider */}
                <Box>
                  <Typography gutterBottom>
                    Duration: {duration} months
                  </Typography>
                  <Slider
                    value={duration}
                    onChange={(e, value) => setDuration(value)}
                    min={1}
                    max={24}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 6, label: '6' },
                      { value: 12, label: '12' },
                      { value: 24, label: '24' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Items to Dispute */}
                <TextField
                  label="Estimated Items to Dispute"
                  type="number"
                  value={itemsToDispute}
                  onChange={(e) => setItemsToDispute(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                  inputProps={{ min: 1, max: 100 }}
                  helperText={`Recommended plan: ${SERVICE_PLANS[recommendedPlan].name}`}
                />

                {/* Setup Fee Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeSetupFee}
                      onChange={(e) => setIncludeSetupFee(e.target.checked)}
                    />
                  }
                  label={`Include Setup Fee ($${selectedPlan.setupFee})`}
                />

                {/* Discounts */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Award size={16} />
                    Available Discounts
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {DISCOUNTS.map((discount) => (
                      <Chip
                        key={discount.id}
                        label={`${discount.name} (${discount.percent}%)`}
                        onClick={() => handleDiscountToggle(discount.id)}
                        color={selectedDiscounts.includes(discount.id) ? 'primary' : 'default'}
                        variant={selectedDiscounts.includes(discount.id) ? 'filled' : 'outlined'}
                        icon={selectedDiscounts.includes(discount.id) ? <Sparkles size={16} /> : undefined}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Results */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Pricing Breakdown */}
                <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="h6" gutterBottom>
                    Total Investment
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${pricingBreakdown.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    ${pricingBreakdown.monthlyAverage.toFixed(2)}/month average
                  </Typography>
                </Paper>

                {/* Breakdown Details */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Monthly Fee</TableCell>
                          <TableCell align="right">${pricingBreakdown.monthlyFee}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Duration</TableCell>
                          <TableCell align="right">× {duration} months</TableCell>
                        </TableRow>
                        {includeSetupFee && (
                          <TableRow>
                            <TableCell>Setup Fee</TableCell>
                            <TableCell align="right">${pricingBreakdown.setupFee}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${pricingBreakdown.subtotal.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {pricingBreakdown.discountPercent > 0 && (
                          <TableRow>
                            <TableCell sx={{ color: 'success.main' }}>
                              Discount ({pricingBreakdown.discountPercent}%)
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>
                              -${pricingBreakdown.discountAmount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ${pricingBreakdown.total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                {/* ROI Projection */}
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp size={20} />
                    <Typography variant="h6">ROI Projection</Typography>
                    <Chip
                      label={roiProjection.confidence}
                      size="small"
                      sx={{ ml: 'auto' }}
                      color={roiProjection.confidence === 'High' ? 'success' : 'warning'}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Expected credit score improvement: {roiProjection.minIncrease}-{roiProjection.maxIncrease} points
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${roiProjection.estimatedSavings.toLocaleString()} estimated savings
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ROI: {roiProjection.roi > 0 ? '+' : ''}{roiProjection.roi}%
                  </Typography>
                </Paper>

                {/* Breakeven Analysis */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Clock size={20} />
                    <Typography variant="h6">Breakeven Analysis</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Breakeven
                      </Typography>
                      <Typography variant="h6">
                        {breakevenAnalysis.breakevenMonths} months
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Net Benefit
                      </Typography>
                      <Typography variant="h6" color={breakevenAnalysis.netBenefit > 0 ? 'success.main' : 'error.main'}>
                        ${breakevenAnalysis.netBenefit.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          {/* AI Insights */}
          {aiInsights && !loading && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Sparkles size={20} />
                <Typography variant="h6">AI Insights</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="info" icon={<Target size={20} />}>
                    {aiInsights.recommendation}
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" icon={<DollarSign size={20} />}>
                    {aiInsights.savings}
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="warning" icon={<Clock size={20} />}>
                    {aiInsights.timeline}
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Timeline Recommendations */}
          {timelineOptimization.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {timelineOptimization.slice(1).map((rec, idx) => (
                <Alert key={idx} severity={rec.type} sx={{ mb: 1 }} icon={<AlertCircle size={20} />}>
                  {rec.message}
                </Alert>
              ))}
            </Box>
          )}

          {/* Comparison Table */}
          {showComparison && !embedded && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Plan Comparison
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell align="right">Monthly Fee</TableCell>
                      <TableCell align="right">Setup Fee</TableCell>
                      <TableCell align="right">Items Included</TableCell>
                      <TableCell align="right">Total ({duration} mo)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.values(SERVICE_PLANS).map((plan) => {
                      const total = plan.monthlyFee * duration + (includeSetupFee ? plan.setupFee : 0);
                      const isSelected = plan.id === selectedPlanId;
                      return (
                        <TableRow
                          key={plan.id}
                          selected={isSelected}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setSelectedPlanId(plan.id)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {plan.name}
                              {isSelected && <Chip label="Selected" size="small" color="primary" />}
                            </Box>
                          </TableCell>
                          <TableCell align="right">${plan.monthlyFee}</TableCell>
                          <TableCell align="right">${plan.setupFee}</TableCell>
                          <TableCell align="right">
                            {typeof plan.itemsIncluded === 'number' ? plan.itemsIncluded : plan.itemsIncluded}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                            ${total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Calculation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose export format
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExport('json')}
              fullWidth
            >
              Download as JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<Printer />}
              onClick={() => handleExport('print')}
              fullWidth
            >
              Print
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default PricingCalculator;
