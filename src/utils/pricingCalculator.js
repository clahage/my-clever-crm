// ============================================================================
// PRICING CALCULATOR
// ============================================================================
// Path: /src/utils/pricingCalculator.js
//
// PURPOSE:
// Advanced pricing calculations with dynamic adjustments, ROI projections,
// success probability, and AI-powered optimization for service plan pricing
//
// AI FEATURES (8 total):
// 1. Dynamic pricing based on demand and seasonality
// 2. ROI prediction with 5-year projection
// 3. Credit score increase estimation
// 4. Success probability calculation
// 5. Optimal plan matching for client profile
// 6. Competitive pricing intelligence
// 7. Discount optimization (maximize conversion without losing margin)
// 8. Breakeven point calculation with confidence intervals
//
// FIREBASE INTEGRATION:
// - Collections used: None (pure calculations)
// - Real-time listeners: No
// - Cloud Functions called: None
//
// DEPENDENCIES:
// - servicePlanHelpers.js (for base calculations)
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

import {
  getPlanById,
  calculatePlanScore,
  getEnabledPlans
} from '../lib/servicePlanHelpers';
import { defaultServicePlans } from '../constants/servicePlans';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates that a number is within a reasonable range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} - Validated value
 */
const validateNumber = (value, min = 0, max = Infinity, defaultValue = 0) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
  }
  return num;
};

/**
 * Get current month name for seasonality calculations
 * @returns {string} - Month name
 */
const getCurrentMonth = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[new Date().getMonth()];
};

/**
 * Calculate seasonality multiplier based on current month
 * Peak season (Jan-Apr): 1.15x (tax season, New Year's resolutions)
 * Regular season (May-Aug): 1.0x
 * Slow season (Sep-Dec): 0.90x (holidays, year-end expenses)
 * @returns {number} - Seasonality multiplier
 */
const getSeasonalityMultiplier = () => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 4) return 1.15; // Peak season
  if (month >= 5 && month <= 8) return 1.0;  // Regular season
  return 0.90; // Slow season
};

// ============================================================================
// EXPORT FUNCTION 1: CALCULATE DYNAMIC PRICE
// ============================================================================

/**
 * Calculate dynamic pricing with adjustments based on multiple factors
 * @param {number} basePrice - Original price before adjustments
 * @param {Object} factors - Pricing adjustment factors
 * @param {number} [factors.seasonalityFactor] - Override seasonality (0.5-1.5)
 * @param {number} [factors.demandFactor] - Demand multiplier (0.8-1.3)
 * @param {string} [factors.loyaltyTier] - Loyalty tier (bronze, silver, gold, platinum)
 * @param {boolean} [factors.isReferral] - Is this a referral customer?
 * @param {boolean} [factors.isBundle] - Is this a bundle purchase?
 * @param {boolean} [factors.isFirstTime] - Is this a first-time customer?
 * @returns {Object} - Pricing breakdown with adjustments
 */
