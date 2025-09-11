import React, { useMemo } from 'react';
import RevenuePredictionEngine from '../utils/RevenuePredictionEngine';

export default function RevenueForecastWidget({ leads, month, year }) {
  // Debug: Log when component is called and what leads data is received
  console.log('[RevenueForecastWidget] called with leads:', leads, 'month:', month, 'year:', year);

  let forecasts;
  try {
    forecasts = useMemo(() => {
      if (!leads || leads.length === 0) {
        console.log('[RevenueForecastWidget] leads is empty or undefined');
        return null;
      }
      const engine = new RevenuePredictionEngine({ leads, month, year });
      const result = {
        conservative: engine.generateMonthlyForecast('conservative'),
        realistic: engine.generateMonthlyForecast('realistic'),
        optimistic: engine.generateMonthlyForecast('optimistic'),
      };
      console.log('[RevenueForecastWidget] forecasts calculated:', result);
      return result;
    }, [leads, month, year]);
  } catch (err) {
    console.error('[RevenueForecastWidget] error in useMemo:', err);
    forecasts = null;
  }

  if (!forecasts) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Revenue Forecast (DEBUG)</h2>
        <div className="text-red-500">Widget loaded, but no forecast available.</div>
        <div className="text-xs text-gray-500">Check console for debug info.</div>
      </div>
    );
  }

  // Confidence: based on spread between scenarios
  const spread = forecasts.optimistic.totalForecast - forecasts.conservative.totalForecast;
  const confidence = spread < 0.2 * forecasts.realistic.totalForecast ? 'High' : spread < 0.4 * forecasts.realistic.totalForecast ? 'Medium' : 'Low';

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <h2 className="text-xl font-semibold mb-2">Revenue Forecast ({month}/{year})</h2>
      <div className="flex flex-col md:flex-row gap-6 items-center mb-2">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-blue-700">${forecasts.realistic.totalForecast.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Realistic</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl text-green-700">${forecasts.optimistic.totalForecast.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Optimistic</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl text-yellow-700">${forecasts.conservative.totalForecast.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Conservative</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-lg font-semibold text-purple-700">Confidence: {confidence}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">Based on {leads.length} leads, scenario spread: ${spread.toLocaleString()}</div>
      <div className="mt-2">
        <strong>Key Metrics:</strong>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          <li>Avg Conversion Probability: {
            leads.length
              ? (
                  leads
                    .map(l => (new RevenuePredictionEngine({ leads: [l], month, year })).calculateConversionProbability(l))
                    .reduce((a, b) => a + b, 0) / leads.length
                ).toFixed(2)
              : '0.00'
          }</li>
          <li>Avg Estimated Revenue per Lead: {
            leads.length
              ? (forecasts.realistic.totalForecast / leads.length).toFixed(2)
              : '0.00'
          }</li>
        </ul>
      </div>
    </div>
  );
}
