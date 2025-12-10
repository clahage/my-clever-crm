/**
 * Services Menu System - AI-Powered Service Recommendations
 * Intelligent service selection based on credit reports and budget
 *
 * Features:
 * - AI recommendations based on IDIQ credit reports
 * - Budget matching and affordability analysis
 * - Intelligent upsell suggestions
 * - Service packages and bundles
 * - ROI calculations
 * - Payment plan options
 * - Service comparison tools
 * - Client-specific customization
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Star,
  Lightbulb,
  ShoppingCart,
  CompareArrows,
  ExpandMore,
  Info,
  Schedule,
  Payment,
  LocalOffer,
  Recommend,
  Speed,
  Security,
  Verified,
  EmojiEvents,
} from '@mui/icons-material';

/**
 * Service definitions with pricing and features
 */
const SERVICES = {
  basic: {
    id: 'basic',
    name: 'Basic Credit Repair',
    category: 'Essential',
    price: 79,
    setupFee: 0,
    duration: '6 months',
    description: 'Essential credit repair services for simple cases',
    features: [
      'Credit report analysis',
      'Dispute letter generation (up to 3 items)',
      'Basic creditor negotiations',
      'Monthly progress reports',
      'Email support',
    ],
    idealFor: [
      'Simple credit issues',
      'Few negative items (1-3)',
      'Limited budget',
      'DIY-friendly clients',
    ],
    roi: '50-80 point increase',
    complexity: 'low',
    priority: 3,
  },

  standard: {
    id: 'standard',
    name: 'Standard Credit Repair',
    category: 'Popular',
    price: 129,
    setupFee: 99,
    duration: '6-12 months',
    description: 'Comprehensive credit repair for moderate cases',
    features: [
      'Everything in Basic, plus:',
      'Unlimited disputes',
      'Advanced creditor negotiations',
      'Pay-for-delete arrangements',
      'Goodwill letters',
      'Credit builder recommendations',
      'Bi-weekly progress reports',
      'Phone + email support',
      'Score tracking across all 3 bureaus',
    ],
    idealFor: [
      'Multiple negative items (4-8)',
      'Collections and charge-offs',
      'Late payments',
      'Standard income clients',
    ],
    roi: '80-120 point increase',
    complexity: 'medium',
    priority: 2,
  },

  premium: {
    id: 'premium',
    name: 'Premium Credit Restoration',
    category: 'Best Value',
    price: 199,
    setupFee: 149,
    duration: '12-18 months',
    description: 'Full-service credit restoration for complex cases',
    features: [
      'Everything in Standard, plus:',
      'Aggressive dispute strategies',
      'Legal letter escalation',
      'Bureau relationship management',
      'Identity theft protection',
      'Credit score optimization',
      'Authorized user tradelines',
      'Weekly progress reports',
      '24/7 priority support',
      'Dedicated account manager',
      'Payment plan negotiations',
    ],
    idealFor: [
      'Complex cases (9+ items)',
      'Bankruptcies',
      'Foreclosures',
      'Multiple collections',
      'High-income professionals',
    ],
    roi: '120-180 point increase',
    complexity: 'high',
    priority: 1,
  },

  executive: {
    id: 'executive',
    name: 'Executive Credit Concierge',
    category: 'VIP',
    price: 399,
    setupFee: 299,
    duration: '12-24 months',
    description: 'White-glove credit restoration for high-net-worth clients',
    features: [
      'Everything in Premium, plus:',
      'Attorney-backed disputes',
      'CFPB complaint filing',
      'Credit privacy optimization',
      'Business credit building',
      'Strategic credit planning',
      'Real estate preparation',
      'Mortgage readiness certification',
      'Daily monitoring and alerts',
      'VIP concierge service',
      'Personal credit consultant',
      'Unlimited consultation',
    ],
    idealFor: [
      'High-net-worth individuals',
      'Business owners',
      'Real estate investors',
      'Complex financial situations',
      'Time-sensitive needs',
    ],
    roi: '150-250 point increase',
    complexity: 'very-high',
    priority: 1,
  },
};

/**
 * Add-on services
 */
const ADDONS = {
  monitoring: {
    id: 'monitoring',
    name: 'Credit Monitoring',
    price: 29,
    recurring: true,
    description: '3-bureau credit monitoring with alerts',
  },
  tradelines: {
    id: 'tradelines',
    name: 'Authorized User Tradelines',
    price: 499,
    recurring: false,
    description: 'Add seasoned tradelines to boost score quickly',
  },
  identityProtection: {
    id: 'identityProtection',
    name: 'Identity Theft Protection',
    price: 19,
    recurring: true,
    description: 'Comprehensive identity monitoring and insurance',
  },
  businessCredit: {
    id: 'businessCredit',
    name: 'Business Credit Building',
    price: 299,
    recurring: false,
    description: 'Establish and build business credit profile',
  },
  rapidRescore: {
    id: 'rapidRescore',
    name: 'Rapid Rescore',
    price: 199,
    recurring: false,
    description: '72-hour score update for mortgage applications',
  },
};

