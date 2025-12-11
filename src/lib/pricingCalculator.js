// ============================================================================
// PRICING CALCULATOR UTILITIES
// ============================================================================
// Pure functions for calculating service plan pricing, ROI, and payment schedules
// All functions are side-effect free and can be used throughout the application
//
// Created By: Chris Lahage - Speedy Credit Repair Inc.
// © 1995-2025 Speedy Credit Repair Inc. All Rights Reserved
// ============================================================================

// ===== FORMAT CURRENCY =====
// Formats a number as USD currency
// @param {number} amount - Dollar amount
// @param {boolean} includeCents - Whether to include cents (default: false)
// @returns {string} - Formatted currency string
export const formatCurrency = (amount, includeCents = false) => {
  try {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: includeCents ? 2 : 0,
      maximumFractionDigits: includeCents ? 2 : 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '$0';
  }
};

// ===== CALCULATE MONTHLY TOTAL =====
// Calculates total monthly cost including plan and any add-ons
// @param {Object} plan - Service plan object
// @param {Array} addons - Array of addon objects with pricing
// @returns {number} - Total monthly cost
export const calculateMonthlyTotal = (plan, addons = []) => {
  try {
    if (!plan || !plan.pricing) return 0;

    let total = plan.pricing.monthly;

    // Add any monthly addon costs
    addons.forEach(addon => {
      if (addon.pricing && addon.pricing.monthly) {
        total += addon.pricing.monthly;
      }
    });

    return total;
  } catch (error) {
    console.error('Error calculating monthly total:', error);
    return 0;
  }
};

// ===== CALCULATE TOTAL COST =====
// Calculates total cost over specified months including setup fees
// @param {Object} plan - Service plan object
// @param {number} months - Number of months
// @param {number} expectedDeletions - Expected number of deletions (for per-deletion pricing)
// @returns {Object} - { totalCost, breakdown }
export const calculateTotalCost = (plan, months, expectedDeletions = 0) => {
  try {
    if (!plan || !plan.pricing) {
      return { totalCost: 0, breakdown: {} };
    }

    const setupFee = plan.pricing.setupFee || 0;
    const monthlyFee = plan.pricing.monthly || 0;
    const perDeletion = plan.pricing.perDeletion || 0;

    const monthlyTotal = monthlyFee * months;
    const deletionTotal = perDeletion * expectedDeletions;
    const totalCost = setupFee + monthlyTotal + deletionTotal;

    return {
      totalCost,
      breakdown: {
        setupFee,
        monthlyFee,
        monthlyTotal,
        perDeletion,
        expectedDeletions,
        deletionTotal,
        months
      }
    };
  } catch (error) {
    console.error('Error calculating total cost:', error);
    return { totalCost: 0, breakdown: {} };
  }
};

// ===== CALCULATE DELETION COST =====
// Calculates cost for specific deletion items based on plan pricing
// @param {Array} items - Array of negative items to delete
// @param {Object} plan - Service plan object
// @returns {Object} - { totalCost, itemBreakdown }
export const estimateDeletionCost = (items = [], plan) => {
  try {
    if (!plan || !plan.pricing) {
      return { totalCost: 0, itemBreakdown: [] };
    }

    // If plan has per-deletion pricing structure (like PFD plan)
    const deletionPricing = plan.pricing.deletionPricing || {};
    const defaultPerDeletion = plan.pricing.perDeletion || 0;

    let totalCost = 0;
    const itemBreakdown = items.map(item => {
      // Get specific pricing for this item type, or use default
      const itemCost = deletionPricing[item.type] || defaultPerDeletion;
      totalCost += itemCost;

      return {
        type: item.type,
        description: item.description || item.type,
        cost: itemCost
      };
    });

    return {
      totalCost,
      itemBreakdown,
      averageCost: items.length > 0 ? totalCost / items.length : 0,
      itemCount: items.length
    };
  } catch (error) {
    console.error('Error estimating deletion cost:', error);
    return { totalCost: 0, itemBreakdown: [] };
  }
};