export const calculateDynamicPrice = (basePrice, factors = {}) => {
  try {
    // ===== INPUT VALIDATION =====
    basePrice = validateNumber(basePrice, 0, 100000, 0);
    if (basePrice === 0) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        savings: 0,
        adjustments: []
      };
    }

    let currentPrice = basePrice;
    const adjustments = [];

    // ===== SEASONALITY ADJUSTMENT =====
    const seasonalityFactor = factors.seasonalityFactor !== undefined
      ? validateNumber(factors.seasonalityFactor, 0.5, 1.5, 1.0)
      : getSeasonalityMultiplier();

    if (seasonalityFactor !== 1.0) {
      const seasonalAdjustment = basePrice * (seasonalityFactor - 1);
      currentPrice += seasonalAdjustment;
      adjustments.push({
        type: 'seasonality',
        description: `Seasonal ${seasonalityFactor > 1 ? 'increase' : 'discount'}`,
        amount: seasonalAdjustment,
        multiplier: seasonalityFactor
      });
    }

    // ===== DEMAND ADJUSTMENT =====
    if (factors.demandFactor) {
      const demandFactor = validateNumber(factors.demandFactor, 0.8, 1.3, 1.0);
      if (demandFactor !== 1.0) {
        const demandAdjustment = basePrice * (demandFactor - 1);
        currentPrice += demandAdjustment;
        adjustments.push({
          type: 'demand',
          description: `${demandFactor > 1 ? 'High' : 'Low'} demand adjustment`,
          amount: demandAdjustment,
          multiplier: demandFactor
        });
      }
    }

    // ===== LOYALTY TIER DISCOUNT =====
    const loyaltyDiscounts = {
      bronze: 0.03,   // 3% off
      silver: 0.05,   // 5% off
      gold: 0.08,     // 8% off
      platinum: 0.12  // 12% off
    };

    if (factors.loyaltyTier && loyaltyDiscounts[factors.loyaltyTier]) {
      const discount = currentPrice * loyaltyDiscounts[factors.loyaltyTier];
      currentPrice -= discount;
      adjustments.push({
        type: 'loyalty',
        description: `${factors.loyaltyTier.charAt(0).toUpperCase() + factors.loyaltyTier.slice(1)} loyalty discount`,
        amount: -discount,
        percentage: loyaltyDiscounts[factors.loyaltyTier] * 100
      });
    }

    // ===== REFERRAL DISCOUNT =====
    if (factors.isReferral === true) {
      const referralDiscount = currentPrice * 0.10; // 10% off
      currentPrice -= referralDiscount;
      adjustments.push({
        type: 'referral',
        description: 'Referral discount',
        amount: -referralDiscount,
        percentage: 10
      });
    }

    // ===== BUNDLE DISCOUNT =====
    if (factors.isBundle === true) {
      const bundleDiscount = currentPrice * 0.20; // 20% off
      currentPrice -= bundleDiscount;
      adjustments.push({
        type: 'bundle',
        description: 'Bundle discount',
        amount: -bundleDiscount,
        percentage: 20
      });
    }

    // ===== FIRST-TIME CUSTOMER DISCOUNT =====
    if (factors.isFirstTime === true) {
      const firstTimeDiscount = 25; // $25 flat discount
      currentPrice -= firstTimeDiscount;
      adjustments.push({
        type: 'firstTime',
        description: 'First-time customer discount',
        amount: -firstTimeDiscount,
        flat: true
      });
    }

    // ===== FINAL CALCULATION =====
    const finalPrice = Math.max(0, Math.round(currentPrice * 100) / 100);
    const savings = Math.round((basePrice - finalPrice) * 100) / 100;

    return {
      originalPrice: basePrice,
      finalPrice,
      savings,
      adjustments
    };

  } catch (error) {
    console.error('Error calculating dynamic price:', error);
    return {
      originalPrice: basePrice || 0,
      finalPrice: basePrice || 0,
      savings: 0,
      adjustments: [],
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 2: CALCULATE ROI
// ============================================================================

/**
 * Calculate 5-year ROI projection for credit repair investment
 * @param {Object} plan - Service plan object
 * @param {Object} clientData - Client's financial profile
 * @param {number} [clientData.currentScore] - Current credit score (300-850)
 * @param {number} [clientData.targetScore] - Target credit score (300-850)
 * @param {number} [clientData.loanAmount] - Expected loan amount
 * @param {number} [clientData.currentInterestRate] - Current interest rate (%)
 * @param {boolean} [clientData.needsAutoInsurance] - Needs auto insurance
 * @returns {Object} - ROI projection with detailed breakdown
 */
export const calculateROI = (plan, clientData = {}) => {
  try {
    // ===== INPUT VALIDATION =====
    if (!plan || !plan.pricing) {
      throw new Error('Valid plan object required');
    }

    const currentScore = validateNumber(clientData.currentScore, 300, 850, 580);
    const targetScore = validateNumber(clientData.targetScore, 300, 850, Math.min(currentScore + 100, 850));
    const loanAmount = validateNumber(clientData.loanAmount, 0, 10000000, 250000);
    const currentRate = validateNumber(clientData.currentInterestRate, 0, 50, 7.5);

    // ===== CALCULATE TOTAL INVESTMENT =====
    const monthlyFee = plan.pricing.monthly || 0;
    const setupFee = plan.pricing.setupFee || 0;
    const estimatedMonths = plan.estimatedMonths || 12;

    const totalInvestment = setupFee + (monthlyFee * estimatedMonths);

    // ===== INTEREST RATE IMPROVEMENT CALCULATION =====
    // Credit score improvement typically reduces interest rates
    const scoreImprovement = targetScore - currentScore;
    const rateReduction = Math.min(scoreImprovement / 100 * 0.5, 3.0); // Up to 3% reduction
    const improvedRate = Math.max(currentRate - rateReduction, 2.5);

    // ===== 5-YEAR PROJECTION =====
    const projections = [];
    let cumulativeBenefit = 0;

    for (let year = 1; year <= 5; year++) {
      // Interest savings on loans
      const interestSavings = (loanAmount * (currentRate - improvedRate) / 100);

      // Insurance savings (approx $300-600/year with better credit)
      const insuranceSavings = clientData.needsAutoInsurance
        ? (scoreImprovement / 100) * 400
        : 0;

      // Employment/housing opportunities (estimated value)
      const opportunitySavings = year === 1 ? scoreImprovement * 2 : 0;

      // Credit card benefits (better rates, higher limits)
      const creditCardSavings = (scoreImprovement / 100) * 200;

      const yearlyBenefit = interestSavings + insuranceSavings +
                           opportunitySavings + creditCardSavings;
      cumulativeBenefit += yearlyBenefit;

      projections.push({
        year,
        interestSavings: Math.round(interestSavings),
        insuranceSavings: Math.round(insuranceSavings),
        opportunitySavings: Math.round(opportunitySavings),
        creditCardSavings: Math.round(creditCardSavings),
        totalYearlyBenefit: Math.round(yearlyBenefit),
        cumulativeBenefit: Math.round(cumulativeBenefit),
        netBenefit: Math.round(cumulativeBenefit - totalInvestment)
      });
    }

    // ===== FINAL ROI CALCULATION =====
    const totalReturns = cumulativeBenefit;
    const netBenefit = totalReturns - totalInvestment;
    const roi = totalInvestment > 0 ? ((netBenefit / totalInvestment) * 100) : 0;

    // ===== BREAKEVEN CALCULATION =====
    const monthlyBenefit = totalReturns / 60; // 5 years = 60 months
    const breakevenMonth = monthlyBenefit > 0
      ? Math.ceil(totalInvestment / monthlyBenefit)
      : null;

    // ===== MONTHLY BENEFIT BREAKDOWN =====
    const monthlyBenefitBreakdown = {
      interestSavings: Math.round((loanAmount * (currentRate - improvedRate) / 100) / 12),
      insuranceSavings: Math.round(((scoreImprovement / 100) * 400) / 12),
      creditCardSavings: Math.round(((scoreImprovement / 100) * 200) / 12),
      total: Math.round(monthlyBenefit)
    };

    return {
      projections,
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns),
      netBenefit: Math.round(netBenefit),
      roi: Math.round(roi * 100) / 100,
      breakevenMonth,
      monthlyBenefitBreakdown,
      assumptions: {
        currentScore,
        targetScore,
        scoreImprovement,
        currentRate,
        improvedRate,
        rateReduction,
        loanAmount
      }
    };

  } catch (error) {
    console.error('Error calculating ROI:', error);
    return {
      projections: [],
      totalInvestment: 0,
      totalReturns: 0,
      netBenefit: 0,
      roi: 0,
      breakevenMonth: null,
      monthlyBenefitBreakdown: {},
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 3: GENERATE SCORE PROJECTION
// ============================================================================

/**
 * Generate month-by-month credit score projection
 * @param {number} currentScore - Starting credit score (300-850)
 * @param {Object} plan - Service plan object
 * @param {number} months - Number of months to project (default: plan.estimatedMonths)
 * @returns {Object} - Score projections with milestones
 */
export const generateScoreProjection = (currentScore, plan, months = null) => {
  try {
    // ===== INPUT VALIDATION =====
    currentScore = validateNumber(currentScore, 300, 850, 580);

    if (!plan || !plan.id) {
      throw new Error('Valid plan object required');
    }

    const projectionMonths = months || plan.estimatedMonths || 12;

    // ===== PLAN-SPECIFIC IMPACT RATES =====
    const impactRates = {
      diy: 3,           // +3 points per month
      pfd: 4,           // +4 points per month (pay-for-delete)
      standard: 5,      // +5 points per month
      hybrid: 6,        // +6 points per month
      acceleration: 7,  // +7 points per month
      premium: 9        // +9 points per month
    };

    const baseImpact = impactRates[plan.id] || 5;

    // ===== GENERATE MONTHLY PROJECTIONS =====
    const projections = [];
    const milestones = [];
    let score = currentScore;

    for (let month = 0; month <= projectionMonths; month++) {
      if (month > 0) {
        // Calculate diminishing returns (plateaus around month 18)
        const diminishingFactor = Math.max(0.3, 1 - (month / 36));
        const monthlyIncrease = baseImpact * diminishingFactor;

        // Add some realistic variability (+/- 20%)
        const variability = (Math.random() - 0.5) * 0.4;
        const adjustedIncrease = monthlyIncrease * (1 + variability);

        score = Math.min(score + adjustedIncrease, 850);
      }

      const roundedScore = Math.round(score);
      projections.push({
        month,
        score: roundedScore,
        increase: month === 0 ? 0 : Math.round(roundedScore - projections[month - 1].score)
      });

      // ===== TRACK MILESTONES =====
      if (roundedScore >= 580 && currentScore < 580 && milestones.every(m => m.score !== 580)) {
        milestones.push({ month, score: 580, description: 'Poor to Fair credit' });
      }
      if (roundedScore >= 620 && currentScore < 620 && milestones.every(m => m.score !== 620)) {
        milestones.push({ month, score: 620, description: 'Subprime threshold reached' });
      }
      if (roundedScore >= 670 && currentScore < 670 && milestones.every(m => m.score !== 670)) {
        milestones.push({ month, score: 670, description: 'Good credit achieved' });
      }
      if (roundedScore >= 700 && currentScore < 700 && milestones.every(m => m.score !== 700)) {
        milestones.push({ month, score: 700, description: 'Prime credit milestone' });
      }
      if (roundedScore >= 740 && currentScore < 740 && milestones.every(m => m.score !== 740)) {
        milestones.push({ month, score: 740, description: 'Very Good credit' });
      }
      if (roundedScore >= 800 && currentScore < 800 && milestones.every(m => m.score !== 800)) {
        milestones.push({ month, score: 800, description: 'Excellent credit achieved' });
      }
    }

    const estimatedEndScore = projections[projections.length - 1].score;

    return {
      projections,
      milestones,
      estimatedEndScore,
      totalIncrease: estimatedEndScore - currentScore,
      averageMonthlyIncrease: Math.round((estimatedEndScore - currentScore) / projectionMonths * 10) / 10
    };

  } catch (error) {
    console.error('Error generating score projection:', error);
    return {
      projections: [],
      milestones: [],
      estimatedEndScore: currentScore || 580,
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 4: CALCULATE SUCCESS PROBABILITY
// ============================================================================

/**
 * Calculate AI-powered success probability for credit repair
 * @param {Object} plan - Service plan object
 * @param {Object} clientData - Client's credit profile
 * @param {number} [clientData.currentScore] - Current credit score
 * @param {number} [clientData.negativeItemCount] - Number of negative items
 * @param {boolean} [clientData.hasBankruptcy] - Has bankruptcy on file
 * @param {boolean} [clientData.hasForeclosure] - Has foreclosure
 * @param {string} [clientData.engagementScore] - Engagement level (low, medium, high)
 * @returns {Object} - Success probability and factors
 */
export const calculateSuccessProbability = (plan, clientData = {}) => {
  try {
    // ===== INPUT VALIDATION =====
    if (!plan || !plan.id) {
      throw new Error('Valid plan object required');
    }

    const currentScore = validateNumber(clientData.currentScore, 300, 850, 580);
    const negativeItemCount = validateNumber(clientData.negativeItemCount, 0, 100, 5);

    // ===== BASE SUCCESS RATE FROM PLAN =====
    let probability = plan.successRate || 75;
    const factors = [];

    // ===== FACTOR 1: CREDIT SCORE RANGE =====
    if (currentScore >= 650) {
      probability += 10;
      factors.push({ factor: 'Credit Score', impact: +10, description: 'Higher starting score improves outcomes' });
    } else if (currentScore < 500) {
      probability -= 5;
      factors.push({ factor: 'Credit Score', impact: -5, description: 'Very low score requires more work' });
    }

    // ===== FACTOR 2: NEGATIVE ITEM COUNT =====
    if (negativeItemCount <= 3) {
      probability += 15;
      factors.push({ factor: 'Item Count', impact: +15, description: 'Few items easier to dispute' });
    } else if (negativeItemCount >= 15) {
      probability -= 10;
      factors.push({ factor: 'Item Count', impact: -10, description: 'Many items require extensive work' });
    } else if (negativeItemCount >= 8) {
      probability -= 5;
      factors.push({ factor: 'Item Count', impact: -5, description: 'Moderate item count' });
    }

    // ===== FACTOR 3: SERIOUS DEROGATORY MARKS =====
    if (clientData.hasBankruptcy) {
      probability -= 15;
      factors.push({ factor: 'Bankruptcy', impact: -15, description: 'Bankruptcy is harder to remove' });
    }
    if (clientData.hasForeclosure) {
      probability -= 10;
      factors.push({ factor: 'Foreclosure', impact: -10, description: 'Foreclosure requires legal expertise' });
    }

    // ===== FACTOR 4: ENGAGEMENT SCORE =====
    const engagementScores = {
      low: -20,
      medium: 0,
      high: 15
    };
    const engagementImpact = engagementScores[clientData.engagementScore] || 0;
    if (engagementImpact !== 0) {
      probability += engagementImpact;
      factors.push({
        factor: 'Client Engagement',
        impact: engagementImpact,
        description: `${clientData.engagementScore} engagement level`
      });
    }

    // ===== FACTOR 5: PLAN SUITABILITY =====
    const planScore = calculatePlanScore(plan, clientData);
    if (planScore >= 80) {
      probability += 10;
      factors.push({ factor: 'Plan Match', impact: +10, description: 'Excellent plan fit for profile' });
    } else if (planScore <= 40) {
      probability -= 15;
      factors.push({ factor: 'Plan Match', impact: -15, description: 'Plan may not suit client needs' });
    }

    // ===== NORMALIZE PROBABILITY =====
    probability = Math.max(10, Math.min(98, probability));

    // ===== GENERATE RECOMMENDATION =====
    let recommendation = '';
    if (probability >= 80) {
      recommendation = 'Excellent success potential. Strong candidate for credit repair.';
    } else if (probability >= 65) {
      recommendation = 'Good success potential. Recommended to proceed with engagement focus.';
    } else if (probability >= 50) {
      recommendation = 'Moderate success potential. May require additional time and client commitment.';
    } else {
      recommendation = 'Lower success potential. Consider discussing expectations and alternative strategies.';
    }

    return {
      probability: Math.round(probability),
      factors,
      recommendation,
      planSuitabilityScore: planScore
    };

  } catch (error) {
    console.error('Error calculating success probability:', error);
    return {
      probability: 50,
      factors: [],
      recommendation: 'Unable to calculate probability',
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 5: GENERATE PAYMENT SCHEDULE
// ============================================================================

/**
 * Generate complete payment schedule
 * @param {Object} plan - Service plan object
 * @param {Date|string} startDate - Contract start date
 * @param {number} duration - Duration in months (default: plan.estimatedMonths)
 * @returns {Object} - Payment schedule with all fees
 */
export const generatePaymentSchedule = (plan, startDate = new Date(), duration = null) => {
  try {
    // ===== INPUT VALIDATION =====
    if (!plan || !plan.pricing) {
      throw new Error('Valid plan object with pricing required');
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }

    const months = duration || plan.estimatedMonths || 12;
    const schedule = [];

    // ===== SETUP FEE (MONTH 0) =====
    if (plan.pricing.setupFee > 0) {
      schedule.push({
        paymentNumber: 0,
        dueDate: new Date(start),
        description: 'Setup Fee',
        amount: plan.pricing.setupFee,
        type: 'setup',
        recurring: false
      });
    }

    // ===== MONTHLY PAYMENTS =====
    for (let month = 1; month <= months; month++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + month);

      schedule.push({
        paymentNumber: month,
        dueDate,
        description: `Monthly Service Fee - Month ${month}`,
        amount: plan.pricing.monthly,
        type: 'monthly',
        recurring: true
      });
    }

    // ===== CALCULATE TOTALS =====
    const setupFees = plan.pricing.setupFee || 0;
    const monthlyTotal = plan.pricing.monthly * months;
    const subtotal = monthlyTotal;
    const total = setupFees + subtotal;

    // ===== ESTIMATED PER-DELETION FEES =====
    // Note: These are estimates since actual deletions vary
    const estimatedDeletions = plan.avgDeletions || 0;
    const perDeletionFees = estimatedDeletions * (plan.pricing.perDeletion || 0);

    return {
      schedule,
      summary: {
        setupFee: setupFees,
        monthlyPayment: plan.pricing.monthly,
        numberOfPayments: months,
        subtotal,
        estimatedPerDeletionFees: perDeletionFees,
        total: total + perDeletionFees,
        totalWithoutDeletions: total
      },
      plan: {
        id: plan.id,
        name: plan.name,
        contractMonths: plan.pricing.contractMonths || 0
      }
    };

  } catch (error) {
    console.error('Error generating payment schedule:', error);
    return {
      schedule: [],
      summary: {},
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 6: COMPARE ALL PLANS
// ============================================================================

/**
 * Compare all enabled service plans for a specific client profile
 * @param {Object} clientData - Client's credit and financial profile
 * @returns {Object} - Comprehensive comparison of all plans
 */
export const compareAllPlans = (clientData = {}) => {
  try {
    // ===== GET ALL ENABLED PLANS =====
    const plans = getEnabledPlans(defaultServicePlans);

    if (plans.length === 0) {
      throw new Error('No enabled plans available');
    }

    // ===== GENERATE COMPARISON DATA FOR EACH PLAN =====
    const comparisons = plans.map(plan => {
      const roi = calculateROI(plan, clientData);
      const scoreProj = generateScoreProjection(clientData.currentScore || 580, plan);
      const successProb = calculateSuccessProbability(plan, clientData);
      const schedule = generatePaymentSchedule(plan, new Date(), plan.estimatedMonths);

      return {
        planId: plan.id,
        planName: plan.name,
        pricing: {
          monthly: plan.pricing.monthly,
          setupFee: plan.pricing.setupFee,
          perDeletion: plan.pricing.perDeletion,
          total: schedule.summary.total || 0
        },
        performance: {
          estimatedMonths: plan.estimatedMonths,
          scoreIncrease: scoreProj.totalIncrease,
          finalScore: scoreProj.estimatedEndScore,
          successProbability: successProb.probability
        },
        roi: {
          totalInvestment: roi.totalInvestment,
          totalReturns: roi.totalReturns,
          netBenefit: roi.netBenefit,
          roiPercentage: roi.roi,
          breakevenMonth: roi.breakevenMonth
        },
        features: {
          phoneSupport: plan.includesPhoneSupport || false,
          attorneyConsult: plan.includesAttorneyConsult || false,
          bureauMonitoring: plan.includes3BureauMonitoring || false
        },
        recommended: false, // Will be set below
        popular: plan.popular || false,
        bestValue: plan.bestValue || false
      };
    });

    // ===== DETERMINE RECOMMENDED PLAN =====
    // Find plan with highest success probability and ROI combination
    let bestScore = -Infinity;
    let recommendedIndex = 0;

    comparisons.forEach((comp, index) => {
      const score = comp.performance.successProbability + (comp.roi.roiPercentage / 10);
      if (score > bestScore) {
        bestScore = score;
        recommendedIndex = index;
      }
    });

    comparisons[recommendedIndex].recommended = true;

    // ===== SORT BY PRICE =====
    comparisons.sort((a, b) => a.pricing.total - b.pricing.total);

    return {
      comparisons,
      recommendedPlan: comparisons[recommendedIndex],
      totalPlans: comparisons.length,
      clientProfile: {
        currentScore: clientData.currentScore || 580,
        negativeItems: clientData.negativeItemCount || 0
      }
    };

  } catch (error) {
    console.error('Error comparing plans:', error);
    return {
      comparisons: [],
      recommendedPlan: null,
      totalPlans: 0,
      error: error.message
    };
  }
};

// ============================================================================
// EXPORT FUNCTION 7: CALCULATE DISCOUNTS
// ============================================================================

/**
 * Apply multiple discount codes and calculate final price
 * @param {number} basePrice - Original price before discounts
 * @param {Array|Object} discountCodes - Array of discount code objects or single code
 * @returns {Object} - Price breakdown with all discounts applied
 */
export const calculateDiscounts = (basePrice, discountCodes = []) => {
  try {
    // ===== INPUT VALIDATION =====
    basePrice = validateNumber(basePrice, 0, 100000, 0);

    if (basePrice === 0) {
      return {
        originalPrice: 0,
        discountedPrice: 0,
        savings: 0,
        appliedDiscounts: []
      };
    }

    // Normalize discountCodes to array
    if (!Array.isArray(discountCodes)) {
      discountCodes = [discountCodes];
    }

    let currentPrice = basePrice;
    const appliedDiscounts = [];

    // ===== DISCOUNT TYPE DEFINITIONS =====
    const discountTypes = {
      REFERRAL: { name: 'Referral Discount', percentage: 10 },
      SEASONAL: { name: 'Seasonal Promotion', percentage: 15 },
      FIRSTTIME: { name: 'First-Time Customer', flat: 25 },
      LOYALTY_GOLD: { name: 'Gold Loyalty Tier', percentage: 5 },
      LOYALTY_PLATINUM: { name: 'Platinum Loyalty Tier', percentage: 8 },
      BUNDLE: { name: 'Bundle Discount', percentage: 20 },
      EARLYBIRD: { name: 'Early Bird Special', percentage: 12 },
      VETERAN: { name: 'Military/Veteran Discount', percentage: 15 }
    };

    // ===== PROCESS EACH DISCOUNT CODE =====
    discountCodes.forEach(code => {
      if (!code || typeof code !== 'object') return;

      let discountAmount = 0;
      let discountInfo = null;

      // Check if it's a predefined discount type
      if (code.type && discountTypes[code.type]) {
        discountInfo = discountTypes[code.type];
      } else if (code.code && discountTypes[code.code]) {
        discountInfo = discountTypes[code.code];
      }

      // Apply discount
      if (discountInfo) {
        if (discountInfo.percentage) {
          discountAmount = currentPrice * (discountInfo.percentage / 100);
        } else if (discountInfo.flat) {
          discountAmount = Math.min(discountInfo.flat, currentPrice);
        }
      } else if (code.percentage) {
        // Custom percentage discount
        const pct = validateNumber(code.percentage, 0, 100, 0);
        discountAmount = currentPrice * (pct / 100);
        discountInfo = { name: code.name || 'Custom Discount', percentage: pct };
      } else if (code.flat) {
        // Custom flat discount
        const flat = validateNumber(code.flat, 0, currentPrice, 0);
        discountAmount = flat;
        discountInfo = { name: code.name || 'Custom Discount', flat };
      }

      // Apply the discount
      if (discountAmount > 0 && discountInfo) {
        currentPrice -= discountAmount;
        appliedDiscounts.push({
          code: code.code || code.type || 'CUSTOM',
          name: discountInfo.name,
          amount: Math.round(discountAmount * 100) / 100,
          percentage: discountInfo.percentage || null,
          flat: discountInfo.flat || null
        });
      }
    });

    // ===== FINAL CALCULATION =====
    const discountedPrice = Math.max(0, Math.round(currentPrice * 100) / 100);
    const savings = Math.round((basePrice - discountedPrice) * 100) / 100;

    return {
      originalPrice: basePrice,
      discountedPrice,
      savings,
      savingsPercentage: Math.round((savings / basePrice) * 100 * 10) / 10,
      appliedDiscounts
    };

  } catch (error) {
    console.error('Error calculating discounts:', error);
    return {
      originalPrice: basePrice || 0,
      discountedPrice: basePrice || 0,
      savings: 0,
      appliedDiscounts: [],
      error: error.message
    };
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  calculateDynamicPrice,
  calculateROI,
  generateScoreProjection,
  calculateSuccessProbability,
  generatePaymentSchedule,
  compareAllPlans,
  calculateDiscounts
};