/**
 * Services Menu Component
 */
const ServicesMenu = ({ contactId, creditReports, budget = null }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [clientBudget, setClientBudget] = useState(budget || 150);
  const [paymentPlan, setPaymentPlan] = useState('monthly');
  const [recommendations, setRecommendations] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState(null);

  // Analyze credit reports and generate AI recommendations
  useEffect(() => {
    if (creditReports && creditReports.length > 0) {
      const recs = analyzeAndRecommend(creditReports, clientBudget);
      setRecommendations(recs);

      // Auto-select recommended service
      if (recs.primaryRecommendation) {
        setSelectedService(recs.primaryRecommendation.id);
      }
    }
  }, [creditReports, clientBudget]);

  /**
   * AI Recommendation Engine
   * Analyzes credit reports to recommend best services
   */
  const analyzeAndRecommend = (reports, budget) => {
    // Count negative items across all bureaus
    let totalNegativeItems = 0;
    let collections = 0;
    let chargeoffs = 0;
    let latePayments = 0;
    let bankruptcies = 0;
    let foreclosures = 0;
    let avgScore = 0;
    let scoreCount = 0;

    reports.forEach(report => {
      if (report.score) {
        avgScore += report.score;
        scoreCount++;
      }

      if (report.derogatoryMarks) {
        report.derogatoryMarks.forEach(mark => {
          totalNegativeItems++;
          switch (mark.type?.toLowerCase()) {
            case 'collection':
              collections++;
              break;
            case 'chargeoff':
            case 'charge-off':
              chargeoffs++;
              break;
            case 'bankruptcy':
              bankruptcies++;
              break;
            case 'foreclosure':
              foreclosures++;
              break;
          }
        });
      }

      if (report.accounts) {
        report.accounts.forEach(account => {
          if (account.paymentHistory) {
            const lates = account.paymentHistory.filter(p =>
              p.status === 'late' || p.status === 'missed'
            ).length;
            latePayments += lates;
          }
        });
      }
    });

    avgScore = scoreCount > 0 ? avgScore / scoreCount : 0;

    // Determine complexity
    const complexity = calculateComplexity({
      totalNegativeItems,
      collections,
      chargeoffs,
      bankruptcies,
      foreclosures,
      latePayments,
      avgScore,
    });

    // Determine recommended service based on complexity and budget
    let primaryRec = null;
    let alternativeRecs = [];
    let upsellRecs = [];

    if (complexity === 'very-high' || bankruptcies > 0 || foreclosures > 0) {
      primaryRec = SERVICES.executive;
      alternativeRecs = [SERVICES.premium];
      upsellRecs = [ADDONS.tradelines, ADDONS.businessCredit];
    } else if (complexity === 'high' || totalNegativeItems >= 9) {
      primaryRec = SERVICES.premium;
      alternativeRecs = [SERVICES.standard, SERVICES.executive];
      upsellRecs = [ADDONS.monitoring, ADDONS.tradelines];
    } else if (complexity === 'medium' || totalNegativeItems >= 4) {
      primaryRec = SERVICES.standard;
      alternativeRecs = [SERVICES.basic, SERVICES.premium];
      upsellRecs = [ADDONS.monitoring, ADDONS.identityProtection];
    } else {
      primaryRec = SERVICES.basic;
      alternativeRecs = [SERVICES.standard];
      upsellRecs = [ADDONS.monitoring];
    }

    // Budget matching
    const affordable = Object.values(SERVICES).filter(s => s.price <= budget);
    const budgetMatch = affordable.length > 0 ? affordable[affordable.length - 1] : SERVICES.basic;

    // Calculate ROI
    const expectedIncrease = calculateExpectedIncrease(primaryRec, complexity);
    const projectedScore = Math.min(850, avgScore + expectedIncrease);

    return {
      primaryRecommendation: primaryRec,
      alternativeRecommendations: alternativeRecs,
      upsellRecommendations: upsellRecs,
      budgetMatchRecommendation: budgetMatch.id !== primaryRec.id ? budgetMatch : null,
      complexity,
      currentScore: Math.round(avgScore),
      projectedScore: Math.round(projectedScore),
      expectedIncrease,
      negativeItemsAnalysis: {
        total: totalNegativeItems,
        collections,
        chargeoffs,
        bankruptcies,
        foreclosures,
        latePayments,
      },
      reasoning: generateRecommendationReasoning(
        primaryRec,
        complexity,
        totalNegativeItems,
        avgScore
      ),
    };
  };

  /**
   * Calculate case complexity
   */
  const calculateComplexity = (factors) => {
    let complexityScore = 0;

    // Negative items weight
    complexityScore += factors.totalNegativeItems * 2;

    // Specific item weights
    complexityScore += factors.bankruptcies * 20;
    complexityScore += factors.foreclosures * 15;
    complexityScore += factors.chargeoffs * 5;
    complexityScore += factors.collections * 3;
    complexityScore += Math.min(factors.latePayments / 5, 10);

    // Score factor
    if (factors.avgScore < 580) complexityScore += 15;
    else if (factors.avgScore < 670) complexityScore += 10;
    else if (factors.avgScore < 740) complexityScore += 5;

    // Determine complexity level
    if (complexityScore >= 40) return 'very-high';
    if (complexityScore >= 25) return 'high';
    if (complexityScore >= 10) return 'medium';
    return 'low';
  };

  /**
   * Calculate expected score increase
   */
  const calculateExpectedIncrease = (service, complexity) => {
    const baseIncrease = {
      'very-high': { basic: 40, standard: 60, premium: 80, executive: 100 },
      'high': { basic: 50, standard: 80, premium: 100, executive: 130 },
      'medium': { basic: 60, standard: 90, premium: 110, executive: 140 },
      'low': { basic: 50, standard: 70, premium: 90, executive: 120 },
    };

    return baseIncrease[complexity][service.id] || 50;
  };

  /**
   * Generate recommendation reasoning
   */
  const generateRecommendationReasoning = (service, complexity, negativeItems, score) => {
    const reasons = [];

    if (complexity === 'very-high') {
      reasons.push('Your case requires advanced legal strategies and bureau relationship management');
      if (negativeItems >= 15) {
        reasons.push(`${negativeItems} negative items need aggressive dispute tactics`);
      }
    } else if (complexity === 'high') {
      reasons.push('Multiple complex issues require comprehensive approach');
      reasons.push('Premium service provides the tools needed for significant improvement');
    } else if (complexity === 'medium') {
      reasons.push('Standard service offers best value for your situation');
      reasons.push('Proven track record with similar cases');
    } else {
      reasons.push('Your case is straightforward and responds well to basic services');
      reasons.push('Cost-effective solution for simple credit issues');
    }

    if (score < 600) {
      reasons.push('Current score indicates need for intensive intervention');
    }

    return reasons;
  };

  /**
   * Calculate total cost
   */
  const calculateTotalCost = () => {
    if (!selectedService) return 0;

    const service = SERVICES[selectedService];
    let total = service.price + service.setupFee;

    selectedAddons.forEach(addonId => {
      const addon = ADDONS[addonId];
      if (addon) {
        total += addon.price;
      }
    });

    return total;
  };

  /**
   * Calculate monthly payment
   */
  const calculateMonthlyPayment = () => {
    const total = calculateTotalCost();

    switch (paymentPlan) {
      case 'upfront':
        return total;
      case 'monthly':
        return SERVICES[selectedService]?.price || 0;
      case 'quarterly':
        return (SERVICES[selectedService]?.price || 0) * 3;
      default:
        return total;
    }
  };

  /**
   * Toggle addon selection
   */
  const toggleAddon = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  /**
   * Show service details
   */
  const showDetails = (serviceId) => {
    setSelectedForDetails(SERVICES[serviceId]);
    setDetailsDialogOpen(true);
  };

  /**
   * Get complexity color
   */
  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'very-high':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI-Powered Services Menu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Personalized service recommendations based on your credit profile
        </Typography>
      </Box>

      {/* AI Recommendations Section */}
      {recommendations && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Lightbulb color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">AI Recommendation</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Star color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {recommendations.primaryRecommendation.name}
                    </Typography>
                    <Chip
                      label="Recommended"
                      size="small"
                      color="primary"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {recommendations.primaryRecommendation.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Current Score
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {recommendations.currentScore}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Projected Score
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {recommendations.projectedScore}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Expected Increase
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <TrendingUp color="success" sx={{ mr: 0.5 }} />
                      <Typography variant="h6" color="success.main">
                        +{recommendations.expectedIncrease} points
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`Complexity: ${recommendations.complexity}`}
                      size="small"
                      color={getComplexityColor(recommendations.complexity)}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setSelectedService(recommendations.primaryRecommendation.id)}
                  >
                    Select This Service
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Why We Recommend This:
                </Typography>
                <List dense>
                  {recommendations.reasoning.map((reason, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={reason} />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Your Credit Analysis:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Negative Items
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {recommendations.negativeItemsAnalysis.total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Collections
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {recommendations.negativeItemsAnalysis.collections}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Charge-offs
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {recommendations.negativeItemsAnalysis.chargeoffs}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Late Payments
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {recommendations.negativeItemsAnalysis.latePayments}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Budget Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
          Your Budget
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={clientBudget}
            onChange={(e, v) => setClientBudget(v)}
            min={50}
            max={500}
            step={10}
            marks={[
              { value: 50, label: '$50' },
              { value: 150, label: '$150' },
              { value: 300, label: '$300' },
              { value: 500, label: '$500' },
            ]}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => `$${value}/mo`}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Adjust slider to see services within your budget
        </Typography>
      </Paper>

      {/* Services Grid */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Available Services
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.values(SERVICES).map(service => {
          const isRecommended = recommendations?.primaryRecommendation?.id === service.id;
          const isAffordable = service.price <= clientBudget;
          const isSelected = selectedService === service.id;

          return (
            <Grid item xs={12} md={6} lg={3} key={service.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isSelected ? '2px solid' : '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  opacity: isAffordable ? 1 : 0.6,
                  position: 'relative',
                }}
              >
                {isRecommended && (
                  <Chip
                    label="AI Recommended"
                    size="small"
                    color="primary"
                    icon={<AutoAwesome />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  />
                )}
                {!isAffordable && (
                  <Chip
                    label="Over Budget"
                    size="small"
                    color="warning"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ flex: 1 }}>
                  <Chip
                    label={service.category}
                    size="small"
                    color={service.category === 'Best Value' ? 'success' : 'default'}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold">
                      ${service.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      /month
                    </Typography>
                  </Box>

                  {service.setupFee > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      + ${service.setupFee} setup fee
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 2 }}>
                    {service.description}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" fontWeight="bold" gutterBottom>
                    Key Features:
                  </Typography>
                  <List dense>
                    {service.features.slice(0, 4).map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.25, pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                    {service.features.length > 4 && (
                      <ListItem sx={{ py: 0.25, pl: 0 }}>
                        <ListItemText
                          primary={`+ ${service.features.length - 4} more features`}
                          primaryTypographyProps={{ variant: 'caption', color: 'primary' }}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold">
                      Expected ROI: {service.roi}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setSelectedService(service.id)}
                    disabled={!isAffordable}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => showDetails(service.id)}
                  >
                    <Info />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add-ons Section */}
      {selectedService && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalOffer sx={{ mr: 1 }} />
            <Typography variant="h6">Add-On Services</Typography>
            {recommendations?.upsellRecommendations && (
              <Chip
                label={`${recommendations.upsellRecommendations.length} Recommended`}
                size="small"
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Grid container spacing={2}>
            {Object.values(ADDONS).map(addon => {
              const isRecommended = recommendations?.upsellRecommendations?.some(
                rec => rec.id === addon.id
              );

              return (
                <Grid item xs={12} md={6} key={addon.id}>
                  <Card
                    sx={{
                      border: selectedAddons.includes(addon.id) ? '2px solid' : '1px solid',
                      borderColor: selectedAddons.includes(addon.id) ? 'primary.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {addon.name}
                            </Typography>
                            {isRecommended && (
                              <Chip label="Recommended" size="small" color="primary" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {addon.description}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ${addon.price}{addon.recurring && '/mo'}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={selectedAddons.includes(addon.id)}
                          onChange={() => toggleAddon(addon.id)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Order Summary */}
      {selectedService && (
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
            Order Summary
          </Typography>

          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {SERVICES[selectedService].name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${SERVICES[selectedService].price}/mo
                  </TableCell>
                </TableRow>
                {SERVICES[selectedService].setupFee > 0 && (
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2">Setup Fee (one-time)</Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${SERVICES[selectedService].setupFee}
                    </TableCell>
                  </TableRow>
                )}
                {selectedAddons.map(addonId => (
                  <TableRow key={addonId}>
                    <TableCell>
                      <Typography variant="body2">
                        {ADDONS[addonId].name}
                        {ADDONS[addonId].recurring && ' (monthly)'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${ADDONS[addonId].price}
                      {ADDONS[addonId].recurring && '/mo'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Divider />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">Total Today</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary">
                      ${calculateTotalCost()}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2">Monthly Payment</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      ${calculateMonthlyPayment()}/mo
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
            >
              Proceed to Checkout
            </Button>
            <Button variant="outlined" size="large">
              Save Quote
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Money-Back Guarantee</AlertTitle>
            Not satisfied? Get a full refund within 30 days - no questions asked.
          </Alert>
        </Paper>
      )}

      {/* Service Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedForDetails && (
          <>
            <DialogTitle>{selectedForDetails.name}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" paragraph>
                {selectedForDetails.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                All Features:
              </Typography>
              <List>
                {selectedForDetails.features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Ideal For:
              </Typography>
              <List>
                {selectedForDetails.idealFor.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Verified color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedService(selectedForDetails.id);
                  setDetailsDialogOpen(false);
                }}
              >
                Select This Service
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ServicesMenu;