// ===== CALCULATE ROI =====
// Estimates return on investment based on credit score improvement
// @param {number} currentScore - Current credit score
// @param {number} targetScore - Target credit score
// @param {Object} plan - Service plan object
// @returns {Object} - ROI analysis
export const calculateROI = (currentScore, targetScore, plan) => {
  try {
    if (!plan || !plan.pricing) {
      return { roi: 0, analysis: {} };
    }

    // Calculate estimated months needed based on score improvement
    const scoreImprovement = targetScore - currentScore;
    const estimatedMonths = plan.estimatedMonths || 12;

    // Calculate total investment
    const { totalCost } = calculateTotalCost(plan, estimatedMonths, 0);

    // Estimate financial benefits of improved credit
    // These are industry-standard estimates for credit score impact
    const benefits = {
      // Lower interest rates on mortgages
      mortgageSavings: calculateMortgageSavings(currentScore, targetScore),

      // Lower interest rates on auto loans
      autoLoanSavings: calculateAutoLoanSavings(currentScore, targetScore),

      // Lower interest rates on credit cards
      creditCardSavings: calculateCreditCardSavings(currentScore, targetScore),

      // Better insurance rates
      insuranceSavings: calculateInsuranceSavings(currentScore, targetScore),

      // Security deposit waivers (utilities, rentals)
      depositSavings: 500 // Conservative estimate
    };

    const totalBenefits = Object.values(benefits).reduce((sum, val) => sum + val, 0);
    const roi = ((totalBenefits - totalCost) / totalCost) * 100;

    return {
      roi,
      roiPercentage: `${roi.toFixed(0)}%`,
      investment: totalCost,
      estimatedBenefits: totalBenefits,
      netGain: totalBenefits - totalCost,
      breakdown: benefits,
      estimatedMonths,
      scoreImprovement,
      paybackPeriod: totalCost > 0 ? (totalCost / (totalBenefits / 12)) : 0 // Months to break even
    };
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return { roi: 0, analysis: {} };
  }
};

// ===== HELPER: CALCULATE MORTGAGE SAVINGS =====
// Estimates annual savings on mortgage interest
const calculateMortgageSavings = (currentScore, targetScore) => {
  try {
    const avgMortgage = 300000; // Average mortgage amount
    const currentRate = getInterestRate('mortgage', currentScore);
    const targetRate = getInterestRate('mortgage', targetScore);
    const rateDifference = currentRate - targetRate;

    // Annual savings over 30-year mortgage
    return (avgMortgage * rateDifference) / 100;
  } catch (error) {
    return 0;
  }
};

// ===== HELPER: CALCULATE AUTO LOAN SAVINGS =====
// Estimates annual savings on auto loan interest
const calculateAutoLoanSavings = (currentScore, targetScore) => {
  try {
    const avgAutoLoan = 35000; // Average auto loan amount
    const loanTerm = 5; // Years
    const currentRate = getInterestRate('auto', currentScore);
    const targetRate = getInterestRate('auto', targetScore);
    const rateDifference = currentRate - targetRate;

    // Total savings over loan term, divided by years for annual estimate
    return ((avgAutoLoan * rateDifference * loanTerm) / 100) / loanTerm;
  } catch (error) {
    return 0;
  }
};

// ===== HELPER: CALCULATE CREDIT CARD SAVINGS =====
// Estimates annual savings on credit card interest
const calculateCreditCardSavings = (currentScore, targetScore) => {
  try {
    const avgBalance = 8000; // Average credit card balance
    const currentRate = getInterestRate('creditCard', currentScore);
    const targetRate = getInterestRate('creditCard', targetScore);
    const rateDifference = currentRate - targetRate;

    return (avgBalance * rateDifference) / 100;
  } catch (error) {
    return 0;
  }
};

