// Path: /src/components/ServicePlanRecommender.jsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICE PLAN RECOMMENDER - MEGA ENTERPRISE VERSION WITH REAL AI
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * INTELLIGENT SERVICE PLAN MATCHING WITH REAL AI RECOMMENDATIONS
 * 
 * UPDATED: Now calls aiContentGenerator backend for REAL AI-powered recommendations
 * using actual contact data, credit reports, AI call transcripts, and interaction history
 * 
 * NEW INTEGRATIONS (Feb 2026):
 * ✅ SavingsCalculator - Shows financial impact with 5 tabs
 * ✅ ClientPortalPreview - Preview dashboard before signing up
 * 
 * Features:
 * ✅ 6 Service Plans (DIY, Standard, Acceleration, PFD, Hybrid, Premium)
 * ✅ REAL AI-powered plan matching via aiContentGenerator
 * ✅ Fetches actual contact data from Firestore
 * ✅ Considers AI receptionist call transcripts
 * ✅ Considers email/interaction history
 * ✅ Dynamic pricing with promotional offers
 * ✅ Feature comparison matrix
 * ✅ Savings Calculator (5 tabs: Mortgage, Auto, Credit Card, Rental, Employment)
 * ✅ Client Portal Preview
 * ✅ Success probability predictor
 * ✅ Payment plan options
 * ✅ Upsell/downsell intelligence
 * ✅ Real-time plan performance analytics
 * 
 * @version 3.0.0 MEGA ENTERPRISE WITH INTEGRATIONS
 * @date February 2026
 * @author SpeedyCRM Engineering - Christopher
 * 
 * © 1995-2026 Speedy Credit Repair Inc. | All Rights Reserved
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardActions,
  Chip, Stack, Divider, Alert, LinearProgress, Rating, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Collapse, Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Slider, Switch, FormControlLabel,
  Stepper, Step, StepLabel, StepContent, TextField, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Avatar, AvatarGroup,
  Tabs, Tab, Zoom, Fade, Grow, CardHeader, Skeleton
} from '@mui/material';

import {
  Star, CheckCircle, XCircle, Info, TrendingUp, DollarSign,
  Clock, Target, Zap, Shield, Award, Users, HeartHandshake,
  Calculator, ChevronRight, ChevronDown, ArrowLeftRight, Sparkles,
  ThumbsUp, CreditCard, Calendar, Phone, Mail, MessageSquare,
  BarChart3, LineChart, Brain, Rocket, Crown, Gift, AlertCircle,
  FileCheck, BookOpen, Lightbulb, UserCheck, CheckSquare,
  FastForward, Timer, School, Briefcase, Home, Car, GraduationCap,
  TrendingDown, ArrowUpRight, Lock, Unlock, RefreshCw, History,
  AlertTriangle, Wifi, WifiOff, Eye, X, Building2, Banknote, Percent
} from 'lucide-react';

