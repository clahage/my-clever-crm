// RevenuePredictionEngine.js
// Phase 2: Custom rules-based revenue prediction engine for Speedy Credit Repair CRM

/**
 * RevenuePredictionEngine
 * - Calculates lead conversion probability and revenue forecasts
 * - Supports scenario forecasting (conservative, realistic, optimistic)
 * - Applies time decay, follow-up boost, seasonal factors
 */
class RevenuePredictionEngine {
  constructor({ leads, month, year, seasonalMultiplier = 1.0 }) {
    this.leads = leads || [];
    this.month = month;
    this.year = year;
    this.seasonalMultiplier = seasonalMultiplier;
  }

  // Core: Calculate conversion probability for a single lead
  calculateConversionProbability(lead) {
    // AI score (leadScore: 1-10)
    let baseProb = Math.min(Math.max((Number(lead.leadScore) || 5) / 10, 0.1), 0.95);
    // Time decay (weeklyDecayFactor)
    const weeksSinceIntro = this._weeksSince(lead.createdAt);
    const decay = Math.pow(lead?.predictionData?.weeklyDecayFactor || 0.95, weeksSinceIntro);
    // Follow-up boost
    const followUpBoost = 1 + ((lead?.conversionTracking?.followUpCount || 0) * 0.03);
    // Seasonal factor
    const seasonal = lead?.predictionData?.seasonalMultiplier || this.seasonalMultiplier || 1.0;
    // Final probability
    let prob = baseProb * decay * followUpBoost * seasonal;
    prob = Math.max(Math.min(prob, 0.99), 0.01);
    return prob;
  }

  // Core: Estimate revenue for a single lead
  estimateLeadRevenue(lead, scenario = 'realistic') {
    const prob = this.calculateConversionProbability(lead);
    let baseRevenue = lead?.conversionTracking?.revenuePotential || 1200;
    // Scenario adjustment
    let scenarioFactor = 1.0;
    if (scenario === 'conservative') scenarioFactor = 0.7;
    if (scenario === 'optimistic') scenarioFactor = 1.2;
    return Math.round(baseRevenue * prob * scenarioFactor);
  }

  // Generate monthly forecast for all leads
  generateMonthlyForecast(scenario = 'realistic') {
    let totalForecast = 0;
    let details = [];
    for (const lead of this.leads) {
      const revenue = this.estimateLeadRevenue(lead, scenario);
      totalForecast += revenue;
      details.push({
        id: lead.id,
        name: lead.firstName + ' ' + lead.lastName,
        probability: this.calculateConversionProbability(lead),
        estimatedRevenue: revenue,
        scenario,
      });
    }
    return {
      month: this.month,
      year: this.year,
      scenario,
      totalForecast,
      details,
    };
  }

  // Utility: Weeks since intro
  _weeksSince(dateStr) {
    if (!dateStr) return 0;
    const created = new Date(dateStr);
    const now = new Date();
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor((now - created) / msPerWeek);
  }
}

export default RevenuePredictionEngine;
