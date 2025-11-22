<<<<<<< HEAD
<<<<<<< HEAD
// Path: /src/lib/financialPlanningEngine.js
// ============================================================================
// 🧮 FINANCIAL PLANNING ENGINE - TIER 5+ ENTERPRISE EDITION
// ============================================================================
// Complete calculation engine for debt payoff strategies with AI optimization
//
// FEATURES:
// ✅ Debt Snowball Strategy (smallest balance first)
// ✅ Debt Avalanche Strategy (highest interest first)
// ✅ Hybrid Strategy (balanced approach)
// ✅ Debt Consolidation Analysis
// ✅ AI-Powered Recommendations
// ✅ Interest Calculation Engine
// ✅ Payment Schedule Generation
// ✅ Savings Projection
// ✅ Timeline Optimization
// ✅ Credit Score Impact Modeling
// ✅ Strategy Comparison
// ✅ What-If Scenario Analysis
//
// CHRISTOPHER'S REQUIREMENTS:
// ✅ Production-ready (no test data)
// ✅ Beginner-friendly comments
// ✅ Maximum AI integration
// ✅ Complete calculations
// ✅ Error handling throughout
//
// USAGE:
// import { DebtPayoffCalculator } from '@/lib/financialPlanningEngine';
// const calculator = new DebtPayoffCalculator(debtsArray, extraMonthlyPayment);
// const snowballPlan = calculator.calculateSnowball();
// const recommendations = calculator.getAIRecommendations();
//
// ============================================================================

// ============================================================================
// ===== DEBT PAYOFF CALCULATOR CLASS =====
// ============================================================================

export class DebtPayoffCalculator {
  constructor(debts, extraMonthlyPayment = 0) {
    // ===== INITIALIZATION =====
    // Store the debts array and extra monthly payment amount
    this.debts = this.validateDebts(debts);
    this.extraMonthlyPayment = Math.max(0, extraMonthlyPayment);
    
    // ===== CALCULATION CACHE =====
    // Cache results to avoid recalculating
    this.cache = {
      snowball: null,
      avalanche: null,
      hybrid: null,
      consolidation: null,
    };
  }

  // ============================================================================
  // ===== VALIDATION =====
  // ============================================================================

  validateDebts(debts) {
    // ===== DEBT VALIDATION =====
    // Ensure all debts have required fields and valid values
    if (!Array.isArray(debts)) {
      console.warn('⚠️ Debts must be an array, returning empty array');
      return [];
    }

    return debts
      .filter(debt => {
        // Must have positive balance
        if (!debt.balance || debt.balance <= 0) return false;
        
        // Must have interest rate (can be 0% for interest-free)
        if (debt.interestRate === undefined || debt.interestRate === null) return false;
        
        // Must have minimum payment
        if (!debt.minimumPayment || debt.minimumPayment <= 0) return false;
        
        return true;
      })
      .map(debt => ({
        id: debt.id || `debt_${Date.now()}_${Math.random()}`,
        name: debt.name || 'Unnamed Debt',
        type: debt.type || 'other',
        balance: parseFloat(debt.balance),
        interestRate: parseFloat(debt.interestRate),
        minimumPayment: parseFloat(debt.minimumPayment),
        creditLimit: debt.creditLimit ? parseFloat(debt.creditLimit) : null,
      }));
  }

  // ============================================================================
  // ===== SNOWBALL STRATEGY =====
  // ============================================================================
  // Pay off smallest debts first for psychological wins

  calculateSnowball() {
    // ===== CHECK CACHE =====
    if (this.cache.snowball) return this.cache.snowball;

    if (this.debts.length === 0) {
      return this.getEmptyPlan('snowball');
    }

    // ===== SORT BY BALANCE (SMALLEST FIRST) =====
    const sortedDebts = [...this.debts].sort((a, b) => a.balance - b.balance);

    // ===== CALCULATE PAYOFF PLAN =====
    const result = this.calculatePayoffPlan(sortedDebts, 'snowball');
    
    // ===== CACHE RESULT =====
    this.cache.snowball = result;
    return result;
  }

  // ============================================================================
  // ===== AVALANCHE STRATEGY =====
  // ============================================================================
  // Pay off highest interest debts first to save money

  calculateAvalanche() {
    // ===== CHECK CACHE =====
    if (this.cache.avalanche) return this.cache.avalanche;

    if (this.debts.length === 0) {
      return this.getEmptyPlan('avalanche');
    }

    // ===== SORT BY INTEREST RATE (HIGHEST FIRST) =====
    const sortedDebts = [...this.debts].sort((a, b) => b.interestRate - a.interestRate);

    // ===== CALCULATE PAYOFF PLAN =====
    const result = this.calculatePayoffPlan(sortedDebts, 'avalanche');
    
    // ===== CACHE RESULT =====
    this.cache.avalanche = result;
    return result;
  }

  // ============================================================================
  // ===== HYBRID STRATEGY =====
  // ============================================================================
  // Balanced approach combining snowball and avalanche

  calculateHybrid() {
    // ===== CHECK CACHE =====
    if (this.cache.hybrid) return this.cache.hybrid;

    if (this.debts.length === 0) {
      return this.getEmptyPlan('hybrid');
    }

    // ===== HYBRID SCORING ALGORITHM =====
    // Score = (Interest Rate Weight × 0.6) + (Balance Weight × 0.4)
    // This balances saving money (interest) with psychological wins (small balances)
    
    const scoredDebts = this.debts.map(debt => {
      // Normalize interest rate (0-100 scale)
      const maxInterest = Math.max(...this.debts.map(d => d.interestRate));
      const interestWeight = maxInterest > 0 ? debt.interestRate / maxInterest : 0;

      // Normalize balance (inverse, so smaller = higher score)
      const maxBalance = Math.max(...this.debts.map(d => d.balance));
      const balanceWeight = maxBalance > 0 ? 1 - (debt.balance / maxBalance) : 0;

      // Calculate hybrid score
      const hybridScore = (interestWeight * 0.6) + (balanceWeight * 0.4);

      return {
        ...debt,
        hybridScore,
      };
    });

    // ===== SORT BY HYBRID SCORE (HIGHEST FIRST) =====
    const sortedDebts = scoredDebts.sort((a, b) => b.hybridScore - a.hybridScore);

    // ===== CALCULATE PAYOFF PLAN =====
    const result = this.calculatePayoffPlan(sortedDebts, 'hybrid');
    
    // ===== CACHE RESULT =====
    this.cache.hybrid = result;
    return result;
  }

  // ============================================================================
  // ===== CORE PAYOFF CALCULATION ENGINE =====
  // ============================================================================