import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { format, addMonths, differenceInDays } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// CHRIS LAHAGE CONTACT INFO (HUMAN TOUCH)
// ═══════════════════════════════════════════════════════════════════════════
const CHRIS_INFO = {
  name: 'Chris Lahage',
  title: 'Credit Expert & Owner',
  phone: '(888) 724-7344',
  experience: '30 Years Credit Repair Experience',
  currentPosition: 'Current Finance Director at one of Toyota\'s top franchises'
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE PLAN DEFINITIONS (Must match backend SERVICE_PLANS_CONFIG)
// ═══════════════════════════════════════════════════════════════════════════

const SERVICE_PLANS = {
  DIY: {
    id: 'diy',
    key: 'DIY',
    name: 'DIY Credit Repair',
    tagline: 'Learn to repair your own credit',
    price: 39,
    originalPrice: 59,
    discount: 33,
    color: '#4CAF50',
    icon: BookOpen,
    recommended: false,
    popular: false,
    bestValue: false,
    features: {
      included: [
        'Dispute letter templates',
        'Educational video library',
        'Credit report analysis guide',
        'Monthly webinars',
        'Email support',
        'Progress tracking tools',
        'Resource library',
        'Community forum access'
      ],
      notIncluded: [
        'Done-for-you disputes',
        'Dedicated account manager',
        'Phone support',
        'Credit monitoring',
        'Legal team access',
        'Expedited processing'
      ]
    },
    results: {
      timeline: '6-12 months',
      successRate: '45%',
      avgPointIncrease: '40-60 points',
      effortRequired: 'High (10+ hours/month)'
    },
    idealFor: [
      'Self-motivated individuals',
      'Those with time to learn',
      'Budget-conscious consumers',
      'Simple credit issues'
    ],
    guarantees: [
      '30-day money back',
      'Lifetime access to materials'
    ],
    paymentOptions: {
      monthly: 39,
      quarterly: 99,
      annual: 399
    }
  },

  STANDARD: {
    id: 'standard',
    key: 'STANDARD',
    name: 'Standard Service',
    tagline: 'Professional credit repair service',
    price: 149,
    originalPrice: 199,
    discount: 25,
    color: '#2196F3',
    icon: FileCheck,
    recommended: false,
    popular: true,
    bestValue: false,
    features: {
      included: [
        'Unlimited disputes',
        'All 3 credit bureaus',
        'Monthly progress reports',
        'Dedicated account manager',
        'Phone & email support',
        'Credit monitoring (1 bureau)',
        'Creditor interventions',
        'Goodwill letters',
        'Debt validation letters',
        'Identity theft assistance'
      ],
      notIncluded: [
        'Expedited processing',
        'Weekly updates',
        'Legal team direct access',
        'Score simulator',
        'Financial planning'
      ]
    },
    results: {
      timeline: '4-6 months',
      successRate: '73%',
      avgPointIncrease: '80-120 points',
      effortRequired: 'Low (30 min/month)'
    },
    idealFor: [
      'Most consumers',
      'Multiple negative items',
      'Busy professionals',
      'First-time repair clients'
    ],
    guarantees: [
      '90-day money back',
      'Pay-per-deletion option',
      'No setup fees'
    ],
    paymentOptions: {
      monthly: 149,
      quarterly: 399,
      semiAnnual: 749
    }
  },

  ACCELERATION: {
    id: 'acceleration',
    key: 'ACCELERATION',
    name: 'Acceleration Plus',
    tagline: 'Fast-track credit restoration',
    price: 199,
    originalPrice: 299,
    discount: 33,
    color: '#FF9800',
    icon: Zap,
    recommended: true,
    popular: false,
    bestValue: true,
    features: {
      included: [
        'Everything in Standard',
        'Expedited dispute processing',
        'Weekly progress updates',
        'All 3 bureau monitoring',
        'Score simulator',
        'Inquiry removal assistance',
        'Cease & desist letters',
        'Priority support queue',
        'Legal team consultations',
        'Credit builder card assistance',
        'Debt settlement guidance',
        'Financial planning tools'
      ],
      notIncluded: [
        'White glove service',
        'Daily updates',
        'Personal credit coach'
      ]
    },
    results: {
      timeline: '2-4 months',
      successRate: '85%',
      avgPointIncrease: '120-180 points',
      effortRequired: 'Minimal (15 min/month)'
    },
    idealFor: [
      'Urgent credit needs',
      'Home buyers',
      'Auto loan seekers',
      'Business loan applicants'
    ],
    guarantees: [
      '120-day money back',
      'Results or refund',
      'Speed guarantee'
    ],
    paymentOptions: {
      monthly: 199,
      quarterly: 549,
      semiAnnual: 999
    }
  },

  PFD: {
    id: 'pfd',
    key: 'PFD',
    name: 'Pay-for-Deletion',
    tagline: 'Risk-free, pay only for results',
    price: 0,
    setupFee: 199,
    perDeletion: 75,
    originalPrice: null,
    discount: 0,
    color: '#9C27B0',
    icon: Target,
    recommended: false,
    popular: false,
    bestValue: false,
    features: {
      included: [
        'Pay ONLY for results',
        '$199 setup + $75 per deletion',
        'All 3 credit bureaus',
        'Monthly progress reports',
        'Account manager support',
        'Email & chat support',
        'Basic monitoring included',
        'Creditor interventions',
        'Debt validation letters'
      ],
      notIncluded: [
        'Expedited processing',
        'Weekly updates',
        'Phone support (email only)',
        'Score simulator',
        'Legal team access'
      ]
    },
    results: {
      timeline: '4-8 months',
      successRate: '68%',
      avgPointIncrease: '60-100 points',
      effortRequired: 'Low'
    },
    idealFor: [
      'Risk-averse clients',
      'Those unsure about service',
      'Budget flexibility',
      'Few negative items'
    ],
    guarantees: [
      'No deletion = no charge',
      '100% results-based',
      'Setup fee refundable'
    ],
    paymentOptions: {
      setup: 199,
      perDeletion: 75
    }
  },

  HYBRID: {
    id: 'hybrid',
    key: 'HYBRID',
    name: 'AI Hybrid Plan',
    tagline: 'AI-powered + human expertise',
    price: 99,
    originalPrice: 149,
    discount: 33,
    color: '#00BCD4',
    icon: Brain,
    recommended: false,
    popular: false,
    bestValue: false,
    features: {
      included: [
        'AI-powered dispute analysis',
        'Automated letter generation',
        'All 3 credit bureaus',
        'Weekly AI insights',
        'Email support',
        'Chat support (AI + Human)',
        'Progress tracking dashboard',
        'Smart recommendations',
        'Automated follow-ups',
        'Document scanning AI'
      ],
      notIncluded: [
        'Dedicated human manager',
        'Phone support',
        'Expedited processing',
        'Legal team access',
        'Score simulator'
      ]
    },
    results: {
      timeline: '3-5 months',
      successRate: '72%',
      avgPointIncrease: '70-100 points',
      effortRequired: 'Low (automated)'
    },
    idealFor: [
      'Tech-savvy clients',
      'Budget-conscious',
      'Self-directed individuals',
      'Moderate credit issues'
    ],
    guarantees: [
      '60-day money back',
      'AI accuracy guarantee',
      'Human escalation available'
    ],
    paymentOptions: {
      monthly: 99,
      quarterly: 269,
      semiAnnual: 499
    }
  },

  PREMIUM: {
    id: 'premium',
    key: 'PREMIUM',
    name: 'Premium White Glove',
    tagline: 'VIP concierge credit repair',
    price: 349,
    originalPrice: 499,
    discount: 30,
    color: '#F44336',
    icon: Crown,
    recommended: false,
    popular: false,
    bestValue: false,
    features: {
      included: [
        'Everything in Acceleration',
        'Dedicated VIP manager',
        'Daily progress updates',
        'Direct legal team access',
        'Personal credit coach',
        'Financial planning sessions',
        'Identity monitoring (all 3)',
        'Credit builder program',
        'Debt negotiation service',
        'Spouse included FREE',
        'Priority processing',
        '24/7 support access',
        'Success guarantee'
      ],
      notIncluded: []
    },
    results: {
      timeline: '1-3 months',
      successRate: '92%',
      avgPointIncrease: '150-220 points',
      effortRequired: 'None (we handle everything)'
    },
    idealFor: [
      'Complex credit situations',
      'High-net-worth individuals',
      'Business owners',
      'Those needing fastest results'
    ],
    guarantees: [
      '180-day money back',
      'Results guaranteed',
      'Or work for free',
      'Lifetime support'
    ],
    paymentOptions: {
      monthly: 349,
      quarterly: 949,
      semiAnnual: 1799,
      annual: 3299
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SAVINGS CALCULATOR COMPONENT (INTEGRATED)
// ═══════════════════════════════════════════════════════════════════════════
const SavingsCalculatorDialog = ({ open, onClose, currentScore, projectedIncrease }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentScoreValue, setCurrentScoreValue] = useState(currentScore || 580);
  const [targetScoreValue, setTargetScoreValue] = useState(Math.min((currentScore || 580) + (projectedIncrease || 100), 800));

  // ===== UPDATE WHEN PROPS CHANGE =====
  useEffect(() => {
    if (currentScore) setCurrentScoreValue(currentScore);
    if (currentScore && projectedIncrease) {
      setTargetScoreValue(Math.min(currentScore + projectedIncrease, 800));
    }
  }, [currentScore, projectedIncrease]);

  // ===== INTEREST RATE TABLES =====
  const getMortgageRate = (score) => {
    if (score >= 760) return 6.5;
    if (score >= 700) return 6.875;
    if (score >= 680) return 7.25;
    if (score >= 660) return 7.625;
    if (score >= 620) return 8.125;
    return 9.5;
  };

  const getAutoRate = (score) => {
    if (score >= 720) return 5.5;
    if (score >= 680) return 7.5;
    if (score >= 640) return 10.5;
    if (score >= 600) return 15.0;
    return 20.0;
  };

  const getCreditCardRate = (score) => {
    if (score >= 720) return 16.99;
    if (score >= 680) return 21.99;
    if (score >= 640) return 24.99;
    return 29.99;
  };

  // ===== CALCULATE SAVINGS =====
  const calculateMortgageSavings = () => {
    const loanAmount = 400000;
    const years = 30;
    const currentRate = getMortgageRate(currentScoreValue);
    const targetRate = getMortgageRate(targetScoreValue);
    
    const calcPayment = (principal, rate, yrs) => {
      const monthlyRate = rate / 100 / 12;
      const n = yrs * 12;
      return principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    };

    const currentPayment = calcPayment(loanAmount, currentRate, years);
    const targetPayment = calcPayment(loanAmount, targetRate, years);
    const monthlySavings = currentPayment - targetPayment;
    const totalSavings = monthlySavings * years * 12;

    return { currentRate, targetRate, monthlySavings, totalSavings, loanAmount };
  };

  const calculateAutoSavings = () => {
    const loanAmount = 35000;
    const years = 5;
    const currentRate = getAutoRate(currentScoreValue);
    const targetRate = getAutoRate(targetScoreValue);
    
    const calcInterest = (principal, rate, yrs) => {
      const monthlyRate = rate / 100 / 12;
      const n = yrs * 12;
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      return (payment * n) - principal;
    };

    const currentInterest = calcInterest(loanAmount, currentRate, years);
    const targetInterest = calcInterest(loanAmount, targetRate, years);
    const totalSavings = currentInterest - targetInterest;

    return { currentRate, targetRate, totalSavings, loanAmount };
  };

  const calculateCreditCardSavings = () => {
    const balance = 8000;
    const years = 3;
    const currentRate = getCreditCardRate(currentScoreValue);
    const targetRate = getCreditCardRate(targetScoreValue);
    
    const currentInterest = balance * (currentRate / 100) * years;
    const targetInterest = balance * (targetRate / 100) * years;
    const totalSavings = currentInterest - targetInterest;

    return { currentRate, targetRate, totalSavings, balance };
  };

  const calculateRentalSavings = () => {
    // Security deposits often reduced with good credit
    const monthlyRent = 2000;
    const currentDeposit = currentScoreValue < 650 ? monthlyRent * 3 : currentScoreValue < 700 ? monthlyRent * 2 : monthlyRent;
    const targetDeposit = targetScoreValue < 650 ? monthlyRent * 3 : targetScoreValue < 700 ? monthlyRent * 2 : monthlyRent;
    const depositSavings = currentDeposit - targetDeposit;

    // Better rental options = lower rent
    const rentPremium = currentScoreValue < 650 ? 200 : currentScoreValue < 700 ? 100 : 0;
    const targetPremium = targetScoreValue < 650 ? 200 : targetScoreValue < 700 ? 100 : 0;
    const monthlyRentSavings = rentPremium - targetPremium;

    return { depositSavings, monthlyRentSavings, yearlyRentSavings: monthlyRentSavings * 12 };
  };

  const calculateEmploymentImpact = () => {
    // Some employers check credit for certain positions
    const potentialSalaryIncrease = currentScoreValue < 650 ? 5000 : currentScoreValue < 700 ? 2500 : 0;
    const targetIncrease = targetScoreValue < 650 ? 5000 : targetScoreValue < 700 ? 2500 : 0;
    const improvement = potentialSalaryIncrease - targetIncrease;

    return { improvement, note: 'Access to better positions requiring credit checks' };
  };

  // ===== CALCULATE TOTALS =====
  const mortgage = calculateMortgageSavings();
  const auto = calculateAutoSavings();
  const creditCard = calculateCreditCardSavings();
  const rental = calculateRentalSavings();
  const employment = calculateEmploymentImpact();

  const totalLifetimeSavings = Math.round(
    mortgage.totalSavings + auto.totalSavings + creditCard.totalSavings + 
    (rental.yearlyRentSavings * 5) + (employment.improvement * 10)
  );

  const tabs = [
    { label: 'Mortgage', icon: Home, color: '#3B82F6' },
    { label: 'Auto Loan', icon: Car, color: '#10B981' },
    { label: 'Credit Cards', icon: CreditCard, color: '#F59E0B' },
    { label: 'Rentals', icon: Building2, color: '#8B5CF6' },
    { label: 'Employment', icon: Briefcase, color: '#EF4444' }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Calculator size={28} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>See How Much You Could Save</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>Calculate your potential savings with better credit</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* ===== SCORE SLIDERS ===== */}
        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Current Credit Score: <span style={{ color: '#EF4444' }}>{currentScoreValue}</span>
              </Typography>
              <Slider
                value={currentScoreValue}
                onChange={(e, val) => setCurrentScoreValue(val)}
                min={300}
                max={850}
                step={10}
                marks={[
                  { value: 300, label: '300' },
                  { value: 580, label: '580' },
                  { value: 670, label: '670' },
                  { value: 740, label: '740' },
                  { value: 850, label: '850' }
                ]}
                sx={{ color: '#EF4444' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Target Credit Score: <span style={{ color: '#10B981' }}>{targetScoreValue}</span>
              </Typography>
              <Slider
                value={targetScoreValue}
                onChange={(e, val) => setTargetScoreValue(val)}
                min={300}
                max={850}
                step={10}
                marks={[
                  { value: 300, label: '300' },
                  { value: 580, label: '580' },
                  { value: 670, label: '670' },
                  { value: 740, label: '740' },
                  { value: 850, label: '850' }
                ]}
                sx={{ color: '#10B981' }}
              />
            </Grid>
          </Grid>

          {/* ===== TOTAL SAVINGS DISPLAY ===== */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: '#D1FAE5', 
            borderRadius: 2, 
            textAlign: 'center',
            border: '2px solid #10B981'
          }}>
            <Typography variant="body2" color="text.secondary">
              Total Estimated Lifetime Savings
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#059669' }}>
              ${totalLifetimeSavings.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Based on improving from {currentScoreValue} to {targetScoreValue} (+{targetScoreValue - currentScoreValue} points)
            </Typography>
          </Box>
        </Box>

        {/* ===== CATEGORY TABS ===== */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ borderBottom: '1px solid #E5E7EB' }}
        >
          {tabs.map((tab, idx) => (
            <Tab
              key={idx}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <tab.icon size={18} color={tab.color} />
                  <span>{tab.label}</span>
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* ===== TAB CONTENT ===== */}
        <Box sx={{ p: 3 }}>
          {/* MORTGAGE TAB */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home size={24} color="#3B82F6" /> Mortgage Savings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Based on a ${mortgage.loanAmount.toLocaleString()} 30-year fixed mortgage
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FEE2E2', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Current Rate</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#DC2626' }}>
                      {mortgage.currentRate}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#D1FAE5', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">New Rate</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {mortgage.targetRate}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Typography variant="body1">
                  Monthly Savings: <strong style={{ color: '#059669' }}>${Math.round(mortgage.monthlySavings).toLocaleString()}</strong>
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#059669', mt: 1 }}>
                  Lifetime Savings: ${Math.round(mortgage.totalSavings).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* AUTO LOAN TAB */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Car size={24} color="#10B981" /> Auto Loan Savings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Based on a ${auto.loanAmount.toLocaleString()} 5-year auto loan
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FEE2E2', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Current APR</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#DC2626' }}>
                      {auto.currentRate}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#D1FAE5', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">New APR</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {auto.targetRate}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  Total Interest Savings: ${Math.round(auto.totalSavings).toLocaleString()}
                </Typography>
              </Box>

              {/* PRO TIP FROM CHRIS */}
              <Alert severity="info" icon={<Lightbulb size={20} />} sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Pro Tip from Chris:</strong> As a current Finance Director at one of Toyota's top franchises, 
                  I see this every day. Even a 50-point improvement can save you thousands on your next vehicle!
                </Typography>
              </Alert>
            </Box>
          )}

          {/* CREDIT CARD TAB */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard size={24} color="#F59E0B" /> Credit Card Savings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Based on ${creditCard.balance.toLocaleString()} average balance over 3 years
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FEE2E2', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Current APR</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#DC2626' }}>
                      {creditCard.currentRate}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#D1FAE5', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">New APR</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                      {creditCard.targetRate}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  Interest Savings: ${Math.round(creditCard.totalSavings).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* RENTALS TAB */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Building2 size={24} color="#8B5CF6" /> Rental Savings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Better credit = lower deposits and better rental options
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Security Deposit Savings</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                      ${rental.depositSavings.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Monthly Rent Savings</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                      ${rental.monthlyRentSavings}/mo
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F3FF', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7C3AED' }}>
                  Annual Rent Savings: ${rental.yearlyRentSavings.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* EMPLOYMENT TAB */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={24} color="#EF4444" /> Employment Impact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Many employers check credit for management and financial positions
              </Typography>
              
              <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#FEF2F2' }}>
                <Typography variant="caption" color="text.secondary">Potential Salary Impact</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#DC2626' }}>
                  +${employment.improvement.toLocaleString()}/year
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {employment.note}
                </Typography>
              </Paper>

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Poor credit can disqualify you from certain positions, especially in finance, 
                  government, and management roles that require credit checks.
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={onClose}
          startIcon={<Rocket size={18} />}
        >
          Start Saving Today
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT PORTAL PREVIEW DIALOG
// ═══════════════════════════════════════════════════════════════════════════
const ClientPortalPreviewDialog = ({ open, onClose, contactData, creditScore }) => {
  const score = creditScore || contactData?.creditScore || 580;
  const targetScore = Math.min(score + 100, 780);
  const improvement = targetScore - score;

  const getScoreColor = (s) => {
    if (s >= 740) return '#10B981';
    if (s >= 670) return '#3B82F6';
    if (s >= 580) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Eye size={28} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Preview Your Client Dashboard</Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              See what your personalized portal will look like
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#F8FAFC' }}>
        {/* ===== MOCK DASHBOARD PREVIEW ===== */}
        <Box sx={{ p: 3 }}>
          {/* Welcome Header */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome, {contactData?.firstName || 'Client'}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your credit improvement journey starts here. We're here to help every step of the way.
            </Typography>
          </Paper>

          {/* Score Preview */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Your Current Score
                </Typography>
                <Typography 
                  variant="h2" 
                  sx={{ fontWeight: 'bold', color: getScoreColor(score) }}
                >
                  {score}
                </Typography>
                <Chip 
                  label={score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Needs Work'} 
                  size="small"
                  sx={{ mt: 1, bgcolor: getScoreColor(score), color: 'white' }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#D1FAE5' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Your Target Score
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#059669' }}>
                  {targetScore}
                </Typography>
                <Chip 
                  icon={<TrendingUp size={14} />}
                  label={`+${improvement} points`} 
                  size="small"
                  sx={{ mt: 1, bgcolor: '#059669', color: 'white' }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: '#FEF3C7' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Estimated Timeline
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#D97706' }}>
                  3-4
                </Typography>
                <Typography variant="body2" color="text.secondary">months</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Progress Timeline Preview */}
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rocket size={24} /> Your Journey Progress
            </Typography>
            
            <Stepper activeStep={0} orientation="vertical">
              <Step completed>
                <StepLabel>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Enrollment Complete</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Welcome to Speedy Credit Repair! 🎉
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>
                  <Typography variant="subtitle2">Credit Report Analysis</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Chris personally reviews your credit report
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>
                  <Typography variant="subtitle2">First Disputes Filed</Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <Typography variant="subtitle2">Results & Score Improvement</Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Paper>

          {/* Features Preview */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[
              { icon: BarChart3, label: 'Score Tracking', desc: 'Watch your score improve' },
              { icon: Shield, label: 'Dispute Status', desc: 'Real-time updates' },
              { icon: FileCheck, label: 'Documents', desc: 'Secure upload center' },
              { icon: MessageSquare, label: 'Direct Support', desc: 'Chat with our team' }
            ].map((feature, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.light', color: 'primary.main' }}>
                    <feature.icon size={20} />
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {feature.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB', bgcolor: '#F8FAFC' }}>
        <Button onClick={onClose}>Close Preview</Button>
        <Button 
          variant="contained" 
          onClick={onClose}
          startIcon={<CheckCircle size={18} />}
        >
          Become a Client
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ServicePlanRecommender = ({ 
  contactId = null,
  contactData: initialContactData = {}, 
  leadScore: initialLeadScore = 5,
  onPlanSelected,
  onWorkflowAdvance,
  allowComparison = true,
  showCalculator = true,
  embedded = false 
}) => {
  // ═════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════
  
  const [selectedPlans, setSelectedPlans] = useState(['STANDARD']);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [includeSpouse, setIncludeSpouse] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  
  // ===== NEW: DIALOG STATES FOR INTEGRATIONS =====
  const [savingsCalculatorOpen, setSavingsCalculatorOpen] = useState(false);
  const [portalPreviewOpen, setPortalPreviewOpen] = useState(false);
  
  // AI Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [contactSummary, setContactSummary] = useState(null);
  const [dataSourcesUsed, setDataSourcesUsed] = useState({});
  
  // Loading/Error States
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Dynamic pricing and predictions
  const [pricing, setPricing] = useState({});
  const [successPredictions, setSuccessPredictions] = useState({});
  
  // Contact data (can be passed in or fetched)
  const [contactData, setContactData] = useState(initialContactData);
  const [leadScore, setLeadScore] = useState(initialLeadScore);
  
  // ═════════════════════════════════════════════════════════════════════════
  // FETCH AI RECOMMENDATION FROM BACKEND
  // ═════════════════════════════════════════════════════════════════════════
  
  const fetchAIRecommendation = useCallback(async () => {
    if (!contactId) {
      console.warn('⚠️ No contactId provided, using local recommendation');
      setLoading(false);
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    console.log('🤖 Fetching AI recommendation for contact:', contactId);
    
    try {
      // Call the enhanced aiContentGenerator function
      const aiContentGenerator = httpsCallable(functions, 'aiContentGenerator');
      
      const result = await aiContentGenerator({
        type: 'recommendServicePlan',
        contactId: contactId
      });
      
      console.log('✅ AI Recommendation received:', result.data);
      
      if (result.data?.success) {
        const { recommendation, contactSummary: summary, dataSourcesUsed: sources } = result.data;
        
        // Store the AI recommendation
        setAiRecommendation(recommendation);
        setContactSummary(summary);
        setDataSourcesUsed(sources || {});
        
        // Update contact data from response
        if (summary) {
          setContactData(prev => ({
            ...prev,
            creditScore: summary.creditScore,
            negativeItemCount: summary.negativeItemCount,
            inquiryCount: summary.inquiryCount
          }));
          setLeadScore(summary.leadScore || initialLeadScore);
        }
        
        // Set the recommended plan as selected
        if (recommendation?.recommendedPlan && SERVICE_PLANS[recommendation.recommendedPlan]) {
          setSelectedPlans([recommendation.recommendedPlan]);
          
          // Mark the recommended plan
          Object.keys(SERVICE_PLANS).forEach(key => {
            SERVICE_PLANS[key].recommended = (key === recommendation.recommendedPlan);
          });
        }
        
        console.log(`🎯 AI Recommends: ${recommendation.recommendedPlan} (${recommendation.confidence} confidence)`);
        
      } else {
        throw new Error(result.data?.error || 'Failed to get recommendation');
      }
      
    } catch (err) {
      console.error('❌ AI recommendation error:', err);
      setError(err.message || 'Failed to analyze credit profile');
      
      // Fall back to local recommendation
      console.log('⚠️ Falling back to local recommendation engine');
      generateLocalRecommendation();
      
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  }, [contactId, initialLeadScore]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // LOCAL FALLBACK RECOMMENDATION (when AI fails)
  // ═════════════════════════════════════════════════════════════════════════
  
  const generateLocalRecommendation = useCallback(() => {
    console.log('📊 Generating local recommendation...');
    
    const score = contactData.creditScore || contactData.idiqEnrollment?.creditScore;
    const negativeItems = contactData.negativeItemCount || contactData.idiqEnrollment?.negativeItemCount || 0;
    const currentLeadScore = leadScore;
    
    let recommendedPlan = 'STANDARD';
    let confidence = 'medium';
    let reason = 'Based on typical credit repair needs';
    
    // Rule-based logic
    if (score && score < 500 && negativeItems > 10) {
      recommendedPlan = 'PREMIUM';
      confidence = 'high';
      reason = 'Complex credit situation requires comprehensive support';
    } else if (contactData.primaryGoal === 'buyingHome' || contactData.timeline === 'immediate') {
      recommendedPlan = 'ACCELERATION';
      confidence = 'high';
      reason = 'Urgent timeline requires expedited service';
    } else if (currentLeadScore >= 8) {
      recommendedPlan = 'ACCELERATION';
      confidence = 'medium';
      reason = 'High engagement suggests readiness for premium service';
    } else if (currentLeadScore <= 3 || negativeItems <= 3) {
      recommendedPlan = 'PFD';
      confidence = 'medium';
      reason = 'Pay-for-delete offers risk-free results-based pricing';
    } else if (contactData.budget === 'low') {
      recommendedPlan = 'HYBRID';
      confidence = 'medium';
      reason = 'Budget-friendly AI-powered solution';
    }
    
    const plan = SERVICE_PLANS[recommendedPlan];
    
    setAiRecommendation({
      recommendedPlan,
      confidence,
      monthlyPrice: plan.price,
      reasoning: {
        primary: reason,
        creditFactors: `Score: ${score || 'Unknown'}, Negative Items: ${negativeItems}`,
        behavioralFactors: 'Based on available profile data',
        urgencyAssessment: contactData.timeline || 'Standard timeline'
      },
      alternativePlan: {
        plan: 'STANDARD',
        reason: 'Solid choice for most credit repair needs'
      },
      personalizedPitch: `Based on your credit profile, the ${plan.name} plan offers the best balance of results and value for your situation.`,
      expectedResults: {
        timeline: plan.results.timeline,
        pointIncrease: plan.results.avgPointIncrease,
        keyMilestones: ['Initial disputes submitted', 'First deletions received', 'Score improvement verified']
      },
      planDetails: plan,
      fallbackUsed: true
    });
    
    setSelectedPlans([recommendedPlan]);
    
    // Mark recommended
    Object.keys(SERVICE_PLANS).forEach(key => {
      SERVICE_PLANS[key].recommended = (key === recommendedPlan);
    });
    
    setContactSummary({
      name: `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim() || 'Prospect',
      creditScore: score,
      negativeItemCount: negativeItems,
      leadScore: currentLeadScore
    });
    
    setDataSourcesUsed({
      contactData: true,
      idiqEnrollment: !!contactData.idiqEnrollment,
      aiCalls: false,
      emailHistory: false
    });
    
  }, [contactData, leadScore]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    console.log('🔄 ServicePlanRecommender initializing...', { contactId, hasInitialData: !!initialContactData.firstName });
    
    // If we have a contactId, fetch AI recommendation
    if (contactId) {
      fetchAIRecommendation();
    } else {
      // Use local recommendation with provided data
      generateLocalRecommendation();
      setLoading(false);
    }
    
    // Calculate pricing for all plans
    initializePricing();
    
  }, [contactId, fetchAIRecommendation]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // PRICING CALCULATIONS
  // ═════════════════════════════════════════════════════════════════════════
  
  const initializePricing = useCallback(() => {
    const pricingData = {};
    const successData = {};
    
    Object.keys(SERVICE_PLANS).forEach(planKey => {
      const plan = SERVICE_PLANS[planKey];
      
      // Calculate dynamic pricing
      let price = plan.price;
      let discounts = [];
      
      // Time-based promotions
      const hour = new Date().getHours();
      if (hour >= 9 && hour <= 11) {
        discounts.push({ name: 'Morning Special', amount: price * 0.1 });
      }
      
      // Lead score discount
      if (leadScore >= 7) {
        discounts.push({ name: 'Priority Client', amount: price * 0.1 });
      }
      
      const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);
      const finalPrice = Math.max(price - totalDiscounts, price * 0.7);
      
      pricingData[planKey] = {
        originalPrice: plan.originalPrice || price,
        currentPrice: price,
        discounts,
        finalPrice: Math.round(finalPrice),
        savings: Math.round(totalDiscounts)
      };
      
      // Calculate success probability
      let probability = parseFloat(plan.results.successRate) || 70;
      if (contactData.creditScore > 600) probability *= 1.1;
      if (contactData.negativeItemCount < 5) probability *= 1.1;
      
      successData[planKey] = {
        probability: Math.min(95, Math.round(probability)),
        factors: []
      };
    });
    
    setPricing(pricingData);
    setSuccessPredictions(successData);
  }, [leadScore, contactData]);
  
  // ═════════════════════════════════════════════════════════════════════════
  // PLAN SELECTION HANDLER
  // ═════════════════════════════════════════════════════════════════════════
  
  const handlePlanSelect = async (planKey) => {
    console.log('📋 Plan selected:', planKey);
    
    if (comparisonMode) {
      // Handle comparison mode selection
      setSelectedPlans(prev => {
        if (prev.includes(planKey)) {
          return prev.filter(p => p !== planKey);
        }
        if (prev.length >= 3) {
          return [...prev.slice(1), planKey];
        }
        return [...prev, planKey];
      });
    } else {
      // Single selection mode
      setSelectedPlans([planKey]);
      
      const plan = SERVICE_PLANS[planKey];
      const planPricing = pricing[planKey] || {};
      
      // Notify parent component
      if (onPlanSelected) {
        onPlanSelected({
          plan,
          planKey,
          pricing: planPricing,
          aiRecommendation,
          prediction: successPredictions[planKey]
        });
      }
    }
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // PROCEED TO CONTRACT (Workflow Advancement)
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleProceedToContract = async () => {
    if (!contactId || selectedPlans.length === 0) {
      console.error('❌ Cannot proceed: missing contactId or selected plan');
      return;
    }
    
    const selectedPlanKey = selectedPlans[0];
    const selectedPlan = SERVICE_PLANS[selectedPlanKey];
    
    console.log('📝 Proceeding to contract with plan:', selectedPlanKey);
    
    try {
      // Update contact with selected plan
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, {
        selectedPlan: selectedPlanKey,
        selectedPlanName: selectedPlan.name,
        selectedPlanPrice: selectedPlan.price,
        planSelectedAt: serverTimestamp(),
        workflowStage: 'contract_generation',
        workflowLastUpdate: serverTimestamp(),
        // Store AI recommendation data for reference
        aiRecommendation: aiRecommendation ? {
          recommendedPlan: aiRecommendation.recommendedPlan,
          confidence: aiRecommendation.confidence,
          reasoning: aiRecommendation.reasoning?.primary,
          timestamp: new Date().toISOString()
        } : null
      });
      
      console.log('✅ Contact updated with selected plan');
      
      // Notify parent to advance workflow
      if (onWorkflowAdvance) {
        onWorkflowAdvance({
          nextStage: 'contract_generation',
          selectedPlan: selectedPlanKey,
          planDetails: selectedPlan,
          contactId
        });
      }
      
    } catch (err) {
      console.error('❌ Error updating contact:', err);
      setError('Failed to save plan selection. Please try again.');
    }
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RETRY HANDLER
  // ═════════════════════════════════════════════════════════════════════════
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    fetchAIRecommendation();
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // GET PROJECTED SCORE INCREASE
  // ═════════════════════════════════════════════════════════════════════════
  
  const getProjectedIncrease = () => {
    if (aiRecommendation?.expectedResults?.pointIncrease) {
      const match = aiRecommendation.expectedResults.pointIncrease.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }
    const selectedPlan = SERVICE_PLANS[selectedPlans[0]];
    if (selectedPlan?.results?.avgPointIncrease) {
      const match = selectedPlan.results.avgPointIncrease.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }
    return 100;
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER AI RECOMMENDATION CARD
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderAIRecommendationCard = () => {
    if (!aiRecommendation) return null;
    
    const plan = SERVICE_PLANS[aiRecommendation.recommendedPlan];
    if (!plan) return null;
    
    return (
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <Brain size={28} />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                AI Recommendation
              </Typography>
              <Chip
                label={`${aiRecommendation.confidence?.toUpperCase()} CONFIDENCE`}
                size="small"
                sx={{ 
                  bgcolor: aiRecommendation.confidence === 'high' ? 'success.main' : 
                           aiRecommendation.confidence === 'medium' ? 'warning.main' : 'grey.500',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              {aiRecommendation.fallbackUsed && (
                <Tooltip title="AI service unavailable - using rule-based recommendation">
                  <Chip
                    icon={<WifiOff size={14} />}
                    label="Offline"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Tooltip>
              )}
            </Stack>
            
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              {plan.name} - ${plan.price}/month
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              {aiRecommendation.personalizedPitch || aiRecommendation.reasoning?.primary}
            </Typography>
            
            {/* Data Sources Used */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {dataSourcesUsed.contactData && (
                <Chip icon={<UserCheck size={14} />} label="Profile Data" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {dataSourcesUsed.idiqEnrollment && (
                <Chip icon={<FileCheck size={14} />} label="Credit Report" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {dataSourcesUsed.aiCalls && (
                <Chip icon={<Phone size={14} />} label="Call Transcripts" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
              {dataSourcesUsed.emailHistory && (
                <Chip icon={<Mail size={14} />} label="Email History" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              )}
            </Stack>
            
            {/* Expected Results */}
            {aiRecommendation.expectedResults && (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Timeline</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {aiRecommendation.expectedResults.timeline}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Expected Improvement</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {aiRecommendation.expectedResults.pointIncrease}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>Success Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {plan.results.successRate}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>
        </Stack>
      </Paper>
    );
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER CONTACT SUMMARY
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderContactSummary = () => {
    if (!contactSummary) return null;
    
    return (
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary">Prospect</Typography>
            <Typography variant="body1" fontWeight="bold">{contactSummary.name}</Typography>
          </Box>
          
          {contactSummary.creditScore && (
            <Box>
              <Typography variant="caption" color="text.secondary">Credit Score</Typography>
              <Typography 
                variant="body1" 
                fontWeight="bold"
                color={
                  contactSummary.creditScore >= 700 ? 'success.main' :
                  contactSummary.creditScore >= 600 ? 'warning.main' : 'error.main'
                }
              >
                {contactSummary.creditScore} ({contactSummary.scoreRange || 'Unknown'})
              </Typography>
            </Box>
          )}
          
          <Box>
            <Typography variant="caption" color="text.secondary">Negative Items</Typography>
            <Typography variant="body1" fontWeight="bold" color="error.main">
              {contactSummary.negativeItemCount || 0}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary">Lead Score</Typography>
            <Typography variant="body1" fontWeight="bold">
              {contactSummary.leadScore || 'N/A'}/10
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER PLAN CARD
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderPlanCard = (planKey) => {
    const plan = SERVICE_PLANS[planKey];
    const planPricing = pricing[planKey] || {};
    const isSelected = selectedPlans.includes(planKey);
    const isRecommended = plan.recommended;
    const Icon = plan.icon;
    
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: isSelected ? '3px solid' : '1px solid',
          borderColor: isSelected ? plan.color : 'divider',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 4
          }
        }}
      >
        {/* Badges */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            top: -12,
            left: 8,
            right: 8,
            justifyContent: 'center'
          }}
        >
          {isRecommended && (
            <Chip
              icon={<Sparkles size={14} />}
              label="AI RECOMMENDED"
              size="small"
              sx={{
                bgcolor: plan.color,
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
          {plan.bestValue && (
            <Chip
              icon={<Award size={14} />}
              label="BEST VALUE"
              size="small"
              sx={{
                bgcolor: '#F59E0B',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
          {plan.popular && (
            <Chip
              icon={<Star size={14} />}
              label="MOST POPULAR"
              size="small"
              sx={{
                bgcolor: '#6366F1',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Stack>
        
        <CardContent sx={{ flex: 1, pt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: plan.color, mr: 2 }}>
              <Icon size={24} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {plan.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {plan.tagline}
              </Typography>
            </Box>
          </Box>
          
          {/* Pricing */}
          <Box sx={{ mb: 3 }}>
            {plan.price > 0 ? (
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h4" fontWeight="bold" color={plan.color}>
                  ${plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /month
                </Typography>
                {plan.discount > 0 && (
                  <Chip
                    label={`${plan.discount}% OFF`}
                    size="small"
                    sx={{ bgcolor: '#D1FAE5', color: '#059669' }}
                  />
                )}
              </Stack>
            ) : (
              <Stack>
                <Typography variant="h4" fontWeight="bold" color={plan.color}>
                  $0/mo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ${plan.setupFee} setup + ${plan.perDeletion}/deletion
                </Typography>
              </Stack>
            )}
          </Box>
          
          {/* Features List */}
          <Divider sx={{ my: 2 }} />
          <List dense>
            {plan.features.included.slice(0, 6).map((feature, idx) => (
              <ListItem key={idx} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircle size={16} style={{ color: '#10B981' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={feature} 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          
          {/* Results Preview */}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">Expected Results</Typography>
            <Typography variant="body2" fontWeight="medium">
              {plan.results.avgPointIncrease} in {plan.results.timeline}
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant={isSelected ? 'contained' : 'outlined'}
            color={isSelected ? 'primary' : 'inherit'}
            onClick={() => handlePlanSelect(planKey)}
            sx={{ 
              bgcolor: isSelected ? plan.color : 'transparent',
              borderColor: plan.color,
              color: isSelected ? 'white' : plan.color,
              '&:hover': {
                bgcolor: isSelected ? plan.color : `${plan.color}10`
              }
            }}
          >
            {isSelected ? 'Selected' : 'Select Plan'}
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // RENDER COMPARISON TABLE
  // ═════════════════════════════════════════════════════════════════════════
  
  const renderComparisonTable = () => {
    const features = [
      'Unlimited Disputes',
      'All 3 Credit Bureaus',
      'Dedicated Manager',
      'Phone Support',
      'Email Support',
      'Credit Monitoring',
      'Score Simulator',
      'Legal Team Access',
      'Expedited Processing',
      'Weekly Updates',
      'Identity Protection',
      'Financial Planning',
      'Spouse Included',
      'Success Guarantee'
    ];
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Features</TableCell>
              {selectedPlans.map(planKey => (
                <TableCell key={planKey} align="center">
                  <Typography fontWeight="bold">
                    {SERVICE_PLANS[planKey].name}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map(feature => (
              <TableRow key={feature}>
                <TableCell>{feature}</TableCell>
                {selectedPlans.map(planKey => {
                  const plan = SERVICE_PLANS[planKey];
                  const hasFeature = plan.features.included.some(f => 
                    f.toLowerCase().includes(feature.toLowerCase())
                  );
                  return (
                    <TableCell key={planKey} align="center">
                      {hasFeature ? (
                        <CheckCircle size={20} style={{ color: plan.color }} />
                      ) : (
                        <XCircle size={20} style={{ color: '#ccc' }} />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  // ═════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  if (loading || analyzing) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          {analyzing ? 'Analyzing Your Credit Profile...' : 'Loading...'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {analyzing ? 'Our AI is reviewing your credit data, call transcripts, and interaction history to find the perfect plan for you.' : 'Please wait...'}
        </Typography>
        
        {analyzing && (
          <Stack spacing={1} sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
            <Skeleton variant="rounded" height={20} animation="wave" />
            <Skeleton variant="rounded" height={20} width="80%" animation="wave" />
            <Skeleton variant="rounded" height={20} width="60%" animation="wave" />
          </Stack>
        )}
      </Box>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // ERROR STATE
  // ═════════════════════════════════════════════════════════════════════════
  
  if (error && !aiRecommendation) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <AlertTriangle size={60} style={{ color: '#f44336', marginBottom: 16 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Unable to Generate Recommendation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={handleRetry} startIcon={<RefreshCw size={18} />}>
          Try Again
        </Button>
      </Box>
    );
  }
  
  // ═════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════════════
  
  return (
    <Box sx={{ p: embedded ? 0 : 3 }}>
      {/* Header */}
      {!embedded && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Choose Your Credit Repair Plan
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {aiRecommendation 
              ? `Based on your profile, we recommend the ${SERVICE_PLANS[aiRecommendation.recommendedPlan]?.name || 'Standard Service'} plan`
              : 'Select the plan that best fits your needs'
            }
          </Typography>
        </Box>
      )}
      
      {/* Error Alert (non-blocking) */}
      {error && aiRecommendation && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error} - Showing rule-based recommendation.
        </Alert>
      )}
      
      {/* Contact Summary */}
      {renderContactSummary()}
      
      {/* AI Recommendation Card */}
      {renderAIRecommendationCard()}
      
      {/* Options Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <ToggleButtonGroup
            value={paymentFrequency}
            exclusive
            onChange={(e, val) => val && setPaymentFrequency(val)}
            size="small"
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
            <ToggleButton value="annual">Annual (Save 2 Months)</ToggleButton>
          </ToggleButtonGroup>
          
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={includeSpouse}
                  onChange={(e) => setIncludeSpouse(e.target.checked)}
                />
              }
              label="Include Spouse"
            />
            
            {allowComparison && (
              <FormControlLabel
                control={
                  <Switch
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                  />
                }
                label="Compare Plans"
              />
            )}
          </Stack>
        </Stack>
      </Paper>
      
      {/* Plans Grid */}
      <Grid container spacing={3}>
        {Object.keys(SERVICE_PLANS).map(planKey => (
          <Grid item xs={12} sm={6} md={4} key={planKey}>
            {renderPlanCard(planKey)}
          </Grid>
        ))}
      </Grid>
      
      {/* Comparison Table */}
      {comparisonMode && selectedPlans.length > 1 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Plan Comparison
          </Typography>
          {renderComparisonTable()}
        </Box>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* NEW: ACTION BUTTONS WITH INTEGRATIONS */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          {/* Savings Calculator Button */}
          {showCalculator && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<Calculator size={20} />}
              onClick={() => setSavingsCalculatorOpen(true)}
              sx={{ 
                borderColor: '#10B981', 
                color: '#10B981',
                '&:hover': { bgcolor: '#D1FAE5', borderColor: '#059669' }
              }}
            >
              See How Much You Could Save
            </Button>
          )}
          
          {/* Portal Preview Button */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<Eye size={20} />}
            onClick={() => setPortalPreviewOpen(true)}
            sx={{ 
              borderColor: '#3B82F6', 
              color: '#3B82F6',
              '&:hover': { bgcolor: '#DBEAFE', borderColor: '#2563EB' }
            }}
          >
            Preview Your Dashboard
          </Button>
        </Stack>
      </Box>
      
      {/* Proceed Button */}
      {contactId && selectedPlans.length === 1 && !comparisonMode && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleProceedToContract}
            startIcon={<ChevronRight size={20} />}
            sx={{ px: 6, py: 1.5 }}
          >
            Proceed with {SERVICE_PLANS[selectedPlans[0]]?.name}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You'll review and sign the service agreement next
          </Typography>
        </Box>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* INTEGRATED DIALOGS */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      
      {/* Savings Calculator Dialog */}
      <SavingsCalculatorDialog
        open={savingsCalculatorOpen}
        onClose={() => setSavingsCalculatorOpen(false)}
        currentScore={contactSummary?.creditScore || contactData?.creditScore}
        projectedIncrease={getProjectedIncrease()}
      />
      
      {/* Client Portal Preview Dialog */}
      <ClientPortalPreviewDialog
        open={portalPreviewOpen}
        onClose={() => setPortalPreviewOpen(false)}
        contactData={contactData}
        creditScore={contactSummary?.creditScore || contactData?.creditScore}
      />
    </Box>
  );
};

export default ServicePlanRecommender;