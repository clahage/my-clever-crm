import React from 'react';
import { motion } from 'framer-motion';

export default function SimpleAnalytics({ openaiStats, myaiStats }) {
  // Simple bar chart data
  const performanceData = [
    { label: 'Lead Quality', value: 92, max: 100, color: 'bg-blue-500' },
    { label: 'Response Time', value: 98, max: 100, color: 'bg-green-500' },
    { label: 'Conversion Rate', value: openaiStats?.conversionRate || 42, max: 100, color: 'bg-purple-500' },
    { label: 'Cost Efficiency', value: 85, max: 100, color: 'bg-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Analytics</h3>
      
      <div className="space-y-4">
        {performanceData.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="font-bold text-gray-900">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                className={`${item.color} h-2.5 rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-white rounded-lg border border-gray-200"
      >
        <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Insights</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Lead quality improved 15% this week</li>
          <li>• Cost per conversion down 8%</li>
          <li>• Peak activity hours: 9AM-11AM, 2PM-4PM</li>
          <li>• Recommend increasing email follow-ups</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}