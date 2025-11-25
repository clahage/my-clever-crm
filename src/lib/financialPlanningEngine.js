// Path: /src/lib/financialPlanningEngine.js
// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL PLANNING ENGINE - TIER 3 LOGIC SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

import { addMonths, format, differenceInMonths } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// 1. DEBT PAYOFF CALCULATOR (Full Logic)
// ═══════════════════════════════════════════════════════════════════════════
export class DebtPayoffCalculator {
  static calculateSnowball(debts, monthlyExtra) {
    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'SNOWBALL');
  }

  static calculateAvalanche(debts, monthlyExtra) {
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'AVALANCHE');
  }

  static calculateHybrid(debts, monthlyExtra) {
    // Score based: High Interest (70% weight) + Low Balance (30% weight)
    const sortedDebts = [...debts].sort((a, b) => {
      const aScore = (a.interestRate * 0.7) + ((1 / a.balance) * 1000 * 0.3);
      const bScore = (b.interestRate * 0.7) + ((1 / b.balance) * 1000 * 0.3);
      return bScore - aScore;
    });
    return this._calculatePayoffPlan(sortedDebts, monthlyExtra, 'HYBRID');
  }

  static _calculatePayoffPlan(sortedDebts, monthlyExtra, strategy) {
    const workingDebts = sortedDebts.map(d => ({ 
      ...d, 
      remainingBalance: Number(d.balance),
      interestRate: Number(d.interestRate || d.apr || 0),
      minimumPayment: Number(d.minimumPayment || 0)
    }));

    let currentMonth = 0;
    let totalInterestPaid = 0;
    const timeline = [];
    const milestones = [];

    // Safety brake at 600 months (50 years)
    while (workingDebts.some(d => d.remainingBalance > 0.01) && currentMonth < 600) {
      currentMonth++;
      let extraAvailable = Number(monthlyExtra);
      let monthInterest = 0;
      let monthPrincipal = 0;

      // 1. Apply Minimums & Interest
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          const interest = debt.remainingBalance * (debt.interestRate / 100 / 12);
          const minPay = Math.min(debt.remainingBalance + interest, debt.minimumPayment);
          
          monthInterest += interest;
          debt.remainingBalance += interest;
          debt.remainingBalance -= minPay;
          monthPrincipal += (minPay - interest);
          totalInterestPaid += interest;
        }
      });

      // 2. Apply Extra to Target Debt
      for (const debt of workingDebts) {
        if (debt.remainingBalance > 0 && extraAvailable > 0) {
          const payment = Math.min(extraAvailable, debt.remainingBalance);
          debt.remainingBalance -= payment;
          extraAvailable -= payment;
          monthPrincipal += payment;

          // Check for payoff
          if (debt.remainingBalance <= 0.01) {
            debt.remainingBalance = 0;
            milestones.push({
              month: currentMonth,
              type: 'payoff',
              debtName: debt.name,
              strategy: strategy
            });
          }
        }
      }

      timeline.push({
        month: currentMonth,
        remainingBalance: workingDebts.reduce((sum, d) => sum + d.remainingBalance, 0),
        interestPaid: totalInterestPaid,
        monthPrincipal: monthPrincipal
      });
    }

    return {
      strategy,
      timeline,
      milestones,
      summary: {
        totalMonths: currentMonth,
        years: (currentMonth / 12).toFixed(1),
        totalInterest: totalInterestPaid,
        debtFreeDate: format(addMonths(new Date(), currentMonth), 'MMMM yyyy')
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. BUDGET OPTIMIZER (Full Logic)
// ═══════════════════════════════════════════════════════════════════════════
export class BudgetOptimizer {
  static analyzeBudget(incomeStreams, expenses) {
    const totalIncome = incomeStreams.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Categorization Logic
    const breakdown = {
      needs: 0,
      wants: 0,
      savings: 0,
      categories: {}
    };

    expenses.forEach(exp => {
      // Aggregate by category
      breakdown.categories[exp.category] = (breakdown.categories[exp.category] || 0) + exp.amount;
      
      // Aggregate by Type (Needs/Wants/Savings)
      if (['housing', 'utilities', 'groceries', 'insurance', 'healthcare', 'transportation'].includes(exp.category)) {
        breakdown.needs += exp.amount;
      } else if (['savings', 'investment', 'debt_extra'].includes(exp.category)) {
        breakdown.savings += exp.amount;
      } else {
        breakdown.wants += exp.amount;
      }
    });

    const recommendations = this._generateAIRecommendations(totalIncome, breakdown);

    return {
      totalIncome,
      totalExpenses,
      disposableIncome: totalIncome - totalExpenses,
      breakdown,
      recommendations,
      healthScore: this._calculateHealthScore(totalIncome, breakdown)
    };
  }

  static _generateAIRecommendations(income, breakdown) {
    const recs = [];
    const ratios = {
      needs: (breakdown.needs / income) * 100,
      wants: (breakdown.wants / income) * 100,
      savings: (breakdown.savings / income) * 100
    };

    if (ratios.needs > 50) recs.push({ type: 'warning', text: `Essentials are ${ratios.needs.toFixed(0)}% of income (Target: 50%). Consider reviewing housing or utility costs.` });
    if (ratios.wants > 30) recs.push({ type: 'info', text: `Discretionary spending is ${ratios.wants.toFixed(0)}% (Target: 30%). Look for subscription leaks.` });
    if (ratios.savings < 20) recs.push({ type: 'critical', text: `Savings/Debt Paydown is only ${ratios.savings.toFixed(0)}% (Target: 20%). Increase automated transfers.` });

    return recs;
  }

  static _calculateHealthScore(income, breakdown) {
    let score = 100;
    if (breakdown.needs > income * 0.5) score -= 15;
    if (breakdown.wants > income * 0.3) score -= 10;
    if (breakdown.savings < income * 0.2) score -= 20;
    if (income < (breakdown.needs + breakdown.wants)) score -= 25; // Deficit
    return Math.max(0, score);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. CREDIT SCORE SIMULATOR (Restored)
// ═══════════════════════════════════════════════════════════════════════════
export class CreditScoreSimulator {
  static simulateImpact(currentScore, debts, payoffPlan) {
    // 35% Payment History, 30% Utilization, 15% Length, 10% Mix, 10% New
    const creditCards = debts.filter(d => d.type === 'credit_card');
    const totalLimit = creditCards.reduce((sum, c) => sum + (c.creditLimit || 5000), 0);
    
    const projection = payoffPlan.timeline.map(point => {
      // Calculate utilization for this point in time
      // Approximation: Proportional reduction of CC debt vs Loan debt
      const estimatedCCBalance = point.remainingBalance * (creditCards.length / debts.length); 
      const utilization = totalLimit > 0 ? (estimatedCCBalance / totalLimit) * 100 : 0;
      
      let scoreBoost = 0;
      // Utilization Impact
      if (utilization < 10) scoreBoost += 50;
      else if (utilization < 30) scoreBoost += 30;
      else if (utilization < 50) scoreBoost += 10;
      
      // Time Impact (Payment History consistency)
      scoreBoost += (point.month * 0.5); 

      return {
        month: point.month,
        score: Math.min(850, currentScore + scoreBoost),
        utilization: utilization
      };
    });

    return projection;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. GOAL TRACKER (Restored)
// ═══════════════════════════════════════════════════════════════════════════
export class GoalTracker {
  static calculateGoalProjection(currentAmount, targetAmount, monthlyContribution) {
    if (monthlyContribution <= 0) return { months: Infinity, date: 'Never' };
    const remaining = targetAmount - currentAmount;
    const months = Math.ceil(remaining / monthlyContribution);
    return {
      months,
      date: format(addMonths(new Date(), months), 'MMM yyyy'),
      percentage: (currentAmount / targetAmount) * 100
    };
  }
}

export default { DebtPayoffCalculator, BudgetOptimizer, CreditScoreSimulator, GoalTracker };