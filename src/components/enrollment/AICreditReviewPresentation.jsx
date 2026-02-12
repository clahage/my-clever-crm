// ============================================================================
// AICreditReviewPresentation.jsx - AI-Powered Credit Review Presentation
// ============================================================================
// Path: src/components/enrollment/AICreditReviewPresentation.jsx
//
// 🎯 MISSION: The single highest-impact conversion feature in SpeedyCRM
// This component shows prospects EXACTLY what's wrong, EXACTLY how we'll fix it,
// and recommends a service plan — all at the moment of maximum emotional motivation.
//
// SECTIONS:
// A. Your Credit Snapshot (3-bureau scores with color coding)
// B. What's Holding You Back (all negative items with severity)
// C. Your Personalized Strategy (AI-generated dispute strategy)
// D. Recommended Service Plan (AI recommendation with side-by-side comparison)
// E. Call to Action (proceed to plan confirmation)
//
// © 1995-2025 Speedy Credit Repair Inc. | Christopher Lahage | All Rights Reserved
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AutoAwesome as SparkleIcon,
  Assessment as ChartIcon,
  Psychology as BrainIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ClockIcon,
  AttachMoney as MoneyIcon,
  Shield as ShieldIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Print as PrintIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ===== STYLED COMPONENTS =====
// ============================================================================

const ScoreCircle = styled(Box)(({ theme, score }) => {
  // Determine color based on score
  const getColor = (s) => {
    if (s >= 740) return theme.palette.success.main;
    if (s >= 670) return theme.palette.warning.light;
    if (s >= 580) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const color = getColor(score);

  return {
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: `conic-gradient(
      ${color} 0deg,
      ${color} ${((score - 300) / 550) * 360}deg,
      ${alpha(color, 0.1)} ${((score - 300) / 550) * 360}deg
    )`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '80%',
      height: '80%',
      borderRadius: '50%',
      background: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
    },
  };
});

const GlowingButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 15px rgba(33, 150, 243, 0.4)',
  color: 'white',
  padding: '16px 48px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 30px rgba(33, 150, 243, 0.6)',
    transform: 'translateY(-3px)',
  },
}));

const PlanCard = styled(Card)(({ theme, isRecommended }) => ({
  position: 'relative',
  border: isRecommended ? `3px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.12)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  height: '100%',
  transform: isRecommended ? 'scale(1.05)' : 'scale(1)',
  boxShadow: isRecommended
    ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`
    : '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: isRecommended ? 'scale(1.08)' : 'scale(1.03)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

const RecommendedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -12,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
  color: 'white',
  padding: '6px 20px',
  borderRadius: 20,
  fontWeight: 700,
  fontSize: '0.85rem',
  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  zIndex: 10,
}));

const NegativeItemChip = styled(Chip)(({ theme, severity }) => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.warning.light,
  };

  return {
    backgroundColor: alpha(colors[severity] || colors.medium, 0.1),
    color: colors[severity] || colors.medium,
    fontWeight: 600,
    borderRadius: 8,
  };
});

// ============================================================================
// ===== MAIN COMPONENT =====
// ============================================================================