// ===== HELPER: CALCULATE INSURANCE SAVINGS =====
// Estimates annual savings on insurance premiums
const calculateInsuranceSavings = (currentScore, targetScore) => {
  try {
    // Credit score impacts auto and home insurance rates
    // Conservative estimate of annual savings
    const scoreImprovement = targetScore - currentScore;

    if (scoreImprovement >= 100) return 400;
    if (scoreImprovement >= 50) return 250;
    if (scoreImprovement >= 25) return 150;
    return 75;
  } catch (error) {
    return 0;
  }
};

// ===== HELPER: GET INTEREST RATE BY CREDIT SCORE =====
// Returns typical interest rate for given credit score and product type
const getInterestRate = (productType, creditScore) => {
  const rates = {
    mortgage: {
      excellent: 3.5,  // 740+
      good: 4.0,       // 670-739
      fair: 5.5,       // 580-669
      poor: 7.0        // <580
    },
    auto: {
      excellent: 4.0,
      good: 6.0,
      fair: 10.0,
      poor: 14.0
    },
    creditCard: {
      excellent: 14.0,
      good: 18.0,
      fair: 23.0,
      poor: 28.0
    }
  };

  const productRates = rates[productType] || rates.creditCard;

  if (creditScore >= 740) return productRates.excellent;
  if (creditScore >= 670) return productRates.good;
  if (creditScore >= 580) return productRates.fair;
  return productRates.poor;
};

// ===== COMPARE PLANS =====
// Compares multiple plans for a given credit profile and returns analysis
// @param {Array} plans - Array of service plan objects to compare
// @param {Object} creditProfile - Client's credit profile
// @returns {Array} - Comparison analysis for each plan
export const comparePlans = (plans, creditProfile) => {
  try {
    const { avgScore = 600, targetScore = 720, negativeItemCount = 5 } = creditProfile;

    return plans.map(plan => {
      const roi = calculateROI(avgScore, targetScore, plan);
      const { totalCost } = calculateTotalCost(plan, plan.estimatedMonths, negativeItemCount);
      const deletionCost = estimateDeletionCost(
        Array(negativeItemCount).fill({ type: 'collection' }),
        plan
      );

      return {
        planId: plan.id,
        planName: plan.name,
        totalInvestment: totalCost + deletionCost.totalCost,
        estimatedMonths: plan.estimatedMonths,
        roi: roi.roi,
        netGain: roi.netGain,
        monthlyFee: plan.pricing.monthly,
        setupFee: plan.pricing.setupFee,
        perDeletion: plan.pricing.perDeletion,
        totalDeletionCost: deletionCost.totalCost,
        successRate: plan.successRate,
        valueScore: calculateValueScore(plan, totalCost, roi.roi)
      };
    }).sort((a, b) => b.valueScore - a.valueScore);
  } catch (error) {
    console.error('Error comparing plans:', error);
    return [];
  }
};

// ===== CALCULATE VALUE SCORE =====
// Internal scoring function to rank plans by overall value
const calculateValueScore = (plan, totalCost, roi) => {
  try {
    // Higher success rate = better
    const successScore = (plan.successRate || 0) * 0.4;

    // Higher ROI = better
    const roiScore = Math.min(roi / 10, 50) * 0.3;

    // Lower cost = better (inversely proportional)
    const costScore = Math.max(0, 100 - (totalCost / 100)) * 0.2;

    // AI recommendation score
    const aiScore = (plan.aiRecommendationScore || 0) * 10 * 0.1;

    return successScore + roiScore + costScore + aiScore;
  } catch (error) {
    return 0;
  }
};

