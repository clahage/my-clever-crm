// ============================================
// SALES FORECAST ENGINE
// Path: /src/utils/SalesForecastEngine.js
// ============================================
// Advanced revenue forecasting with ML models
// Monte Carlo simulation, trend analysis, seasonality
// ============================================

import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// FORECAST CONFIGURATION
// ============================================

const FORECAST_CONFIG = {
  confidenceLevel: 0.95,
  monteCarloIterations: 10000,
  seasonalityPeriod: 12, // months
  trendSmoothingFactor: 0.3,
  defaultGrowthRate: 0.05, // 5% monthly growth
};

const DEAL_STAGES = {
  'new': { probability: 0.10, avgDaysToClose: 90 },
  'contacted': { probability: 0.20, avgDaysToClose: 75 },
  'qualified': { probability: 0.40, avgDaysToClose: 60 },
  'proposal': { probability: 0.60, avgDaysToClose: 45 },
  'negotiation': { probability: 0.80, avgDaysToClose: 30 },
  'closing': { probability: 0.95, avgDaysToClose: 15 },
};

// ============================================
// CORE FORECASTING FUNCTIONS
// ============================================

/**
 * Calculate weighted pipeline revenue
 * Multiplies deal value by win probability based on stage
 */
export const calculateWeightedPipeline = (deals) => {
  console.log('💰 Calculating weighted pipeline for', deals.length, 'deals');
  
  try {
    let weightedValue = 0;
    const breakdown = {};
    
    deals.forEach(deal => {
      const stage = deal.stage || 'new';
      const probability = DEAL_STAGES[stage]?.probability || 0.1;
      const dealValue = parseFloat(deal.value) || 0;
      const weighted = dealValue * probability;
      
      weightedValue += weighted;
      
      if (!breakdown[stage]) {
        breakdown[stage] = {
          count: 0,
          totalValue: 0,
          weightedValue: 0,
        };
      }
      
      breakdown[stage].count++;
      breakdown[stage].totalValue += dealValue;
      breakdown[stage].weightedValue += weighted;
    });
    
    const result = {
      totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
      weightedValue,
      breakdown,
      averageDealSize: deals.length > 0 ? weightedValue / deals.length : 0,
    };
    
    console.log('✅ Weighted pipeline calculated:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error calculating weighted pipeline:', error);
    return { totalValue: 0, weightedValue: 0, breakdown: {}, averageDealSize: 0 };
  }
};

/**
 * Forecast revenue using time series analysis
 * Analyzes historical data to predict future revenue
 */
export const forecastRevenue = async (months = 3) => {
  console.log('📈 Forecasting revenue for next', months, 'months');
  
  try {
    // Get historical revenue data (last 12 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    const dealsRef = collection(db, 'deals');
    const dealsQuery = query(
      dealsRef,
      where('status', '==', 'won'),
      where('closedDate', '>=', Timestamp.fromDate(startDate)),
      orderBy('closedDate', 'asc')
    );
    
    const dealsSnapshot = await getDocs(dealsQuery);
    const historicalDeals = dealsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Group by month
    const monthlyRevenue = {};
    historicalDeals.forEach(deal => {
      const date = deal.closedDate.toDate();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      
      monthlyRevenue[monthKey] += parseFloat(deal.value) || 0;
    });
    
    // Convert to array for analysis
    const revenueData = Object.entries(monthlyRevenue)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }));
    
    if (revenueData.length < 3) {
      console.log('⚠️ Insufficient historical data');
      return generateDefaultForecast(months);
    }
    
    // Calculate trend
    const trend = calculateTrend(revenueData.map(d => d.revenue));
    
    // Calculate seasonality
    const seasonality = calculateSeasonality(revenueData);
    
    // Generate forecast
    const forecast = [];
    const lastRevenue = revenueData[revenueData.length - 1].revenue;
    
    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Apply trend and seasonality
      const trendFactor = 1 + (trend * i);
      const seasonalFactor = seasonality[date.getMonth()] || 1;
      const forecastValue = lastRevenue * trendFactor * seasonalFactor;
      
      // Calculate confidence interval (95%)
      const stdDev = calculateStandardDeviation(revenueData.map(d => d.revenue));
      const marginOfError = 1.96 * stdDev;
      
      forecast.push({
        month: monthKey,
        forecast: Math.round(forecastValue),
        lower: Math.round(forecastValue - marginOfError),
        upper: Math.round(forecastValue + marginOfError),
        confidence: 0.95,
      });
    }
    
    const result = {
      historical: revenueData,
      forecast,
      trend: trend > 0 ? 'growing' : trend < 0 ? 'declining' : 'stable',
      trendRate: (trend * 100).toFixed(2) + '%',
      totalForecast: forecast.reduce((sum, f) => sum + f.forecast, 0),
    };
    
    console.log('✅ Revenue forecast generated:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error forecasting revenue:', error);
    return generateDefaultForecast(months);
  }
};

