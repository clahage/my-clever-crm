import React from 'react';
import { motion } from 'framer-motion';
import AIActivityWidget from '@/components/AIActivityWidget';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

export default function AIIntelligenceDashboard({ openaiStats, myaiStats }) {
  // Demo: Replace with real stats and BI metrics
  const aiKPIs = [
    { label: 'OpenAI API Cost (Today)', value: `$${(openaiStats?.costToday ?? 0).toFixed(4)}` },
    { label: 'OpenAI Lead Scoring Accuracy', value: `${openaiStats?.accuracy ?? 98}%` },
    { label: 'MyAIReceptionist Webhook Uptime', value: `${myaiStats?.uptime ?? '100%'}` },
    { label: 'AI-Driven Conversion Rate', value: `${openaiStats?.conversionRate ?? 42}%` },
    { label: 'AI-Generated Emails Sent', value: openaiStats?.emailsSent ?? 12 },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200"
      style={{ boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)', overflow: 'hidden' }}
      aria-label="AI Intelligence Dashboard"
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-800">AI Intelligence Command Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {aiKPIs.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 + i * 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="text-lg font-bold dark:text-white">{kpi.label}</div>
            <div className="text-2xl dark:text-gray-100">{kpi.value}</div>
          </motion.div>
        ))}
      </div>
      <AIActivityWidget />
      <AdvancedAnalytics />
    </motion.section>
  );
}