const AICreditReviewPresentation = ({
  creditScores = { transunion: null, experian: null, equifax: null },
  negativeItems = [],
  disputeStrategy = null,
  recommendedPlan = null,
  contactId = null,
  loading = false,
  onContinue = () => {},
  onScheduleCall = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ===== STATE =====
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showTestimonial, setShowTestimonial] = useState(true);

  // ===== ANIMATION SEQUENCE =====
  // Animate sections appearing one by one
  useEffect(() => {
    if (!loading) {
      const timer = setInterval(() => {
        setCurrentSection((prev) => (prev < 5 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(timer);
    }
  }, [loading]);

  // ===== ROTATE TESTIMONIALS =====
  const testimonials = [
    {
      name: 'Maria G.',
      city: 'Los Angeles',
      score: '+142 points',
      text: 'Speedy Credit Repair helped me go from 543 to 685 in just 90 days!',
      rating: 5,
    },
    {
      name: 'James T.',
      city: 'Houston',
      score: '+168 points',
      text: 'I was able to buy my dream home thanks to their expert help.',
      rating: 5,
    },
    {
      name: 'Lisa M.',
      city: 'Chicago',
      score: '+121 points',
      text: 'Professional service and real results. Highly recommend!',
      rating: 5,
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // ===== CALCULATE METRICS =====
  const averageScore =
    creditScores.transunion || creditScores.experian || creditScores.equifax || 0;

  const nationalAverage = 716;
  const percentile = Math.max(
    0,
    Math.min(100, Math.round(((averageScore - 300) / (850 - 300)) * 100))
  );

  // Group negative items by type
  const groupedNegativeItems = negativeItems.reduce((acc, item) => {
    const type = item.type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  // Calculate total impact
  const totalBalance = negativeItems.reduce((sum, item) => sum + (item.balance || 0), 0);
  const estimatedAnnualCost = Math.round(totalBalance * 0.15); // Rough estimate of 15% interest

  // ===== SERVICE PLANS =====
  const servicePlans = [
    {
      id: 'essentials',
      name: 'Essentials',
      price: 79,
      setupFee: 49,
      perDeletion: 0,
      highlight: 'Budget-friendly',
      features: [
        'AI Credit Analysis & Strategy',
        'Dispute Letter Templates',
        'Client Portal & Progress Tracking',
        'Email Support (24-48hr)',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 149,
      setupFee: 0,
      perDeletion: 25,
      highlight: '⭐ Most Popular',
      features: [
        'Full-Service Disputes (mail + fax)',
        'Dedicated Account Manager',
        'Phone + Email Support',
        'Monthly AI Analysis',
        '$25/item deleted/bureau',
      ],
    },
    {
      id: 'vip',
      name: 'VIP Concierge',
      price: 299,
      setupFee: 0,
      perDeletion: 0,
      highlight: '👑 White-glove',
      features: [
        'Everything in Professional',
        'Bi-Weekly Cycles (2x faster)',
        'ALL Deletion Fees Included',
        '90-Day Guarantee',
        'Direct Cell Access',
        'Weekly Reports',
      ],
    },
  ];

  const recommendedPlanData = servicePlans.find((p) => p.id === recommendedPlan) || servicePlans[1];

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={80} sx={{ mb: 3 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🤖 AI Credit Analysis in Progress
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Our AI is analyzing your credit report to create your personalized strategy...
          </Typography>

          <Box sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Finding negative items..." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CircularProgress size={24} />
                </ListItemIcon>
                <ListItemText primary="Building your dispute strategy..." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24 }} />
                </ListItemIcon>
                <ListItemText primary="Calculating success probability..." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24 }} />
                </ListItemIcon>
                <ListItemText primary="Recommending your service plan..." />
              </ListItem>
            </List>
          </Box>

          <Typography variant="caption" color="text.secondary">
            This typically takes 15-30 seconds...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // ============================================================================
  // ===== SECTION A: YOUR CREDIT SNAPSHOT =====
  // ============================================================================
  const renderCreditSnapshot = () => (
    <AnimatePresence>
      {currentSection >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                icon={<SparkleIcon />}
                label="Your Credit Snapshot"
                color="primary"
                sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', px: 2, py: 3 }}
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Here's Where You Stand
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your credit scores across all three bureaus
              </Typography>
            </Box>

            {/* ===== CREDIT SCORES ===== */}
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
              {creditScores.transunion && (
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ScoreCircle score={creditScores.transunion}>
                      <Box sx={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
                        <Typography variant="h2" fontWeight={700}>
                          {creditScores.transunion}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          TransUnion
                        </Typography>
                      </Box>
                    </ScoreCircle>
                  </Box>
                </Grid>
              )}

              {creditScores.experian && (
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ScoreCircle score={creditScores.experian}>
                      <Box sx={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
                        <Typography variant="h2" fontWeight={700}>
                          {creditScores.experian}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Experian
                        </Typography>
                      </Box>
                    </ScoreCircle>
                  </Box>
                </Grid>
              )}

              {creditScores.equifax && (
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ScoreCircle score={creditScores.equifax}>
                      <Box sx={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
                        <Typography variant="h2" fontWeight={700}>
                          {creditScores.equifax}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Equifax
                        </Typography>
                      </Box>
                    </ScoreCircle>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* ===== CONTEXT & COMPARISON ===== */}
            <Box sx={{ textAlign: 'center' }}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                National Average Credit Score: <strong>{nationalAverage}</strong>
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Your score is in the <strong>{percentile}th percentile</strong>
              </Typography>

              {averageScore < nationalAverage && (
                <Alert severity="info" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                  <AlertTitle>Good News!</AlertTitle>
                  Your score has significant room for improvement. Most of our clients with similar
                  profiles see increases of 80-150 points within 90 days.
                </Alert>
              )}

              {averageScore >= nationalAverage && (
                <Alert severity="success" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                  <AlertTitle>Great Start!</AlertTitle>
                  You're already above the national average. We can help you reach excellent credit
                  (740+) even faster.
                </Alert>
              )}
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // ===== SECTION B: WHAT'S HOLDING YOU BACK =====
  // ============================================================================
  const renderNegativeItems = () => (
    <AnimatePresence>
      {currentSection >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,0,0,0.05)' : 'rgba(255,0,0,0.02)',
              border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                icon={<WarningIcon />}
                label="What's Holding You Back"
                color="error"
                sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', px: 2, py: 3 }}
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                We Found {negativeItems.length} Negative Item{negativeItems.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                These items are dragging down your credit score
              </Typography>
            </Box>

            {/* ===== SUMMARY STATS ===== */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: 'none' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    <Typography variant="h3" fontWeight={700}>
                      {negativeItems.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Negative Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), border: 'none' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MoneyIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h3" fontWeight={700}>
                      ${estimatedAnnualCost.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Est. Annual Cost in Higher Interest
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* ===== GROUPED NEGATIVE ITEMS ===== */}
            {Object.entries(groupedNegativeItems).map(([type, items], idx) => (
              <Card key={type} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedCategory(expandedCategory === type ? null : type)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ErrorIcon color="error" />
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {items.length} item{items.length !== 1 ? 's' : ''} • Total: $
                          {items.reduce((sum, i) => sum + (i.balance || 0), 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      {expandedCategory === type ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  <Collapse in={expandedCategory === type}>
                    <Box sx={{ mt: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Creditor</TableCell>
                              <TableCell>Bureau(s)</TableCell>
                              <TableCell align="right">Balance</TableCell>
                              <TableCell align="center">Severity</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item, itemIdx) => (
                              <TableRow key={itemIdx}>
                                <TableCell>{item.creditorName || 'Unknown'}</TableCell>
                                <TableCell>
                                  {Array.isArray(item.bureaus)
                                    ? item.bureaus.join(', ')
                                    : item.bureau || 'N/A'}
                                </TableCell>
                                <TableCell align="right">
                                  ${(item.balance || 0).toLocaleString()}
                                </TableCell>
                                <TableCell align="center">
                                  <NegativeItemChip
                                    label={item.priority || 'Medium'}
                                    severity={
                                      item.priority === 'High'
                                        ? 'high'
                                        : item.priority === 'Low'
                                        ? 'low'
                                        : 'medium'
                                    }
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}

            {negativeItems.length === 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <AlertTitle>Great News!</AlertTitle>
                We didn't find any major negative items on your credit report. We can still help you
                optimize your score and maintain excellent credit.
              </Alert>
            )}
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // ===== SECTION C: YOUR PERSONALIZED STRATEGY =====
  // ============================================================================
  const renderStrategy = () => (
    <AnimatePresence>
      {currentSection >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(33,150,243,0.05)' : 'rgba(33,150,243,0.02)',
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                icon={<BrainIcon />}
                label="Your Personalized Strategy"
                color="primary"
                sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', px: 2, py: 3 }}
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Here's How We'll Fix It
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-generated dispute strategy based on your unique credit profile
              </Typography>
            </Box>

            {/* ===== STRATEGY OVERVIEW ===== */}
            {disputeStrategy && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📋 Strategy Summary
                </Typography>
                <Typography variant="body1" paragraph>
                  {disputeStrategy.summary ||
                    `We've identified ${negativeItems.length} disputable items across your credit reports. Our AI has created a prioritized attack plan focusing on high-impact items first.`}
                </Typography>
              </Box>
            )}

            {/* ===== PRIORITY ORDER ===== */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🎯 Priority Order (Attack Plan)
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="1" color="error" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="High-Impact Negative Items First"
                    secondary="Collections, charge-offs, and late payments with the biggest score impact"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="2" color="warning" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Outdated & Inaccurate Information"
                    secondary="Items past the 7-year reporting limit and data inconsistencies"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="3" color="info" size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hard Inquiries & Minor Items"
                    secondary="Unauthorized inquiries and low-impact items"
                  />
                </ListItem>
              </List>
            </Box>

            {/* ===== BUREAU BREAKDOWN ===== */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🏢 Bureau-by-Bureau Approach
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        TransUnion
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Via IDIQ API (instant disputes)
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Expected first results in <strong>7-14 days</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Experian
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Via certified fax & mail
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Expected first results in <strong>21-30 days</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Equifax
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Via certified fax & mail
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Expected first results in <strong>21-30 days</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* ===== TIMELINE & SUCCESS PROBABILITY ===== */}
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📅 Estimated Timeline & Success Rate
              </Typography>
              <Alert severity="info" icon={<ClockIcon />}>
                <AlertTitle>Based on Your Profile</AlertTitle>
                <Typography variant="body2" paragraph>
                  <strong>First Results:</strong> 7-14 days (TransUnion via IDIQ)
                  <br />
                  <strong>Full Round Completion:</strong> 30-45 days (all 3 bureaus)
                  <br />
                  <strong>Projected Score Increase:</strong> +
                  {disputeStrategy?.projectedScoreIncrease || 80}-
                  {disputeStrategy?.projectedScoreIncrease
                    ? disputeStrategy.projectedScoreIncrease + 50
                    : 130}{' '}
                  points in 90 days
                </Typography>
                <Typography variant="body2">
                  <strong>Success Probability:</strong> {disputeStrategy?.successProbability || 85}%
                  (based on similar profiles)
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // ===== SECTION D: RECOMMENDED SERVICE PLAN =====
  // ============================================================================
  const renderRecommendedPlan = () => (
    <AnimatePresence>
      {currentSection >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.05)' : 'rgba(76,175,80,0.02)',
              border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Chip
                icon={<TrophyIcon />}
                label="Recommended For You"
                color="success"
                sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', px: 2, py: 3 }}
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Your Perfect Plan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Based on your {negativeItems.length} negative items and credit goals
              </Typography>
            </Box>

            {/* ===== AI RECOMMENDATION REASONING ===== */}
            <Alert severity="info" icon={<BrainIcon />} sx={{ mb: 4 }}>
              <AlertTitle>Why We Recommend {recommendedPlanData.name}</AlertTitle>
              <Typography variant="body2">
                {recommendedPlan === 'essentials' &&
                  `With ${negativeItems.length} items to address, the Essentials plan gives you the tools and templates to dispute on your own. Perfect if you're comfortable handling the paperwork yourself.`}
                {recommendedPlan === 'professional' &&
                  `With ${negativeItems.length} items across multiple bureaus, the Professional plan provides full-service disputes with dedicated support. We handle everything while you track progress.`}
                {(recommendedPlan === 'vip' || !recommendedPlan) &&
                  `With ${negativeItems.length} items requiring aggressive action, the VIP Concierge plan offers bi-weekly dispute cycles (2x faster), all deletion fees included, and direct access to your account manager. Maximum speed, maximum results.`}
              </Typography>
            </Alert>

            {/* ===== PLAN COMPARISON ===== */}
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Compare All Plans
            </Typography>

            <Grid container spacing={3} alignItems="stretch">
              {servicePlans.map((plan) => (
                <Grid item xs={12} md={4} key={plan.id}>
                  <PlanCard isRecommended={plan.id === recommendedPlan}>
                    {plan.id === recommendedPlan && (
                      <RecommendedBadge>
                        <StarIcon sx={{ fontSize: 16 }} />
                        AI Recommended
                      </RecommendedBadge>
                    )}

                    <CardContent sx={{ p: 3, height: '100%' }}>
                      {/* ===== PLAN HEADER ===== */}
                      <Box sx={{ textAlign: 'center', mb: 3, pt: plan.id === recommendedPlan ? 2 : 0 }}>
                        <Typography variant="overline" color="text.secondary">
                          {plan.highlight}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                          {plan.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
                          <Typography variant="h3" fontWeight={700} color="primary">
                            ${plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /month
                          </Typography>
                        </Box>
                        {plan.setupFee > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            + ${plan.setupFee} setup fee
                          </Typography>
                        )}
                        {plan.perDeletion > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            + ${plan.perDeletion} per deletion/bureau
                          </Typography>
                        )}
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* ===== FEATURES LIST ===== */}
                      <List dense>
                        {plan.features.map((feature, idx) => (
                          <ListItem key={idx} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      {/* ===== MONTHLY SAVINGS ESTIMATE ===== */}
                      {plan.id === recommendedPlan && (
                        <Alert severity="success" sx={{ mt: 2 }} icon={<MoneyIcon />}>
                          <Typography variant="caption" fontWeight={600}>
                            Clients with similar profiles save an average of $
                            {Math.round(estimatedAnnualCost / 12).toLocaleString()}/month in interest
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </PlanCard>
                </Grid>
              ))}
            </Grid>

            {/* ===== SOCIAL PROOF ===== */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Divider sx={{ mb: 3 }} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ maxWidth: 600, mx: 'auto', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <StarIcon key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                        ))}
                      </Box>
                      <Typography variant="body1" fontStyle="italic" gutterBottom>
                        "{testimonials[currentTestimonial].text}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        — {testimonials[currentTestimonial].name}, {testimonials[currentTestimonial].city} •{' '}
                        <strong>{testimonials[currentTestimonial].score}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ⭐ 4.9/5 Stars • 580+ Reviews • A+ BBB Rating • Est. 1995
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // ===== SECTION E: CALL TO ACTION =====
  // ============================================================================
  const renderCallToAction = () => (
    <AnimatePresence>
      {currentSection >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              background: `linear-gradient(145deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            }}
          >
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Ready to Fix Your Credit?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Every month you wait costs you money in higher interest rates. Start your credit repair
              journey today with Speedy Credit Repair.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
              <GlowingButton
                size="large"
                onClick={onContinue}
                endIcon={<ArrowForwardIcon />}
                sx={{ minWidth: 280 }}
              >
                Start My Credit Repair
              </GlowingButton>

              <Button
                variant="outlined"
                size="large"
                onClick={onScheduleCall}
                sx={{
                  borderRadius: 25,
                  px: 4,
                  py: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 280,
                }}
              >
                I Have Questions — Schedule a Call
              </Button>
            </Box>

            <Alert severity="warning" icon={<ClockIcon />} sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
              <Typography variant="body2" fontWeight={600}>
                ⏰ Urgency Note: Every month with these negative items costs you an estimated $
                {Math.round(estimatedAnnualCost / 12).toLocaleString()} in higher interest rates
              </Typography>
            </Alert>

            {/* ===== PRINT/PDF EXPORT ===== */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="text"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ textTransform: 'none' }}
              >
                Print or Save as PDF
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============================================================================
  // ===== MAIN RENDER =====
  // ============================================================================
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {renderCreditSnapshot()}
      {renderNegativeItems()}
      {renderStrategy()}
      {renderRecommendedPlan()}
      {renderCallToAction()}
    </Box>
  );
};

export default AICreditReviewPresentation;