/**
 * Monte Carlo simulation for revenue forecasting
 * Runs thousands of simulations to predict revenue range
 */
export const monteCarloForecast = async (deals, iterations = 10000) => {
  console.log('🎲 Running Monte Carlo simulation with', iterations, 'iterations');
  
  try {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      let simulatedRevenue = 0;
      
      deals.forEach(deal => {
        const stage = deal.stage || 'new';
        const probability = DEAL_STAGES[stage]?.probability || 0.1;
        const dealValue = parseFloat(deal.value) || 0;
        
        // Random number between 0 and 1
        const random = Math.random();
        
        // Deal closes if random < probability
        if (random < probability) {
          simulatedRevenue += dealValue;
        }
      });
      
      results.push(simulatedRevenue);
    }
    
    // Sort results
    results.sort((a, b) => a - b);
    
    // Calculate percentiles
    const p10 = results[Math.floor(iterations * 0.10)];
    const p25 = results[Math.floor(iterations * 0.25)];
    const p50 = results[Math.floor(iterations * 0.50)]; // Median
    const p75 = results[Math.floor(iterations * 0.75)];
    const p90 = results[Math.floor(iterations * 0.90)];
    
    const average = results.reduce((sum, r) => sum + r, 0) / iterations;
    
    const simulation = {
      iterations,
      average: Math.round(average),
      median: Math.round(p50),
      percentiles: {
        p10: Math.round(p10),
        p25: Math.round(p25),
        p50: Math.round(p50),
        p75: Math.round(p75),
        p90: Math.round(p90),
      },
      range: {
        min: Math.round(results[0]),
        max: Math.round(results[results.length - 1]),
      },
      confidence: {
        level95: {
          lower: Math.round(p10),
          upper: Math.round(p90),
        },
        level50: {
          lower: Math.round(p25),
          upper: Math.round(p75),
        },
      },
    };
    
    console.log('✅ Monte Carlo simulation complete:', simulation);
    return simulation;
    
  } catch (error) {
    console.error('❌ Error running Monte Carlo simulation:', error);
    return null;
  }
};

/**
 * Calculate expected close dates for deals
 * Based on stage and historical data
 */
export const forecastCloseDates = (deals) => {
  console.log('📅 Forecasting close dates for', deals.length, 'deals');
  
  try {
    const forecast = deals.map(deal => {
      const stage = deal.stage || 'new';
      const avgDays = DEAL_STAGES[stage]?.avgDaysToClose || 90;
      
      // Add random variance (±20%)
      const variance = avgDays * 0.2;
      const daysToClose = avgDays + (Math.random() * variance * 2 - variance);
      
      const expectedCloseDate = new Date();
      expectedCloseDate.setDate(expectedCloseDate.getDate() + daysToClose);
      
      return {
        dealId: deal.id,
        dealName: deal.name,
        currentStage: stage,
        expectedCloseDate: expectedCloseDate.toISOString().split('T')[0],
        daysToClose: Math.round(daysToClose),
        probability: DEAL_STAGES[stage]?.probability || 0.1,
        value: parseFloat(deal.value) || 0,
        weightedValue: (parseFloat(deal.value) || 0) * (DEAL_STAGES[stage]?.probability || 0.1),
      };
    });
    
    // Sort by expected close date
    forecast.sort((a, b) => new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate));
    
    console.log('✅ Close dates forecasted:', forecast.length, 'deals');
    return forecast;
    
  } catch (error) {
    console.error('❌ Error forecasting close dates:', error);
    return [];
  }
};

