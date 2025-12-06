// DebtPayoffCalculator: Clean, validated implementation
export class DebtPayoffCalculator {
  constructor(debts, extraMonthlyPayment = 0) {
    this.debts = this.validateDebts(debts);
    this.extraMonthlyPayment = Math.max(0, extraMonthlyPayment);
    this.cache = {
      snowball: null,
      avalanche: null,
      hybrid: null,
      consolidation: null,
    };
  }

  validateDebts(debts) {
    if (!Array.isArray(debts)) {
      console.warn('⚠️ Debts must be an array, returning empty array');
      return [];
    }
    return debts
      .filter(debt => {
        if (!debt.balance || debt.balance <= 0) return false;
        if (debt.interestRate === undefined || debt.interestRate === null) return false;
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

  calculateSnowball() {
    if (this.cache.snowball) return this.cache.snowball;
    if (this.debts.length === 0) return this.getEmptyPlan('snowball');
    const sortedDebts = [...this.debts].sort((a, b) => a.balance - b.balance);
    const result = this.calculatePayoffPlan(sortedDebts, 'snowball');
    this.cache.snowball = result;
    return result;
  }

  calculateAvalanche() {
    if (this.cache.avalanche) return this.cache.avalanche;
    if (this.debts.length === 0) return this.getEmptyPlan('avalanche');
    const sortedDebts = [...this.debts].sort((a, b) => b.interestRate - a.interestRate);
    const result = this.calculatePayoffPlan(sortedDebts, 'avalanche');
    this.cache.avalanche = result;
    return result;
  }

  calculateHybrid() {
    if (this.cache.hybrid) return this.cache.hybrid;
    if (this.debts.length === 0) return this.getEmptyPlan('hybrid');
    const maxInterest = Math.max(...this.debts.map(d => d.interestRate));
    const maxBalance = Math.max(...this.debts.map(d => d.balance));
    const scoredDebts = this.debts.map(debt => {
      const interestWeight = maxInterest > 0 ? debt.interestRate / maxInterest : 0;
      const balanceWeight = maxBalance > 0 ? 1 - (debt.balance / maxBalance) : 0;
      const hybridScore = (interestWeight * 0.6) + (balanceWeight * 0.4);
      return { ...debt, hybridScore };
    });
    const sortedDebts = scoredDebts.sort((a, b) => b.hybridScore - a.hybridScore);
    const result = this.calculatePayoffPlan(sortedDebts, 'hybrid');
    this.cache.hybrid = result;
    return result;
  }

  calculatePayoffPlan(sortedDebts, strategy) {
    let currentMonth = 0;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    const timeline = [];
    const milestones = [];
    let remainingDebts = sortedDebts.map(debt => ({
      ...debt,
      originalBalance: debt.balance,
      remainingBalance: debt.balance,
      interestPaid: 0,
      principalPaid: 0,
    }));
    const totalDebt = remainingDebts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinimumPayment = remainingDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
    while (remainingDebts.length > 0 && currentMonth < 360) {
      currentMonth++;
      const monthData = {
        month: currentMonth,
        payments: [],
        totalPaid: 0,
        interestPaid: 0,
        principalPaid: 0,
        remainingBalance: 0,
        debtsRemaining: 0,
      };
      remainingDebts.forEach(debt => {
        const monthlyInterestRate = debt.interestRate / 100 / 12;
        const monthlyInterest = debt.remainingBalance * monthlyInterestRate;
        const minimumPayment = Math.min(debt.minimumPayment, debt.remainingBalance + monthlyInterest);
        const principalFromMinimum = Math.max(0, minimumPayment - monthlyInterest);
        debt.remainingBalance -= principalFromMinimum;
        debt.interestPaid += monthlyInterest;
        debt.principalPaid += principalFromMinimum;
        monthData.interestPaid += monthlyInterest;
        monthData.principalPaid += principalFromMinimum;
        monthData.totalPaid += minimumPayment;
        totalInterestPaid += monthlyInterest;
        totalPrincipalPaid += principalFromMinimum;
        monthData.payments.push({
          debtId: debt.id,
          debtName: debt.name,
          payment: minimumPayment,
          principal: principalFromMinimum,
          interest: monthlyInterest,
          remainingBalance: Math.max(0, debt.remainingBalance),
        });
      });
      if (this.extraMonthlyPayment > 0 && remainingDebts.length > 0) {
        const focusDebt = remainingDebts[0];
        const extraPayment = Math.min(this.extraMonthlyPayment, focusDebt.remainingBalance);
        focusDebt.remainingBalance -= extraPayment;
        focusDebt.principalPaid += extraPayment;
        monthData.principalPaid += extraPayment;
        monthData.totalPaid += extraPayment;
        totalPrincipalPaid += extraPayment;
        const focusPayment = monthData.payments.find(p => p.debtId === focusDebt.id);
        if (focusPayment) {
          focusPayment.payment += extraPayment;
          focusPayment.principal += extraPayment;
          focusPayment.remainingBalance = Math.max(0, focusDebt.remainingBalance);
        }
      }
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
      remainingDebts = remainingDebts.filter(d => d.remainingBalance > 0.01);
      monthData.remainingBalance = remainingDebts.reduce((sum, d) => sum + d.remainingBalance, 0);
      monthData.debtsRemaining = remainingDebts.length;
      timeline.push(monthData);
      if (remainingDebts.length === 0) break;
    }
    const months = timeline.length;
    const years = months / 12;
    const totalPaid = totalDebt + totalInterestPaid;
    const avgMonthlyPayment = totalPaid / months;
    // Placeholder for creditImpact calculation
    const creditImpact = [];
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

  // Placeholder methods for future implementation
  calculateCreditImpact(debts, timeline) { return []; }
  calculateConsolidation(consolidationRate, consolidationFee = 0) { return null; }
  getAIRecommendations() { return {}; }
  getConsolidationRecommendation(interestSavings, timeSavings, fee, currentRate, newRate) { return {}; }
  analyzeScenario(newExtraPayment) { return {}; }

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
    return completionDate.toISOString().split('T')[0];
  }
}

// BudgetCalculator: Clean, validated implementation
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
    // Placeholder for actual analysis
    return {};
  }
}

export default {
  DebtPayoffCalculator,
  BudgetCalculator,
};