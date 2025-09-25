import React from 'react';
import { motion } from 'framer-motion';
import AIActivityWidget from './AIActivityWidget';
import SimpleAnalytics from './SimpleAnalytics';

export default function AIIntelligenceDashboard({ openaiStats, myaiStats }) {
  const aiKPIs = [
    { label: 'OpenAI API Cost (Today)', value: `$${(openaiStats?.costToday ?? 0).toFixed(4)}`, color: 'from-blue-500 to-cyan-500' },
    { label: 'Lead Scoring Accuracy', value: `${openaiStats?.accuracy ?? 98}%`, color: 'from-green-500 to-emerald-500' },
    { label: 'AI Receptionist Uptime', value: `${myaiStats?.uptime ?? '100%'}`, color: 'from-purple-500 to-pink-500' },
    { label: 'AI Conversion Rate', value: `${openaiStats?.conversionRate ?? 42}%`, color: 'from-orange-500 to-red-500' },
    { label: 'AI-Generated Emails', value: openaiStats?.emailsSent ?? 12, color: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200"
      style={{ 
        boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)', 
        overflow: 'hidden' 
      }}
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
        🤖 AI Intelligence Command Center
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {aiKPIs.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${kpi.color} text-white rounded-xl p-5 shadow-lg cursor-pointer`}
          >
            <div className="text-sm font-medium opacity-90 mb-2">{kpi.label}</div>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIActivityWidget />
        <SimpleAnalytics openaiStats={openaiStats} myaiStats={myaiStats} />
      </div>
    </motion.section>
  );
}