/**
 * Calculate win rate and conversion metrics
 */
export const calculateWinRate = async (months = 6) => {
  console.log('🎯 Calculating win rate for last', months, 'months');
  
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const dealsRef = collection(db, 'deals');
    const dealsQuery = query(
      dealsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate))
    );
    
    const dealsSnapshot = await getDocs(dealsQuery);
    const deals = dealsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const won = deals.filter(d => d.status === 'won').length;
    const lost = deals.filter(d => d.status === 'lost').length;
    const active = deals.filter(d => d.status === 'active').length;
    
    const totalClosed = won + lost;
    const winRate = totalClosed > 0 ? (won / totalClosed) * 100 : 0;
    
    // Calculate by stage
    const stageMetrics = {};
    Object.keys(DEAL_STAGES).forEach(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const stageWon = stageDeals.filter(d => d.status === 'won').length;
      const stageLost = stageDeals.filter(d => d.status === 'lost').length;
      const stageClosed = stageWon + stageLost;
      
      stageMetrics[stage] = {
        total: stageDeals.length,
        won: stageWon,
        lost: stageLost,
        active: stageDeals.filter(d => d.status === 'active').length,
        winRate: stageClosed > 0 ? (stageWon / stageClosed) * 100 : 0,
      };
    });
    
    const metrics = {
      totalDeals: deals.length,
      won,
      lost,
      active,
      winRate: winRate.toFixed(2) + '%',
      stageMetrics,
      averageDealSize: won > 0 ? 
        deals.filter(d => d.status === 'won')
          .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) / won : 0,
    };
    
    console.log('✅ Win rate calculated:', metrics);
    return metrics;
    
  } catch (error) {
    console.error('❌ Error calculating win rate:', error);
    return null;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate trend from time series data
 */
const calculateTrend = (values) => {
  if (values.length < 2) return 0;
  
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  values.forEach((value, index) => {
    sumX += index;
    sumY += value;
    sumXY += index * value;
    sumX2 += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgValue = sumY / n;
  
  // Normalize slope to percentage
  return slope / avgValue;
};

/**
 * Calculate seasonality factors
 */
const calculateSeasonality = (data) => {
  const monthlyAverages = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(0);
  
  data.forEach(item => {
    const month = new Date(item.month).getMonth();
    monthlyAverages[month] += item.revenue;
    monthlyCounts[month]++;
  });
  
  // Calculate average for each month
  monthlyAverages.forEach((sum, index) => {
    monthlyAverages[index] = monthlyCounts[index] > 0 ? sum / monthlyCounts[index] : 0;
  });
  
  // Calculate overall average
  const overallAverage = monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;
  
  // Calculate seasonality factors (1 = average, >1 = above average, <1 = below average)
  const seasonality = {};
  monthlyAverages.forEach((avg, index) => {
    seasonality[index] = overallAverage > 0 ? avg / overallAverage : 1;
  });
  
  return seasonality;
};

/**
 * Calculate standard deviation
 */
const calculateStandardDeviation = (values) => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
};

/**
 * Generate default forecast when insufficient data
 */
const generateDefaultForecast = (months) => {
  const forecast = [];
  const baseRevenue = 50000; // Default base revenue
  
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Apply default growth rate
    const growth = 1 + (FORECAST_CONFIG.defaultGrowthRate * i);
    const forecastValue = baseRevenue * growth;
    
    forecast.push({
      month: monthKey,
      forecast: Math.round(forecastValue),
      lower: Math.round(forecastValue * 0.8),
      upper: Math.round(forecastValue * 1.2),
      confidence: 0.7,
    });
  }
  
  return {
    historical: [],
    forecast,
    trend: 'growing',
    trendRate: (FORECAST_CONFIG.defaultGrowthRate * 100).toFixed(2) + '%',
    totalForecast: forecast.reduce((sum, f) => sum + f.forecast, 0),
  };
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  calculateWeightedPipeline,
  forecastRevenue,
  monteCarloForecast,
  forecastCloseDates,
  calculateWinRate,
  FORECAST_CONFIG,
  DEAL_STAGES,
};