// ===== GENERATE PAYMENT SCHEDULE =====
// Creates a detailed payment schedule for a plan
// @param {Object} plan - Service plan object
// @param {Date} startDate - Contract start date
// @param {number} expectedDeletions - Expected deletions per month
// @returns {Array} - Payment schedule by month
export const generatePaymentSchedule = (plan, startDate = new Date(), expectedDeletions = 0) => {
  try {
    if (!plan || !plan.pricing) return [];

    const schedule = [];
    const contractMonths = plan.pricing.contractMonths || 12;
    const monthlyFee = plan.pricing.monthly;
    const perDeletion = plan.pricing.perDeletion;
    const setupFee = plan.pricing.setupFee;

    // Month 0: Setup fee (if applicable)
    if (setupFee > 0) {
      schedule.push({
        month: 0,
        date: new Date(startDate),
        description: 'Setup Fee',
        descriptionEs: 'Tarifa de Configuración',
        amount: setupFee,
        type: 'setup',
        running_total: setupFee
      });
    }

    let runningTotal = setupFee;

    // Monthly payments
    for (let i = 1; i <= contractMonths; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      const monthlyDeletionFee = perDeletion * expectedDeletions;
      const monthTotal = monthlyFee + monthlyDeletionFee;
      runningTotal += monthTotal;

      const payment = {
        month: i,
        date: paymentDate,
        description: `Month ${i} Payment`,
        descriptionEs: `Pago del Mes ${i}`,
        monthlyFee,
        deletionFee: monthlyDeletionFee,
        deletions: expectedDeletions,
        amount: monthTotal,
        type: 'monthly',
        running_total: runningTotal
      };

      schedule.push(payment);
    }

    return schedule;
  } catch (error) {
    console.error('Error generating payment schedule:', error);
    return [];
  }
};

// ===== CALCULATE SAVINGS COMPARISON =====
// Compares potential savings between current situation and after repair
// @param {Object} creditProfile - Current credit profile
// @param {Object} plan - Selected service plan
// @returns {Object} - Savings comparison
export const calculateSavingsComparison = (creditProfile, plan) => {
  try {
    const { avgScore = 600, targetScore = 720 } = creditProfile;

    // Current costs (before credit repair)
    const currentCosts = {
      mortgageRate: getInterestRate('mortgage', avgScore),
      autoRate: getInterestRate('auto', avgScore),
      creditCardRate: getInterestRate('creditCard', avgScore),
      insuranceAnnual: 1500 // Estimate with poor credit
    };

    // Future costs (after credit repair)
    const futureCosts = {
      mortgageRate: getInterestRate('mortgage', targetScore),
      autoRate: getInterestRate('auto', targetScore),
      creditCardRate: getInterestRate('creditCard', targetScore),
      insuranceAnnual: 1200 // Estimate with good credit
    };

    // Calculate annual savings
    const annualSavings = {
      mortgage: calculateMortgageSavings(avgScore, targetScore),
      auto: calculateAutoLoanSavings(avgScore, targetScore),
      creditCard: calculateCreditCardSavings(avgScore, targetScore),
      insurance: currentCosts.insuranceAnnual - futureCosts.insuranceAnnual
    };

    const totalAnnualSavings = Object.values(annualSavings).reduce((sum, val) => sum + val, 0);
    const { totalCost } = calculateTotalCost(plan, plan.estimatedMonths, 0);

    return {
      currentCosts,
      futureCosts,
      annualSavings,
      totalAnnualSavings,
      fiveYearSavings: totalAnnualSavings * 5,
      investmentCost: totalCost,
      netSavingsFirstYear: totalAnnualSavings - totalCost,
      netSavingsFiveYears: (totalAnnualSavings * 5) - totalCost,
      breakEvenMonths: totalCost / (totalAnnualSavings / 12)
    };
  } catch (error) {
    console.error('Error calculating savings comparison:', error);
    return null;
  }
};

// ===== EXPORT ALL CALCULATOR FUNCTIONS =====
export default {
  formatCurrency,
  calculateMonthlyTotal,
  calculateTotalCost,
  estimateDeletionCost,
  calculateROI,
  comparePlans,
  generatePaymentSchedule,
  calculateSavingsComparison
};