  calculatePayoffPlan(sortedDebts, strategy) {
    // ===== INITIALIZE TRACKING VARIABLES =====
    let currentMonth = 0;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const timeline = [];
    const milestones = [];
    
    // Create working copy of debts
    let remainingDebts = sortedDebts.map(debt => ({
      ...debt,
      originalBalance: debt.balance,
      remainingBalance: debt.balance,
      interestPaid: 0,
      principalPaid: 0,
    }));

    const totalDebt = remainingDebts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinimumPayment = remainingDebts.reduce((sum, d) => sum + d.minimumPayment, 0);

    // ===== MONTHLY PAYMENT SIMULATION =====
    // Continue until all debts are paid or max 360 months (30 years)
    while (remainingDebts.length > 0 && currentMonth < 360) {
      currentMonth++;

      // ===== TRACK MONTH DATA =====
      const monthData = {
        month: currentMonth,
        payments: [],
        totalPaid: 0,
        interestPaid: 0,
        principalPaid: 0,
        remainingBalance: 0,
        debtsRemaining: 0,
      };

      // ===== STEP 1: PAY MINIMUMS ON ALL DEBTS =====
      remainingDebts.forEach(debt => {
        // Calculate monthly interest
        const monthlyInterestRate = debt.interestRate / 100 / 12;
        const monthlyInterest = debt.remainingBalance * monthlyInterestRate;

        // Minimum payment goes to interest first, then principal
        const minimumPayment = Math.min(debt.minimumPayment, debt.remainingBalance + monthlyInterest);
        const principalFromMinimum = Math.max(0, minimumPayment - monthlyInterest);

        // Update debt
        debt.remainingBalance -= principalFromMinimum;
        debt.interestPaid += monthlyInterest;
        debt.principalPaid += principalFromMinimum;

        // Track totals
        monthData.interestPaid += monthlyInterest;
        monthData.principalPaid += principalFromMinimum;
        monthData.totalPaid += minimumPayment;
        totalInterestPaid += monthlyInterest;
        totalPrincipalPaid += principalFromMinimum;
=======
/**
 * FINANCIAL PLANNING ENGINE - MEGA AI ENTERPRISE EDITION
 *
 * Purpose:
 * Comprehensive financial planning calculation engine with AI-powered
 * debt reduction strategies, budget optimization, and credit score forecasting.
 *
 * Features:
 * - Multiple debt payoff strategies (Snowball, Avalanche, Hybrid, Custom)
 * - AI-powered strategy recommendations based on psychology and math
 * - Credit score impact projections
 * - Budget optimization with income/expense tracking
 * - Financial goal tracking and milestone management
 * - Debt consolidation and refinancing analysis
 * - Investment opportunity cost calculations
 * - Emergency fund recommendations
 * - Tax-advantaged savings optimization
 *
 * Created: 2025-12-06
 * Part of: Speedy Credit Repair Financial Planning System
 */

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';

// ═════════════════════════════════════════════════════════════════════════════
// DEBT PAYOFF CALCULATOR - Core Engine
// ═════════════════════════════════════════════════════════════════════════════

/**
 * DebtPayoffCalculator - Main calculation engine for debt reduction strategies
 *
 * Supports multiple payoff strategies:
 * - Snowball: Pay smallest balance first (psychological wins)
 * - Avalanche: Pay highest interest rate first (mathematical optimal)
 * - Hybrid: Balance between quick wins and interest savings
 * - Custom: User-defined priority order
 */
export class DebtPayoffCalculator {
  constructor(debts, monthlyPaymentBudget, strategy = 'avalanche') {
    this.debts = debts; // Array of debt objects
    this.monthlyPaymentBudget = monthlyPaymentBudget; // Total monthly budget for debt payments
    this.strategy = strategy; // Payoff strategy
    this.minimumPayments = this.calculateMinimumPayments();
    this.extraPayment = Math.max(0, monthlyPaymentBudget - this.minimumPayments);
  }

  /**
   * Calculate minimum monthly payments across all debts
   */
  calculateMinimumPayments() {
    return this.debts.reduce((total, debt) => total + (debt.minimumPayment || 0), 0);
  }

  /**
   * Get prioritized debt order based on strategy
   */
  getPriorityOrder() {
    const sortedDebts = [...this.debts];

    switch (this.strategy) {
      case 'snowball':
        // Sort by balance (smallest first) for psychological wins
        return sortedDebts.sort((a, b) => a.balance - b.balance);

      case 'avalanche':
        // Sort by interest rate (highest first) for math optimization
        return sortedDebts.sort((a, b) => b.interestRate - a.interestRate);

      case 'hybrid':
        // Hybrid: Balance psychological wins with interest savings
        // Score = (normalized_balance * 0.3) + (normalized_rate * 0.7)
        const maxBalance = Math.max(...sortedDebts.map(d => d.balance));
        const maxRate = Math.max(...sortedDebts.map(d => d.interestRate));

        return sortedDebts.sort((a, b) => {
          const scoreA = (a.balance / maxBalance) * 0.3 + (a.interestRate / maxRate) * 0.7;
          const scoreB = (b.balance / maxBalance) * 0.3 + (b.interestRate / maxRate) * 0.7;
          return scoreB - scoreA;
        });

      case 'custom':
        // Use user-defined priority order
        return sortedDebts.sort((a, b) => (a.priority || 999) - (b.priority || 999));

      default:
        return sortedDebts;
    }
  }

  /**
   * Calculate complete payoff timeline with month-by-month breakdown
   *
   * Returns detailed timeline showing:
   * - Monthly payments per debt
   * - Balance reduction over time
   * - Interest paid each month
   * - Total cost and payoff date
   */
  calculatePayoffTimeline() {
    const timeline = [];
    const priorityOrder = this.getPriorityOrder();

    // Clone debts to avoid mutating original data
    let activeDebts = priorityOrder.map(debt => ({
      ...debt,
      remainingBalance: debt.balance,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      monthsPaid: 0
    }));

    let month = 0;
    const maxMonths = 600; // Safety limit: 50 years

    while (activeDebts.some(d => d.remainingBalance > 0) && month < maxMonths) {
      month++;
      const monthData = {
        month,
        date: new Date(new Date().setMonth(new Date().getMonth() + month)),
        payments: [],
        totalPayment: 0,
        totalInterest: 0,
        totalPrincipal: 0,
        remainingDebt: 0
      };

      // Calculate interest accrued this month for all debts
      activeDebts = activeDebts.map(debt => {
        if (debt.remainingBalance <= 0) return debt;

        const monthlyRate = debt.interestRate / 100 / 12;
        const interestCharge = debt.remainingBalance * monthlyRate;

        return {
          ...debt,
          currentMonthInterest: interestCharge
        };
      });

      // Distribute available payment budget
      let remainingBudget = this.monthlyPaymentBudget;
      const debtsStillOwed = activeDebts.filter(d => d.remainingBalance > 0);

      // First, pay minimum payments on all debts
      for (const debt of debtsStillOwed) {
        const minimumPayment = Math.min(
          debt.minimumPayment,
          debt.remainingBalance + debt.currentMonthInterest
        );

        const interestPortion = Math.min(minimumPayment, debt.currentMonthInterest);
        const principalPortion = minimumPayment - interestPortion;

        debt.remainingBalance = Math.max(0, debt.remainingBalance + debt.currentMonthInterest - minimumPayment);
        debt.totalInterestPaid += interestPortion;
        debt.totalPrincipalPaid += principalPortion;
        debt.monthsPaid++;
>>>>>>> origin/claude/speedycrm-contact-lifecycle-01Nn2nFiLRe5htmGUXvSJ93d

        monthData.payments.push({
          debtId: debt.id,
          debtName: debt.name,
          payment: minimumPayment,
<<<<<<< HEAD
          principal: principalFromMinimum,
          interest: monthlyInterest,
          remainingBalance: Math.max(0, debt.remainingBalance),
        });
      });

      // ===== STEP 2: APPLY EXTRA PAYMENT TO FOCUS DEBT =====
      if (this.extraMonthlyPayment > 0 && remainingDebts.length > 0) {
        const focusDebt = remainingDebts[0]; // First debt in sorted order
        const extraPayment = Math.min(this.extraMonthlyPayment, focusDebt.remainingBalance);

        focusDebt.remainingBalance -= extraPayment;
        focusDebt.principalPaid += extraPayment;

        monthData.principalPaid += extraPayment;
        monthData.totalPaid += extraPayment;
        totalPrincipalPaid += extraPayment;

        // Update payment record for focus debt
        const focusPayment = monthData.payments.find(p => p.debtId === focusDebt.id);
        if (focusPayment) {
          focusPayment.payment += extraPayment;
          focusPayment.principal += extraPayment;
          focusPayment.remainingBalance = Math.max(0, focusDebt.remainingBalance);
        }
      }

      // ===== STEP 3: CHECK FOR PAID-OFF DEBTS =====
      const paidOffThisMonth = remainingDebts.filter(d => d.remainingBalance <= 0.01);
      
      paidOffThisMonth.forEach(debt => {
        milestones.push({
          month: currentMonth,
          debtName: debt.name,
          originalBalance: debt.originalBalance,
          interestPaid: debt.interestPaid,
          totalPaid: debt.originalBalance + debt.interestPaid,
        });
      });

      // ===== STEP 4: REMOVE PAID-OFF DEBTS =====
      remainingDebts = remainingDebts.filter(d => d.remainingBalance > 0.01);

      // ===== TRACK REMAINING BALANCE =====
      monthData.remainingBalance = remainingDebts.reduce((sum, d) => sum + d.remainingBalance, 0);
      monthData.debtsRemaining = remainingDebts.length;

      // ===== ADD TO TIMELINE =====
      timeline.push(monthData);

      // ===== BREAK IF ALL DEBTS PAID =====
      if (remainingDebts.length === 0) break;
    }

    // ===== CALCULATE SUMMARY STATISTICS =====
    const months = timeline.length;
    const years = months / 12;
    const totalPaid = totalDebt + totalInterestPaid;
    const avgMonthlyPayment = totalPaid / months;

    // ===== CALCULATE CREDIT SCORE IMPACT =====
    const creditImpact = this.calculateCreditImpact(sortedDebts, timeline);

    // ===== RETURN COMPLETE PAYOFF PLAN =====
    return {
      strategy,
      months,
      years: parseFloat(years.toFixed(1)),
      totalDebt,
      totalInterest: parseFloat(totalInterestPaid.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      avgMonthlyPayment: parseFloat(avgMonthlyPayment.toFixed(2)),
      timeline,
      milestones,
      creditImpact,
      debtsOrder: sortedDebts.map(d => ({ id: d.id, name: d.name })),
      completionDate: this.getCompletionDate(months),
    };
  }

  // ============================================================================
  // ===== CREDIT SCORE IMPACT CALCULATOR =====
  // ============================================================================

  calculateCreditImpact(debts, timeline) {
    // ===== CREDIT SCORE FACTORS =====
    // Payment history: 35%
    // Credit utilization: 30%
    // Credit age: 15%
    // Credit mix: 10%
    // New credit: 10%

    const impacts = [];
    const checkpoints = [0, 6, 12, 18, 24, 36, 48, 60]; // Check at these months

    checkpoints.forEach(month => {
      if (month >= timeline.length) return;

      const monthData = month === 0 ? null : timeline[month - 1];
      
      // ===== CALCULATE UTILIZATION IMPROVEMENT =====
      let utilizationImpact = 0;
      
      const creditCardDebts = debts.filter(d => d.type === 'credit_card');
      if (creditCardDebts.length > 0) {
        const totalCreditLimit = creditCardDebts.reduce((sum, d) => 
          sum + (d.creditLimit || d.balance * 3), 0
        );
        
        const initialUtilization = creditCardDebts.reduce((sum, d) => sum + d.balance, 0) / totalCreditLimit;
        
        if (monthData) {
          const currentUtilization = monthData.remainingBalance / totalCreditLimit;
          const utilizationReduction = initialUtilization - currentUtilization;
          
          // Utilization impact (0-30% of score = 0-210 points on 300-850 scale)
          utilizationImpact = utilizationReduction * 0.3 * 550; // Max impact ~165 points
        }
      }

      // ===== CALCULATE PAYMENT HISTORY IMPACT =====
      // Assume on-time payments improve score
      const paymentHistoryImpact = month * 0.5; // +0.5 points per month of on-time payments

      // ===== TOTAL ESTIMATED IMPACT =====
      const totalImpact = utilizationImpact + paymentHistoryImpact;

      impacts.push({
        month,
        estimatedImpact: Math.round(totalImpact),
        description: month === 0 
          ? 'Starting point' 
          : `After ${month} months of payments`,
      });
    });

    return impacts;
  }

  // ============================================================================
  // ===== DEBT CONSOLIDATION ANALYSIS =====
  // ============================================================================

  calculateConsolidation(consolidationRate, consolidationFee = 0) {
    // ===== CHECK CACHE =====
    const cacheKey = `${consolidationRate}_${consolidationFee}`;
    if (this.cache.consolidation && this.cache.consolidation.cacheKey === cacheKey) {
      return this.cache.consolidation;
    }

    if (this.debts.length === 0) {
      return null;
    }

    // ===== CALCULATE TOTALS =====
    const totalDebt = this.debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinimumPayment = this.debts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const consolidatedBalance = totalDebt + consolidationFee;

    // ===== CALCULATE WEIGHTED AVERAGE INTEREST RATE =====
    const weightedInterest = this.debts.reduce((sum, d) => 
      sum + (d.balance * d.interestRate), 0
    ) / totalDebt;

    // ===== SIMULATE CONSOLIDATION LOAN =====
    const consolidatedDebt = [{
      id: 'consolidation',
      name: 'Consolidated Loan',
      type: 'personal_loan',
      balance: consolidatedBalance,
      interestRate: consolidationRate,
      minimumPayment: totalMinimumPayment,
    }];

    const calculator = new DebtPayoffCalculator(consolidatedDebt, this.extraMonthlyPayment);
    const consolidationPlan = calculator.calculateAvalanche();

    // ===== COMPARE WITH CURRENT BEST STRATEGY =====
    const snowball = this.calculateSnowball();
    const avalanche = this.calculateAvalanche();
    const currentBest = avalanche.totalInterest < snowball.totalInterest ? avalanche : snowball;

    // ===== CALCULATE SAVINGS =====
    const interestSavings = currentBest.totalInterest - consolidationPlan.totalInterest;
    const timeSavings = currentBest.months - consolidationPlan.months;
    const isWorthIt = interestSavings > consolidationFee;

    // ===== RETURN ANALYSIS =====
    const result = {
      cacheKey,
      consolidatedBalance,
      consolidationRate,
      consolidationFee,
      weightedInterest,
      monthlyPayment: totalMinimumPayment + this.extraMonthlyPayment,
      months: consolidationPlan.months,
      years: consolidationPlan.years,
      totalInterest: consolidationPlan.totalInterest,
      totalPaid: consolidationPlan.totalPaid,
      interestSavings: parseFloat(interestSavings.toFixed(2)),
      timeSavings,
      isWorthIt,
      recommendation: this.getConsolidationRecommendation(
        interestSavings, 
        timeSavings, 
        consolidationFee, 
        weightedInterest, 
        consolidationRate
      ),
    };

    // ===== CACHE RESULT =====
    this.cache.consolidation = result;
    return result;
  }

  // ============================================================================
  // ===== AI-POWERED RECOMMENDATIONS =====
  // ============================================================================

  getAIRecommendations() {
    if (this.debts.length === 0) {
      return {
        recommended: 'none',
        confidence: 0,
        reason: 'No debts to analyze',
        tips: ['Start building an emergency fund', 'Focus on income growth'],
      };
    }

    // ===== ANALYZE DEBT PROFILE =====
    const totalDebt = this.debts.reduce((sum, d) => sum + d.balance, 0);
    const avgInterestRate = this.debts.reduce((sum, d) => sum + d.interestRate, 0) / this.debts.length;
    const highestInterest = Math.max(...this.debts.map(d => d.interestRate));
    const smallestBalance = Math.min(...this.debts.map(d => d.balance));
    const debtCount = this.debts.length;

    // ===== GET ALL STRATEGIES =====
    const snowball = this.calculateSnowball();
    const avalanche = this.calculateAvalanche();
    const hybrid = this.calculateHybrid();

    // ===== AI DECISION LOGIC =====
    let recommended = 'hybrid';
    let confidence = 70;
    let reason = 'Balanced approach recommended for your debt profile';
    const tips = [];

    // SCENARIO 1: High interest rates (>15% average)
    if (avgInterestRate > 15 && totalDebt > 5000) {
      recommended = 'avalanche';
      confidence = 90;
      reason = `High interest rates detected (avg ${avgInterestRate.toFixed(1)}%). Avalanche will save you the most money.`;
      tips.push(
        `Potential savings: $${(snowball.totalInterest - avalanche.totalInterest).toFixed(0)} vs snowball`,
        'Focus on paying down high-interest debts aggressively',
        'Consider balance transfer cards for high-interest credit card debt'
      );
    }
    // SCENARIO 2: Many small debts
    else if (debtCount >= 5 && smallestBalance < 2000) {
      recommended = 'snowball';
      confidence = 85;
      reason = `${debtCount} debts detected with small balances. Snowball provides quick psychological wins.`;
      tips.push(
        'Quick wins will keep you motivated',
        `You could eliminate ${Math.ceil(debtCount / 3)} debts in the first year`,
        'Each paid-off debt frees up cash flow for the next one'
      );
    }
    // SCENARIO 3: Very high interest on one debt
    else if (highestInterest > 20) {
      recommended = 'avalanche';
      confidence = 95;
      reason = `One debt has ${highestInterest.toFixed(1)}% interest rate. Attack this immediately.`;
      tips.push(
        'This high-interest debt is costing you the most',
        'Every extra dollar toward this debt saves you money',
        'Consider debt consolidation to lower this rate'
      );
    }
    // SCENARIO 4: Moderate debt profile
    else {
      recommended = 'hybrid';
      confidence = 75;
      reason = 'Balanced debt profile benefits from hybrid strategy combining both methods.';
      tips.push(
        'Hybrid balances psychological wins with mathematical optimization',
        `Estimated ${hybrid.years} years to debt freedom`,
        'This strategy adapts to your debt profile changes'
      );
    }

    // ===== ADDITIONAL TIPS =====
    if (this.extraMonthlyPayment === 0) {
      tips.push('Try to allocate extra monthly payment to accelerate payoff');
    }

    if (this.extraMonthlyPayment > 0 && this.extraMonthlyPayment < 100) {
      tips.push(`Increasing extra payment from $${this.extraMonthlyPayment} to $${this.extraMonthlyPayment + 50} could save months`);
    }

    // Check if consolidation makes sense
    const consolidation = this.calculateConsolidation(avgInterestRate * 0.8, 0);
    if (consolidation && consolidation.isWorthIt) {
      tips.push('Debt consolidation could save you money - see Calculators tab');
    }

    return {
      recommended,
      confidence,
      reason,
      tips,
      comparison: {
        snowball: {
          months: snowball.months,
          totalInterest: snowball.totalInterest,
          pros: ['Quick wins', 'Motivation boost', 'Simple to follow'],
          cons: ['Higher total interest', 'Slower mathematically'],
        },
        avalanche: {
          months: avalanche.months,
          totalInterest: avalanche.totalInterest,
          pros: ['Saves most money', 'Mathematically optimal', 'Faster payoff'],
          cons: ['Slower initial wins', 'Requires discipline'],
        },
        hybrid: {
          months: hybrid.months,
          totalInterest: hybrid.totalInterest,
          pros: ['Best of both worlds', 'Flexible approach', 'Balanced results'],
          cons: ['Requires planning', 'More complex'],
        },
      },
      potentialSavings: {
        snowballVsAvalanche: parseFloat((snowball.totalInterest - avalanche.totalInterest).toFixed(2)),
        hybridVsSnowball: parseFloat((snowball.totalInterest - hybrid.totalInterest).toFixed(2)),
      },
    };
  }

  // ============================================================================
  // ===== CONSOLIDATION RECOMMENDATION =====
  // ============================================================================

  getConsolidationRecommendation(interestSavings, timeSavings, fee, currentRate, newRate) {
    if (interestSavings <= 0) {
      return {
        verdict: 'not_recommended',
        confidence: 90,
        reason: 'Consolidation would cost more in interest than current plan',
        advice: 'Stick with your current debt payoff strategy',
      };
    }

    if (interestSavings < fee) {
      return {
        verdict: 'not_recommended',
        confidence: 80,
        reason: `Fee ($${fee}) exceeds interest savings ($${interestSavings.toFixed(2)})`,
        advice: 'Look for consolidation options with lower or no fees',
      };
    }

    const netSavings = interestSavings - fee;
    const rateReduction = currentRate - newRate;

    if (netSavings > 1000 && rateReduction > 3) {
      return {
        verdict: 'highly_recommended',
        confidence: 95,
        reason: `Save $${netSavings.toFixed(0)} and ${timeSavings} months with ${rateReduction.toFixed(1)}% lower rate`,
        advice: 'Consolidation is an excellent option for your situation',
      };
    }

    if (netSavings > 500 && rateReduction > 2) {
      return {
        verdict: 'recommended',
        confidence: 80,
        reason: `Save $${netSavings.toFixed(0)} with ${rateReduction.toFixed(1)}% lower rate`,
        advice: 'Consolidation makes financial sense if you can get approved',
      };
    }

    return {
      verdict: 'consider',
      confidence: 60,
      reason: `Modest savings of $${netSavings.toFixed(0)}`,
      advice: 'Compare multiple consolidation offers before deciding',
    };
  }

  // ============================================================================
  // ===== WHAT-IF SCENARIO ANALYSIS =====
  // ============================================================================

  analyzeScenario(newExtraPayment) {
    // ===== CREATE NEW CALCULATOR WITH DIFFERENT EXTRA PAYMENT =====
    const newCalculator = new DebtPayoffCalculator(this.debts, newExtraPayment);
    
    const currentPlan = this.calculateHybrid();
    const newPlan = newCalculator.calculateHybrid();

    return {
      currentExtra: this.extraMonthlyPayment,
      newExtra: newExtraPayment,
      monthsSaved: currentPlan.months - newPlan.months,
      interestSaved: parseFloat((currentPlan.totalInterest - newPlan.totalInterest).toFixed(2)),
      yearsSaved: parseFloat(((currentPlan.months - newPlan.months) / 12).toFixed(1)),
      newCompletionDate: newPlan.completionDate,
      worthIt: (currentPlan.totalInterest - newPlan.totalInterest) > (newExtraPayment - this.extraMonthlyPayment) * 12,
    };
  }

  // ============================================================================
  // ===== UTILITY FUNCTIONS =====
  // ============================================================================

  getEmptyPlan(strategy) {
    return {
      strategy,
      months: 0,
      years: 0,
      totalDebt: 0,
      totalInterest: 0,
      totalPaid: 0,
      avgMonthlyPayment: 0,
      timeline: [],
      milestones: [],
      creditImpact: [],
      debtsOrder: [],
      completionDate: null,
    };
  }

  getCompletionDate(months) {
    const today = new Date();
    const completionDate = new Date(today);
    completionDate.setMonth(completionDate.getMonth() + months);
    
    return completionDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // ============================================================================
  // ===== STRATEGY COMPARISON =====
  // ============================================================================

  compareAllStrategies() {
    const snowball = this.calculateSnowball();
    const avalanche = this.calculateAvalanche();
    const hybrid = this.calculateHybrid();
=======
// Path: /src/lib/financialPlanningEngine.js
// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL PLANNING ENGINE - Calculation & Logic System
// ═══════════════════════════════════════════════════════════════════════════
// Backend calculation engine for debt payoff strategies, budget optimization,
// credit score simulation, and AI-powered financial recommendations
//
// This is the BRAIN of the Financial Planning Hub - all complex calculations
// happen here with zero client-side AI (all AI calls happen server-side)
// ═══════════════════════════════════════════════════════════════════════════

import { addMonths, differenceInMonths, parseISO, format } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// DEBT PAYOFF CALCULATION ALGORITHMS
// ═══════════════════════════════════════════════════════════════════════════

export class DebtPayoffCalculator {
  /**
   * Calculate debt snowball strategy (smallest balance first)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateSnowball(debts, monthlyExtra) {
    console.log('❄️ Calculating Snowball Strategy...');
    
    // Sort by balance (smallest first)
    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'SNOWBALL');
  }

  /**
   * Calculate debt avalanche strategy (highest interest first)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateAvalanche(debts, monthlyExtra) {
    console.log('⛰️ Calculating Avalanche Strategy...');
    
    // Sort by APR (highest first)
    const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'AVALANCHE');
  }

  /**
   * Calculate AI hybrid strategy (optimized balance)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateHybrid(debts, monthlyExtra) {
    console.log('🤖 Calculating AI Hybrid Strategy...');
    
    // Hybrid algorithm: Balance psychological wins with interest savings
    // 1. Collections first (credit score impact)
    // 2. Small balances under $500 (quick wins)
    // 3. High interest over 20% (cost savings)
    // 4. Remaining by avalanche
    
    const sortedDebts = [...debts].sort((a, b) => {
      // Collections first
      if (a.type === 'COLLECTION' && b.type !== 'COLLECTION') return -1;
      if (b.type === 'COLLECTION' && a.type !== 'COLLECTION') return 1;
      
      // Small balances second
      if (a.balance < 500 && b.balance >= 500) return -1;
      if (b.balance < 500 && a.balance >= 500) return 1;
      
      // High interest third
      if (a.apr > 20 && b.apr <= 20) return -1;
      if (b.apr > 20 && a.apr <= 20) return 1;
      
      // Then by interest rate
      return b.apr - a.apr;
    });
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'HYBRID');
  }

  /**
   * Calculate credit-focused strategy (maximize score improvement)
   * @param {Array} debts - Array of debt objects
   * @param {Number} monthlyExtra - Extra money available for debt payoff
   * @returns {Object} Payoff plan with timeline and total interest
   */
  static calculateCreditFocused(debts, monthlyExtra) {
    console.log('📈 Calculating Credit-Focused Strategy...');
    
    // Prioritize debts that hurt credit score most:
    // 1. Collections and charge-offs
    // 2. Credit cards over 50% utilization
    // 3. Credit cards over 30% utilization
    // 4. Recent late payments
    // 5. Remaining by balance
    
    const sortedDebts = [...debts].sort((a, b) => {
      // Collections first
      if ((a.type === 'COLLECTION' || a.type === 'CHARGE_OFF') && 
          (b.type !== 'COLLECTION' && b.type !== 'CHARGE_OFF')) return -1;
      if ((b.type === 'COLLECTION' || b.type === 'CHARGE_OFF') && 
          (a.type !== 'COLLECTION' && a.type !== 'CHARGE_OFF')) return 1;
      
      // High utilization credit cards
      const aUtil = a.type === 'CREDIT_CARD' && a.creditLimit ? 
        (a.balance / a.creditLimit) * 100 : 0;
      const bUtil = b.type === 'CREDIT_CARD' && b.creditLimit ? 
        (b.balance / b.creditLimit) * 100 : 0;
      
      if (aUtil > 50 && bUtil <= 50) return -1;
      if (bUtil > 50 && aUtil <= 50) return 1;
      if (aUtil > 30 && bUtil <= 30) return -1;
      if (bUtil > 30 && aUtil <= 30) return 1;
      
      // Then by balance
      return a.balance - b.balance;
    });
    
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'CREDIT_FOCUSED');
  }

  /**
   * Core payoff calculation logic
   * @private
   */
  static _calculatePayoffPlan(sortedDebts, monthlyExtra, strategy) {
    const workingDebts = sortedDebts.map(d => ({
      ...d,
      remainingBalance: d.balance,
      totalInterestPaid: 0,
      monthsPaid: 0,
      payoffDate: null
    }));

    let currentMonth = 0;
    let totalInterestPaid = 0;
    const timeline = [];
    const milestones = [];

    // Continue until all debts paid
    while (workingDebts.some(d => d.remainingBalance > 0)) {
      currentMonth++;
      let extraAvailable = monthlyExtra;
      
      // Calculate interest and make minimum payments
      for (const debt of workingDebts) {
        if (debt.remainingBalance <= 0) continue;
        
        // Calculate monthly interest
        const monthlyInterest = debt.remainingBalance * (debt.apr / 100 / 12);
        debt.totalInterestPaid += monthlyInterest;
        totalInterestPaid += monthlyInterest;
        
        // Apply minimum payment
        const minPayment = debt.minimumPayment || (debt.remainingBalance * 0.02);
        const payment = Math.min(minPayment, debt.remainingBalance + monthlyInterest);
        debt.remainingBalance = debt.remainingBalance + monthlyInterest - payment;
        debt.monthsPaid++;
        
        // Track for timeline
        if (!timeline[currentMonth - 1]) {
          timeline[currentMonth - 1] = {
            month: currentMonth,
            totalPaid: 0,
            totalInterest: 0,
            debtsRemaining: 0,
            totalRemaining: 0
          };
        }
      }
      
      // Apply extra payment to highest priority debt with balance
      for (const debt of workingDebts) {
        if (debt.remainingBalance > 0 && extraAvailable > 0) {
          const extraPayment = Math.min(extraAvailable, debt.remainingBalance);
          debt.remainingBalance -= extraPayment;
          extraAvailable -= extraPayment;
          
          // Check if debt is paid off
          if (debt.remainingBalance <= 0) {
            debt.payoffDate = format(addMonths(new Date(), currentMonth), 'MMM yyyy');
            milestones.push({
              month: currentMonth,
              type: 'payoff',
              debtName: debt.name,
              originalBalance: debt.balance,
              interestPaid: debt.totalInterestPaid
            });
            console.log(`✅ ${debt.name} paid off in month ${currentMonth}`);
          }
          
          break; // Only apply to one debt at a time
        }
      }
      
      // Update timeline
      timeline[currentMonth - 1].totalPaid = monthlyExtra + workingDebts.reduce((sum, d) => 
        sum + (d.minimumPayment || d.balance * 0.02), 0
      );
      timeline[currentMonth - 1].totalInterest = totalInterestPaid;
      timeline[currentMonth - 1].debtsRemaining = workingDebts.filter(d => d.remainingBalance > 0).length;
      timeline[currentMonth - 1].totalRemaining = workingDebts.reduce((sum, d) => 
        sum + Math.max(0, d.remainingBalance), 0
      );
      
      // Safety check
      if (currentMonth > 600) {
        console.warn('⚠️ Payoff exceeds 50 years, stopping calculation');
        break;
      }
    }

    // Calculate comparison metrics
    const totalOriginalDebt = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
    const avgAPR = sortedDebts.reduce((sum, d) => sum + d.apr, 0) / sortedDebts.length;
    
    return {
      strategy,
      debts: workingDebts,
      timeline,
      milestones,
      summary: {
        totalMonths: currentMonth,
        totalYears: (currentMonth / 12).toFixed(1),
        totalInterestPaid: Math.round(totalInterestPaid),
        totalPaid: Math.round(totalOriginalDebt + totalInterestPaid),
        monthlyPayment: monthlyExtra + sortedDebts.reduce((sum, d) => 
          sum + (d.minimumPayment || d.balance * 0.02), 0
        ),
        debtFreeDate: format(addMonths(new Date(), currentMonth), 'MMMM yyyy'),
        avgAPR: avgAPR.toFixed(2)
      }
    };
  }

  /**
   * Compare all strategies side-by-side
   */
  static compareAllStrategies(debts, monthlyExtra) {
    const snowball = this.calculateSnowball(debts, monthlyExtra);
    const avalanche = this.calculateAvalanche(debts, monthlyExtra);
    const hybrid = this.calculateHybrid(debts, monthlyExtra);
    const creditFocused = this.calculateCreditFocused(debts, monthlyExtra);

    // Determine recommended strategy
    let recommended = 'AVALANCHE'; // Default
    
    // If avalanche saves > $500 vs snowball, recommend it
    const avalancheSavings = snowball.summary.totalInterestPaid - avalanche.summary.totalInterestPaid;
    
    // If hybrid is within $200 of avalanche but faster by 3+ months, recommend it
    const hybridVsAvalanche = avalanche.summary.totalInterestPaid - hybrid.summary.totalInterestPaid;
    const hybridMonthsFaster = avalanche.summary.totalMonths - hybrid.summary.totalMonths;
    
    if (avalancheSavings > 500) {
      recommended = 'AVALANCHE';
    } else if (hybridVsAvalanche > -200 && hybridMonthsFaster >= 3) {
      recommended = 'HYBRID';
    } else if (snowball.summary.totalMonths < avalanche.summary.totalMonths * 0.9) {
      // If snowball is 10%+ faster with minimal extra cost
      recommended = 'SNOWBALL';
    }
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)

    return {
      snowball,
      avalanche,
      hybrid,
<<<<<<< HEAD
      fastest: [snowball, avalanche, hybrid].sort((a, b) => a.months - b.months)[0].strategy,
      cheapest: [snowball, avalanche, hybrid].sort((a, b) => a.totalInterest - b.totalInterest)[0].strategy,
      recommended: this.getAIRecommendations().recommended,
=======
          interest: interestPortion,
          principal: principalPortion,
          remainingBalance: debt.remainingBalance,
          isMinimum: true
        });

        monthData.totalPayment += minimumPayment;
        monthData.totalInterest += interestPortion;
        monthData.totalPrincipal += principalPortion;
        remainingBudget -= minimumPayment;
      }

      // Apply extra payment to highest priority debt with remaining balance
      if (remainingBudget > 0) {
        const targetDebt = debtsStillOwed[0]; // First in priority order

        if (targetDebt) {
          const extraPayment = Math.min(remainingBudget, targetDebt.remainingBalance);

          targetDebt.remainingBalance -= extraPayment;
          targetDebt.totalPrincipalPaid += extraPayment;

          // Find and update the payment record
          const paymentRecord = monthData.payments.find(p => p.debtId === targetDebt.id);
          if (paymentRecord) {
            paymentRecord.payment += extraPayment;
            paymentRecord.principal += extraPayment;
            paymentRecord.remainingBalance = targetDebt.remainingBalance;
            paymentRecord.isMinimum = false;
          }

          monthData.totalPayment += extraPayment;
          monthData.totalPrincipal += extraPayment;
        }
      }

      // Calculate remaining total debt
      monthData.remainingDebt = activeDebts.reduce((sum, d) => sum + d.remainingBalance, 0);

      timeline.push(monthData);

      // Exit if all debts paid off
      if (monthData.remainingDebt <= 0.01) break;
    }

    return {
      timeline,
      summary: this.calculateSummary(timeline, activeDebts),
      debts: activeDebts
    };
  }

  /**
   * Calculate summary statistics for the payoff plan
   */
  calculateSummary(timeline, debts) {
    const totalMonths = timeline.length;
    const totalInterest = debts.reduce((sum, d) => sum + d.totalInterestPaid, 0);
    const totalPrincipal = debts.reduce((sum, d) => sum + d.totalPrincipalPaid, 0);
    const totalPaid = totalInterest + totalPrincipal;
    const originalDebt = this.debts.reduce((sum, d) => sum + d.balance, 0);

    const payoffDate = timeline.length > 0
      ? timeline[timeline.length - 1].date
      : new Date();

    return {
      totalMonths,
      totalYears: (totalMonths / 12).toFixed(1),
      payoffDate,
      totalInterestPaid: Math.round(totalInterest),
      totalPrincipalPaid: Math.round(totalPrincipal),
      totalAmountPaid: Math.round(totalPaid),
      originalDebt: Math.round(originalDebt),
      interestSavings: 0, // Will be calculated by comparing strategies
      monthlyPayment: this.monthlyPaymentBudget,
      debtFreeDate: payoffDate,
      avgMonthlyInterest: Math.round(totalInterest / totalMonths)
    };
  }

  /**
   * Compare all strategies and recommend the best one
   */
  static compareStrategies(debts, monthlyBudget) {
    const strategies = ['snowball', 'avalanche', 'hybrid'];
    const results = {};

    for (const strategy of strategies) {
      const calculator = new DebtPayoffCalculator(debts, monthlyBudget, strategy);
      const result = calculator.calculatePayoffTimeline();
      results[strategy] = result.summary;
    }

    // Find strategy with lowest total interest
    const bestMathStrategy = Object.entries(results).reduce((best, [strategy, summary]) => {
      return summary.totalInterestPaid < best.summary.totalInterestPaid
        ? { strategy, summary }
        : best;
    }, { strategy: 'avalanche', summary: results.avalanche });

    // AI Recommendation: Balance math with psychology
    const recommendation = DebtPayoffCalculator.getAIRecommendation(debts, results);

    return {
      results,
      bestMathStrategy: bestMathStrategy.strategy,
      aiRecommendation: recommendation,
      comparison: strategies.map(strategy => ({
        strategy,
        ...results[strategy],
        vsAvalanche: {
          extraInterest: results[strategy].totalInterestPaid - results.avalanche.totalInterestPaid,
          extraMonths: results[strategy].totalMonths - results.avalanche.totalMonths
        }
      }))
    };
  }

  /**
   * AI-powered strategy recommendation
   *
   * Considers:
   * - Number of debts (many small debts → snowball for motivation)
   * - Interest rate spread (high variance → avalanche for savings)
   * - Balance distribution (evenly distributed → hybrid)
   * - Total debt amount (high debt → avalanche to minimize cost)
   */
  static getAIRecommendation(debts, strategyResults) {
    const debtCount = debts.length;
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const avgBalance = totalDebt / debtCount;

    const rates = debts.map(d => d.interestRate);
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const rateSpread = maxRate - minRate;

    const balances = debts.map(d => d.balance);
    const smallDebts = balances.filter(b => b < avgBalance * 0.5).length;

    let recommendedStrategy = 'avalanche';
    let reason = '';
    let confidenceScore = 0;

    // Rule 1: Many small debts → Snowball for psychological wins
    if (smallDebts >= 3 && debtCount >= 5) {
      recommendedStrategy = 'snowball';
      reason = `You have ${smallDebts} small debts. Snowball method will give you quick wins to stay motivated.`;
      confidenceScore = 85;
    }
    // Rule 2: High interest rate spread → Avalanche to save money
    else if (rateSpread > 10) {
      recommendedStrategy = 'avalanche';
      reason = `Your interest rates vary significantly (${minRate.toFixed(1)}% to ${maxRate.toFixed(1)}%). Avalanche method will save you the most money.`;
      confidenceScore = 90;
    }
    // Rule 3: Large total debt → Avalanche to minimize cost
    else if (totalDebt > 50000) {
      recommendedStrategy = 'avalanche';
      reason = `With $${(totalDebt / 1000).toFixed(0)}k in total debt, minimizing interest is crucial. Avalanche method is optimal.`;
      confidenceScore = 88;
    }
    // Rule 4: Balanced scenario → Hybrid approach
    else {
      recommendedStrategy = 'hybrid';
      reason = `Your debts are fairly balanced. Hybrid method combines quick wins with interest savings.`;
      confidenceScore = 80;
    }

    const interestSavings = strategyResults.snowball.totalInterestPaid - strategyResults.avalanche.totalInterestPaid;
    const timeSavings = strategyResults.snowball.totalMonths - strategyResults.avalanche.totalMonths;

    return {
      recommended: recommendedStrategy,
      reason,
      confidenceScore,
      insights: {
        debtCount,
        totalDebt: Math.round(totalDebt),
        avgBalance: Math.round(avgBalance),
        rateSpread: rateSpread.toFixed(1),
        smallDebtsCount: smallDebts,
        potentialInterestSavings: Math.round(interestSavings),
        potentialTimeSavings: timeSavings
      }
>>>>>>> origin/claude/speedycrm-contact-lifecycle-01Nn2nFiLRe5htmGUXvSJ93d
=======
      creditFocused,
      recommended,
      comparison: {
        fastestPayoff: [snowball, avalanche, hybrid, creditFocused]
          .sort((a, b) => a.summary.totalMonths - b.summary.totalMonths)[0].strategy,
        lowestInterest: [snowball, avalanche, hybrid, creditFocused]
          .sort((a, b) => a.summary.totalInterestPaid - b.summary.totalInterestPaid)[0].strategy,
        bestBalance: hybrid.strategy
      }
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)
    };
  }
}

<<<<<<< HEAD
<<<<<<< HEAD
// ============================================================================
// ===== BUDGET CALCULATOR =====
// ============================================================================

export class BudgetCalculator {
  constructor(income, expenses) {
    this.income = this.validateIncome(income);
    this.expenses = this.validateExpenses(expenses);
  }

  validateIncome(income) {
    if (!Array.isArray(income)) return [];
    return income.filter(item => item.amount > 0);
  }

  validateExpenses(expenses) {
    if (!Array.isArray(expenses)) return [];
    return expenses.filter(item => item.amount > 0);
  }

  getTotalIncome() {
    return this.income.reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalExpenses() {
    return this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  getNetIncome() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  get50_30_20Analysis() {
    const totalIncome = this.getTotalIncome();
    
    return {
      needs: totalIncome * 0.50,
      wants: totalIncome * 0.30,
      savings: totalIncome * 0.20,
      actualNeeds: this.expenses.filter(e => e.essential).reduce((sum, e) => sum + e.amount, 0),
      actualWants: this.expenses.filter(e => !e.essential).reduce((sum, e) => sum + e.amount, 0),
    };
  }

  getAIRecommendations() {
    const netIncome = this.getNetIncome();
    const analysis = this.get50_30_20Analysis();
    const recommendations = [];

    if (netIncome < 0) {
      recommendations.push({
        priority: 'critical',
        message: 'You\'re spending more than you earn',
        action: 'Reduce expenses immediately or increase income',
      });
    }

    if (analysis.actualNeeds > analysis.needs) {
      recommendations.push({
        priority: 'high',
        message: 'Essential expenses exceed 50% of income',
        action: 'Look for ways to reduce housing, transportation, or other fixed costs',
      });
    }

    if (netIncome > 0 && netIncome < analysis.savings) {
      recommendations.push({
        priority: 'medium',
        message: 'Not saving enough for emergencies',
        action: 'Aim to save at least 20% of income',
=======
// ═════════════════════════════════════════════════════════════════════════════
// BUDGET OPTIMIZER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Budget optimization engine with AI-powered recommendations
 */
export class BudgetOptimizer {
  constructor(income, expenses, financialGoals = {}) {
    this.monthlyIncome = income;
    this.expenses = expenses;
    this.financialGoals = financialGoals;
  }

  /**
   * Analyze budget and provide AI recommendations
   */
  analyze() {
    const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const disposableIncome = this.monthlyIncome - totalExpenses;
    const savingsRate = (disposableIncome / this.monthlyIncome) * 100;

    // Categorize expenses
    const byCategory = this.expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Calculate category percentages
    const categoryPercentages = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / this.monthlyIncome) * 100
    }));

    // Identify optimization opportunities
    const opportunities = this.identifyOptimizations(byCategory);

    return {
      income: this.monthlyIncome,
      totalExpenses,
      disposableIncome,
      savingsRate: savingsRate.toFixed(1),
      byCategory,
      categoryPercentages,
      opportunities,
      healthScore: this.calculateBudgetHealth(savingsRate, byCategory),
      recommendations: this.generateRecommendations(savingsRate, byCategory, disposableIncome)
=======
// ═══════════════════════════════════════════════════════════════════════════
// BUDGET CALCULATION & OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

export class BudgetOptimizer {
  /**
   * Analyze budget and provide optimization recommendations
   */
  static analyzeBudget(income, expenses) {
    console.log('📊 Analyzing budget...');
    
    const totalIncome = income.monthly || 0;
    const categorizedExpenses = this._categorizeExpenses(expenses);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const disposableIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (disposableIncome / totalIncome) * 100 : 0;

    // Calculate recommended allocations (50/30/20 rule)
    const recommended = {
      needs: totalIncome * 0.50,      // Housing, utilities, groceries, etc.
      wants: totalIncome * 0.30,      // Entertainment, dining, etc.
      savings: totalIncome * 0.20     // Savings, debt payoff, investments
    };

    // Calculate actual allocations
    const actual = {
      needs: categorizedExpenses.essentials,
      wants: categorizedExpenses.discretionary,
      savings: categorizedExpenses.savings
    };

    // Variance analysis
    const variance = {
      needs: actual.needs - recommended.needs,
      wants: actual.wants - recommended.wants,
      savings: actual.savings - recommended.savings
    };

    // Generate recommendations
    const recommendations = this._generateBudgetRecommendations(
      totalIncome,
      categorizedExpenses,
      variance
    );

    return {
      summary: {
        totalIncome,
        totalExpenses,
        disposableIncome,
        savingsRate: savingsRate.toFixed(1)
      },
      categorizedExpenses,
      recommended,
      actual,
      variance,
      recommendations,
      healthScore: this._calculateBudgetHealthScore(totalIncome, totalExpenses, savingsRate)
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)
    };
  }

  /**
<<<<<<< HEAD
   * Identify budget optimization opportunities
   */
  identifyOptimizations(byCategory) {
    const opportunities = [];
    const income = this.monthlyIncome;

    // Recommended budget percentages (50/30/20 rule)
    const recommendations = {
      housing: { max: 30, ideal: 25 },
      transportation: { max: 15, ideal: 10 },
      food: { max: 15, ideal: 12 },
      utilities: { max: 10, ideal: 8 },
      entertainment: { max: 10, ideal: 5 },
      subscriptions: { max: 5, ideal: 3 }
    };

    for (const [category, limits] of Object.entries(recommendations)) {
      const amount = byCategory[category] || 0;
      const percentage = (amount / income) * 100;

      if (percentage > limits.max) {
        opportunities.push({
          category,
          severity: 'high',
          currentAmount: amount,
          currentPercentage: percentage.toFixed(1),
          recommendedMax: limits.max,
          potentialSavings: amount - (income * limits.max / 100),
          action: `Reduce ${category} spending by $${Math.round(amount - (income * limits.max / 100))}/month`
        });
      } else if (percentage > limits.ideal) {
        opportunities.push({
          category,
          severity: 'medium',
          currentAmount: amount,
          currentPercentage: percentage.toFixed(1),
          recommendedMax: limits.ideal,
          potentialSavings: amount - (income * limits.ideal / 100),
          action: `Consider reducing ${category} to ${limits.ideal}% of income for optimal savings`
        });
      }
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  /**
   * Calculate overall budget health score (0-100)
   */
  calculateBudgetHealth(savingsRate, byCategory) {
    let score = 50; // Start at neutral

    // Factor 1: Savings rate (40 points possible)
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 15) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else if (savingsRate < 0) score -= 20; // Overspending

    // Factor 2: Essential expenses ratio (30 points possible)
    const essentials = (byCategory.housing || 0) + (byCategory.utilities || 0) + (byCategory.food || 0);
    const essentialRatio = (essentials / this.monthlyIncome) * 100;
    if (essentialRatio <= 50) score += 30;
    else if (essentialRatio <= 60) score += 20;
    else if (essentialRatio <= 70) score += 10;
    else score -= 10;

    // Factor 3: Discretionary spending control (20 points possible)
    const discretionary = (byCategory.entertainment || 0) + (byCategory.subscriptions || 0);
    const discretionaryRatio = (discretionary / this.monthlyIncome) * 100;
    if (discretionaryRatio <= 10) score += 20;
    else if (discretionaryRatio <= 20) score += 10;
    else if (discretionaryRatio > 30) score -= 10;

    // Factor 4: Emergency fund (10 points possible)
    if (this.financialGoals.hasEmergencyFund) score += 10;
=======
   * Categorize expenses into needs, wants, and savings
   * @private
   */
  static _categorizeExpenses(expenses) {
    const essentials = expenses
      .filter(e => ['housing', 'utilities', 'food', 'insurance', 'healthcare', 'transportation', 'childcare'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const discretionary = expenses
      .filter(e => ['entertainment', 'dining', 'subscriptions', 'fitness', 'travel', 'gifts', 'personal'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const savings = expenses
      .filter(e => e.category === 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      essentials,
      discretionary,
      savings,
      byCategory: expenses.reduce((acc, e) => {
        if (!acc[e.category]) acc[e.category] = 0;
        acc[e.category] += e.amount;
        return acc;
      }, {})
    };
  }

  /**
   * Generate budget optimization recommendations
   * @private
   */
  static _generateBudgetRecommendations(income, categorized, variance) {
    const recs = [];

    // High essential spending
    if (variance.needs > income * 0.10) {
      recs.push({
        category: 'essentials',
        priority: 'high',
        title: 'Reduce Essential Expenses',
        description: `Your essential expenses are ${((variance.needs / income) * 100).toFixed(0)}% over recommended. Look for ways to reduce housing, utilities, or insurance costs.`,
        potentialSavings: variance.needs * 0.15,
        actions: [
          'Negotiate lower insurance premiums',
          'Consider refinancing high-interest loans',
          'Audit utility usage and switch providers',
          'Review subscription services for essentials'
        ]
      });
    }

    // High discretionary spending
    if (variance.wants > income * 0.05) {
      recs.push({
        category: 'discretionary',
        priority: 'medium',
        title: 'Cut Discretionary Spending',
        description: `You're spending ${((variance.wants / income) * 100).toFixed(0)}% more than recommended on wants. Small cuts can free up significant money for debt payoff.`,
        potentialSavings: variance.wants * 0.25,
        actions: [
          'Reduce dining out frequency',
          'Cancel unused subscriptions',
          'Find free entertainment alternatives',
          'Implement a 30-day rule for non-essential purchases'
        ]
      });
    }

    // Low savings rate
    if (categorized.savings < income * 0.10) {
      recs.push({
        category: 'savings',
        priority: 'high',
        title: 'Increase Savings & Debt Payoff',
        description: 'You\'re saving less than 10% of income. Aim for at least 20% for financial security.',
        targetAmount: income * 0.20 - categorized.savings,
        actions: [
          'Set up automatic transfers to savings',
          'Apply pay raises to savings before lifestyle inflation',
          'Use the debt avalanche to free up money faster',
          'Consider a side income stream'
        ]
      });
    }

    // Specific category overspending
    const categorySpending = categorized.byCategory;
    
    // Housing over 30%
    if (categorySpending.housing > income * 0.30) {
      recs.push({
        category: 'housing',
        priority: 'high',
        title: 'Housing Costs Too High',
        description: `Housing is ${((categorySpending.housing / income) * 100).toFixed(0)}% of income (recommended: 30% or less). Consider long-term solutions.`,
        potentialSavings: categorySpending.housing - (income * 0.30),
        actions: [
          'Consider refinancing mortgage',
          'Get a roommate if possible',
          'Explore more affordable housing options',
          'Negotiate rent reduction'
        ]
      });
    }

    // Subscriptions analysis
    if (categorySpending.subscriptions > 100) {
      recs.push({
        category: 'subscriptions',
        priority: 'low',
        title: 'Subscription Audit Needed',
        description: `You're spending $${categorySpending.subscriptions}/month on subscriptions. Many people have forgotten subscriptions.`,
        potentialSavings: categorySpending.subscriptions * 0.40,
        actions: [
          'List all active subscriptions',
          'Cancel services you don\'t use monthly',
          'Share family plans when possible',
          'Rotate streaming services seasonally'
        ]
      });
    }

    return recs;
  }

  /**
   * Calculate overall budget health score
   * @private
   */
  static _calculateBudgetHealthScore(income, expenses, savingsRate) {
    let score = 100;

    // Savings rate (40 points)
    if (savingsRate < 5) score -= 40;
    else if (savingsRate < 10) score -= 30;
    else if (savingsRate < 15) score -= 20;
    else if (savingsRate < 20) score -= 10;

    // Expense to income ratio (30 points)
    const expenseRatio = (expenses / income) * 100;
    if (expenseRatio > 90) score -= 30;
    else if (expenseRatio > 80) score -= 20;
    else if (expenseRatio > 70) score -= 10;

    // Disposable income (30 points)
    const disposable = income - expenses;
    if (disposable < 0) score -= 30;
    else if (disposable < income * 0.10) score -= 20;
    else if (disposable < income * 0.20) score -= 10;
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)

    return Math.max(0, Math.min(100, score));
  }

  /**
<<<<<<< HEAD
   * Generate AI-powered budget recommendations
   */
  generateRecommendations(savingsRate, byCategory, disposableIncome) {
    const recommendations = [];

    // Recommendation 1: Emergency fund
    if (!this.financialGoals.hasEmergencyFund && disposableIncome > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Emergency Fund',
        action: 'Build 3-6 months of expenses in emergency savings before aggressive debt payoff',
        monthlySuggestion: Math.min(disposableIncome * 0.3, 500),
        reason: 'Protects against unexpected expenses and prevents new debt'
      });
    }

    // Recommendation 2: Debt payoff
    if (disposableIncome > 200) {
      recommendations.push({
        priority: 'high',
        category: 'Debt Reduction',
        action: 'Allocate extra income toward debt payoff using avalanche method',
        monthlySuggestion: disposableIncome * 0.5,
        reason: 'Eliminate high-interest debt to free up future income'
      });
    }

    // Recommendation 3: Low savings rate
    if (savingsRate < 10 && savingsRate >= 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Savings Rate',
        action: 'Increase savings to at least 10% of income',
        monthlySuggestion: this.monthlyIncome * 0.1 - disposableIncome,
        reason: 'Build financial security and prepare for future goals'
      });
    }

    // Recommendation 4: Overspending
    if (savingsRate < 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Budget Deficit',
        action: 'Reduce expenses immediately - you are spending more than you earn',
        monthlySuggestion: Math.abs(disposableIncome),
        reason: 'Prevent accumulating new debt and financial crisis'
>>>>>>> origin/claude/speedycrm-contact-lifecycle-01Nn2nFiLRe5htmGUXvSJ93d
      });
    }

    return recommendations;
  }
}

<<<<<<< HEAD
// ============================================================================
// ===== EXPORT ALL CALCULATORS AND ANALYZERS (Merged) =====
// ============================================================================

export default {
  DebtPayoffCalculator,
  BudgetOptimizer,
  CreditScoreProjector,
  FinancialGoalTracker,
  DebtConsolidationAnalyzer
};
=======
// ═════════════════════════════════════════════════════════════════════════════
// CREDIT SCORE IMPACT PROJECTOR
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Project credit score improvements based on debt reduction
 */
export class CreditScoreProjector {
  constructor(currentScore, debts, creditUtilization) {
    this.currentScore = currentScore;
    this.debts = debts;
    this.creditUtilization = creditUtilization;
  }

  /**
   * Project credit score improvement over debt payoff timeline
   */
  projectScoreImprovement(payoffTimeline) {
    const projections = [];
    let currentScore = this.currentScore;

    for (const month of payoffTimeline) {
      // Calculate credit utilization reduction
      const totalCreditCardDebt = month.payments
        .filter(p => p.debtName?.includes('Credit Card'))
        .reduce((sum, p) => sum + p.remainingBalance, 0);

      const utilizationRate = this.creditUtilization > 0
        ? (totalCreditCardDebt / this.creditUtilization) * 100
        : 0;

      // Score improvement factors
      let scoreChange = 0;

      // Factor 1: Credit utilization (30% of score)
      if (utilizationRate < 10) scoreChange += 2;
      else if (utilizationRate < 30) scoreChange += 1;
      else if (utilizationRate > 70) scoreChange -= 1;

      // Factor 2: Payment history (35% of score)
      scoreChange += 1; // Consistent payments improve score

      // Factor 3: Debt paid off
      const debtsPaidOff = month.payments.filter(p => p.remainingBalance === 0).length;
      scoreChange += debtsPaidOff * 3;

      currentScore = Math.min(850, currentScore + scoreChange);

      projections.push({
        month: month.month,
        date: month.date,
        projectedScore: Math.round(currentScore),
        utilizationRate: utilizationRate.toFixed(1),
        scoreChange,
        debtsPaidOff
=======
   * Find potential savings opportunities
   */
  static findSavingsOpportunities(expenses, income) {
    const opportunities = [];

    // Subscription consolidation
    const subscriptions = expenses.filter(e => e.category === 'subscriptions');
    if (subscriptions.length > 3) {
      const totalSub = subscriptions.reduce((sum, s) => sum + s.amount, 0);
      opportunities.push({
        type: 'subscription_audit',
        title: 'Consolidate Subscriptions',
        currentCost: totalSub,
        potentialSavings: totalSub * 0.3,
        difficulty: 'easy',
        impact: 'medium'
      });
    }

    // Dining out reduction
    const dining = expenses.filter(e => e.category === 'dining');
    if (dining.length > 0) {
      const totalDining = dining.reduce((sum, d) => sum + d.amount, 0);
      if (totalDining > income * 0.05) {
        opportunities.push({
          type: 'dining_reduction',
          title: 'Reduce Dining Out',
          currentCost: totalDining,
          potentialSavings: totalDining * 0.50,
          difficulty: 'medium',
          impact: 'high'
        });
      }
    }

    // Insurance shopping
    const insurance = expenses.filter(e => e.category === 'insurance');
    if (insurance.length > 0) {
      const totalInsurance = insurance.reduce((sum, i) => sum + i.amount, 0);
      opportunities.push({
        type: 'insurance_shop',
        title: 'Shop Insurance Rates',
        currentCost: totalInsurance,
        potentialSavings: totalInsurance * 0.15,
        difficulty: 'medium',
        impact: 'medium'
      });
    }

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDIT SCORE IMPACT SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

export class CreditScoreSimulator {
  /**
   * Simulate credit score impact of debt payoff strategy
   */
  static simulateScoreImpact(currentScore, debts, payoffPlan) {
    console.log('📊 Simulating credit score impact...');
    
    const timeline = [];
    let simulatedScore = currentScore || 650;
    
    // FICO scoring factors:
    // - Payment history: 35%
    // - Amounts owed: 30%
    // - Length of credit history: 15%
    // - Credit mix: 10%
    // - New credit: 10%

    for (let month = 0; month < payoffPlan.summary.totalMonths; month++) {
      let monthScore = simulatedScore;
      
      // Calculate utilization impact (30% of score)
      const creditCards = debts.filter(d => d.type === 'CREDIT_CARD');
      if (creditCards.length > 0) {
        const monthData = payoffPlan.timeline[month];
        
        // Estimate utilization reduction
        const originalUtil = creditCards.reduce((sum, cc) => 
          sum + (cc.creditLimit > 0 ? (cc.balance / cc.creditLimit) * 100 : 0), 0
        ) / creditCards.length;
        
        const paidDown = payoffPlan.summary.totalPaid * (month / payoffPlan.summary.totalMonths);
        const newUtil = Math.max(0, originalUtil - (paidDown / 1000)); // Rough estimate
        
        // Score impact from utilization
        if (originalUtil > 30 && newUtil < 30) monthScore += 20;
        else if (originalUtil > 50 && newUtil < 50) monthScore += 15;
        else if (originalUtil > 70 && newUtil < 70) monthScore += 10;
        else if (newUtil < originalUtil - 5) monthScore += 5;
      }
      
      // Payment history impact (35% of score)
      // Assume on-time payments throughout
      if (month > 0) {
        monthScore += 1; // Gradual improvement from consistent payments
      }
      
      // Accounts paid off impact
      const paidOffThisMonth = payoffPlan.milestones.filter(m => 
        m.month === month && m.type === 'payoff'
      );
      
      for (const payoff of paidOffThisMonth) {
        // Collections have biggest impact
        const originalDebt = debts.find(d => d.name === payoff.debtName);
        if (originalDebt?.type === 'COLLECTION') {
          monthScore += 30;
        } else if (originalDebt?.type === 'CREDIT_CARD') {
          monthScore += 10;
        } else {
          monthScore += 5;
        }
      }
      
      // Cap score at 850
      simulatedScore = Math.min(850, monthScore);
      
      timeline.push({
        month: month + 1,
        score: Math.round(simulatedScore),
        change: month === 0 ? 0 : Math.round(simulatedScore - timeline[month - 1].score),
        utilization: this._calculateUtilization(debts, paidDown),
        debtsRemaining: payoffPlan.timeline[month]?.debtsRemaining || 0
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)
      });
    }

    return {
<<<<<<< HEAD
      projections,
      finalScore: Math.round(currentScore),
      totalImprovement: Math.round(currentScore - this.currentScore),
      milestones: this.identifyMilestones(projections)
=======
      timeline,
      summary: {
        startingScore: currentScore || 650,
        endingScore: Math.round(simulatedScore),
        totalIncrease: Math.round(simulatedScore - (currentScore || 650)),
        averageMonthlyIncrease: ((simulatedScore - (currentScore || 650)) / payoffPlan.summary.totalMonths).toFixed(1),
        monthsToExcellent: timeline.findIndex(t => t.score >= 740) + 1 || null,
        monthsToGood: timeline.findIndex(t => t.score >= 670) + 1 || null
      }
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)
    };
  }

  /**
<<<<<<< HEAD
   * Identify credit score milestones
   */
  identifyMilestones(projections) {
    const milestones = [
      { score: 580, tier: 'Poor', label: 'Exit Poor Credit' },
      { score: 620, tier: 'Fair', label: 'Enter Fair Credit' },
      { score: 670, tier: 'Good', label: 'Enter Good Credit' },
      { score: 700, tier: 'Good', label: 'Reach 700+ (Prime Lending)' },
      { score: 740, tier: 'Very Good', label: 'Enter Very Good Credit' },
      { score: 800, tier: 'Excellent', label: 'Enter Excellent Credit' }
    ];

    return milestones
      .filter(m => m.score > this.currentScore)
      .map(milestone => {
        const reachMonth = projections.find(p => p.projectedScore >= milestone.score);
        return {
          ...milestone,
          monthsToReach: reachMonth?.month || null,
          dateReached: reachMonth?.date || null
        };
      })
      .filter(m => m.monthsToReach !== null);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FINANCIAL GOAL TRACKER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Track progress toward financial goals
 */
export class FinancialGoalTracker {
  /**
   * Calculate progress toward a financial goal
   */
  static calculateProgress(goal, currentAmount) {
    const percentComplete = (currentAmount / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - currentAmount;

    const monthsElapsed = this.monthsBetween(goal.startDate, new Date());
    const totalMonths = this.monthsBetween(goal.startDate, goal.targetDate);
    const monthsRemaining = totalMonths - monthsElapsed;

    const requiredMonthlyContribution = monthsRemaining > 0
      ? remaining / monthsRemaining
      : remaining;

    const onTrack = currentAmount >= (goal.targetAmount * (monthsElapsed / totalMonths));

    return {
      percentComplete: Math.min(100, percentComplete).toFixed(1),
      amountRemaining: remaining,
      monthsElapsed,
      monthsRemaining: Math.max(0, monthsRemaining),
      requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
      onTrack,
      status: onTrack ? 'On Track' : 'Behind Schedule'
    };
  }

  /**
   * Calculate months between two dates
   */
  static monthsBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DEBT CONSOLIDATION ANALYZER
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Analyze debt consolidation opportunities
 */
export class DebtConsolidationAnalyzer {
  /**
   * Evaluate if debt consolidation is beneficial
   */
  static analyze(debts, consolidationLoanRate, consolidationLoanTerm = 60) {
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const weightedAvgRate = debts.reduce((sum, d) => sum + (d.interestRate * d.balance), 0) / totalDebt;

    // Calculate current total cost
    const currentCalculator = new DebtPayoffCalculator(
      debts,
      debts.reduce((sum, d) => sum + d.minimumPayment, 0),
      'avalanche'
    );
    const currentResult = currentCalculator.calculatePayoffTimeline();

    // Calculate consolidation loan payment
    const monthlyRate = consolidationLoanRate / 100 / 12;
    const consolidationPayment = totalDebt * (monthlyRate * Math.pow(1 + monthlyRate, consolidationLoanTerm)) /
                                  (Math.pow(1 + monthlyRate, consolidationLoanTerm) - 1);

    const totalConsolidationCost = consolidationPayment * consolidationLoanTerm;
    const consolidationInterest = totalConsolidationCost - totalDebt;

    const savings = currentResult.summary.totalInterestPaid - consolidationInterest;
    const monthlySavings = currentResult.summary.monthlyPayment - consolidationPayment;
    const timeSavings = currentResult.summary.totalMonths - consolidationLoanTerm;

    return {
      recommended: savings > 0 && consolidationLoanRate < weightedAvgRate,
      currentScenario: {
        totalInterest: currentResult.summary.totalInterestPaid,
        monthlyPayment: currentResult.summary.monthlyPayment,
        months: currentResult.summary.totalMonths,
        avgRate: weightedAvgRate.toFixed(2)
      },
      consolidationScenario: {
        totalInterest: Math.round(consolidationInterest),
        monthlyPayment: Math.round(consolidationPayment),
        months: consolidationLoanTerm,
        rate: consolidationLoanRate
      },
      savings: {
        totalInterestSavings: Math.round(savings),
        monthlyPaymentSavings: Math.round(monthlySavings),
        timeSavings: timeSavings,
        percentSavings: ((savings / currentResult.summary.totalInterestPaid) * 100).toFixed(1)
      },
      analysis: this.generateConsolidationRecommendation(savings, consolidationLoanRate, weightedAvgRate)
    };
  }

  /**
   * Generate consolidation recommendation
   */
  static generateConsolidationRecommendation(savings, newRate, currentRate) {
    if (savings > 1000 && newRate < currentRate - 2) {
      return {
        recommendation: 'Highly Recommended',
        reason: `You could save $${Math.round(savings).toLocaleString()} in interest with a ${(currentRate - newRate).toFixed(1)}% lower rate.`,
        confidence: 95
      };
    } else if (savings > 500 && newRate < currentRate) {
      return {
        recommendation: 'Recommended',
        reason: `Consolidation will save you $${Math.round(savings).toLocaleString()} and simplify your payments.`,
        confidence: 80
      };
    } else if (savings > 0) {
      return {
        recommendation: 'Consider',
        reason: 'Minor savings possible, but payment simplification may be valuable.',
        confidence: 60
      };
    } else {
      return {
        recommendation: 'Not Recommended',
        reason: 'Current debt payoff strategy is more cost-effective than consolidation.',
        confidence: 90
      };
    }
  }
}

// Export all classes
export default {
  DebtPayoffCalculator,
  BudgetOptimizer,
  CreditScoreProjector,
  FinancialGoalTracker,
  DebtConsolidationAnalyzer
};
>>>>>>> origin/claude/speedycrm-contact-lifecycle-01Nn2nFiLRe5htmGUXvSJ93d
=======
   * Calculate current credit utilization
   * @private
   */
  static _calculateUtilization(debts, paidDown = 0) {
    const creditCards = debts.filter(d => d.type === 'CREDIT_CARD');
    if (creditCards.length === 0) return 0;
    
    const totalBalance = creditCards.reduce((sum, cc) => sum + Math.max(0, cc.balance - paidDown), 0);
    const totalLimit = creditCards.reduce((sum, cc) => sum + (cc.creditLimit || 0), 0);
    
    return totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(1) : 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL GOAL TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export class GoalTracker {
  /**
   * Calculate progress toward financial goal
   */
  static calculateGoalProgress(goal, currentSavings, monthlyContribution) {
    const target = goal.targetAmount || 0;
    const current = currentSavings || 0;
    const monthly = monthlyContribution || 0;
    
    const remaining = Math.max(0, target - current);
    const percentComplete = target > 0 ? (current / target) * 100 : 0;
    
    let monthsToGoal = 0;
    if (monthly > 0 && remaining > 0) {
      monthsToGoal = Math.ceil(remaining / monthly);
    }
    
    const estimatedDate = monthsToGoal > 0 ? 
      format(addMonths(new Date(), monthsToGoal), 'MMMM yyyy') : 
      'Goal Met';

    return {
      current,
      target,
      remaining,
      percentComplete: percentComplete.toFixed(1),
      monthsToGoal,
      estimatedDate,
      onTrack: current >= (target * (goal.timelineMonths ? 
        ((new Date() - new Date(goal.startDate)) / (1000 * 60 * 60 * 24 * 30) / goal.timelineMonths) : 0.5))
    };
  }

  /**
   * Generate milestone achievements
   */
  static generateMilestones(goal, progress) {
    const milestones = [
      { percent: 25, title: 'First Quarter', achieved: progress.percentComplete >= 25 },
      { percent: 50, title: 'Halfway There!', achieved: progress.percentComplete >= 50 },
      { percent: 75, title: 'Three Quarters', achieved: progress.percentComplete >= 75 },
      { percent: 100, title: 'Goal Complete!', achieved: progress.percentComplete >= 100 }
    ];

    return milestones;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMERGENCY FUND CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

export class EmergencyFundCalculator {
  /**
   * Calculate recommended emergency fund size
   */
  static calculateRecommended(monthlyExpenses, employmentStability = 'stable', dependents = 0) {
    let monthsNeeded = 3; // Base recommendation
    
    // Adjust for employment stability
    if (employmentStability === 'unstable' || employmentStability === 'self-employed') {
      monthsNeeded = 6;
    } else if (employmentStability === 'very-stable') {
      monthsNeeded = 3;
    }
    
    // Adjust for dependents
    monthsNeeded += dependents * 0.5;
    
    // Cap at 12 months
    monthsNeeded = Math.min(12, monthsNeeded);
    
    const recommended = monthlyExpenses * monthsNeeded;
    
    return {
      monthsNeeded,
      recommendedAmount: Math.round(recommended),
      minimumAmount: Math.round(monthlyExpenses * 3),
      idealAmount: Math.round(monthlyExpenses * 6)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL CALCULATORS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  DebtPayoffCalculator,
  BudgetOptimizer,
  CreditScoreSimulator,
  GoalTracker,
  EmergencyFundCalculator
};
>>>>>>> f130397 (feat: Add FinancialPlanningHub and TradelineHub with complete integration)
