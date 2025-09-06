import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Create a sample revenueForecasts document
export async function createRevenueForecastSample() {
  const docRef = await addDoc(collection(db, "revenueForecasts"), {
    month: "2025-08",
    createdAt: new Date().toISOString(),
    predictions: {
      conservative: 15000,
      realistic: 22000,
      optimistic: 28000,
    },
    confidence: 0.78,
    breakdown: {
      fromExistingLeads: 18000,
      fromNewLeads: 4000,
      fromReferrals: 0,
    },
    leadContributions: [],
    actualRevenue: 0,
    variance: 0,
    accuracy: null,
  });
  console.log("Sample revenueForecasts document created:", docRef.id);
}

// Create a sample historicalPerformance document
export async function createHistoricalPerformanceSample() {
  const docRef = await addDoc(collection(db, "historicalPerformance"), {
    month: "2025-07",
    metrics: {
      totalLeads: 45,
      convertedLeads: 12,
      conversionRate: 0.267,
      averageRevenue: 1450,
      totalRevenue: 17400,
      averageDaysToConversion: 23,
    },
    leadScorePerformance: {
      "90-100": { conversionRate: 0.85, avgRevenue: 1800 },
      "80-89": { conversionRate: 0.45, avgRevenue: 1400 },
      "70-79": { conversionRate: 0.25, avgRevenue: 1200 },
      "below-70": { conversionRate: 0.1, avgRevenue: 800 },
    },
  });
  console.log("Sample historicalPerformance document created:", docRef.id);
}
