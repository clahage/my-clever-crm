import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AIActivityWidget() {
  const [activity, setActivity] = useState([]);
  
  useEffect(() => {
    // Simulate real-time activity
    const initialActivity = [
      { type: 'OpenAI', action: 'Lead Scored', status: 'success', cost: 0.012, timestamp: new Date(Date.now() - 300000) },
      { type: 'MyAI', action: 'Call Received', status: 'success', cost: 0, timestamp: new Date(Date.now() - 240000) },
      { type: 'OpenAI', action: 'Email Generated', status: 'success', cost: 0.008, timestamp: new Date(Date.now() - 180000) },
      { type: 'MyAI', action: 'Lead Converted', status: 'success', cost: 0, timestamp: new Date(Date.now() - 120000) },
    ];
    setActivity(initialActivity);
    
    const interval = setInterval(() => {
      const actions = [
        { type: 'OpenAI', action: 'Lead Scored', cost: 0.01 + Math.random() * 0.02 },
        { type: 'OpenAI', action: 'Email Generated', cost: 0.005 + Math.random() * 0.01 },
        { type: 'MyAI', action: 'Call Received', cost: 0 },
        { type: 'MyAI', action: 'Webhook Triggered', cost: 0 },
        { type: 'System', action: 'Lead Converted', cost: 0 },
      ];
      
      const newAction = {
        ...actions[Math.floor(Math.random() * actions.length)],
        status: Math.random() > 0.1 ? 'success' : 'failed',
        timestamp: new Date()
      };
      
      setActivity(prev => [newAction, ...prev].slice(0, 8));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const totalCost = activity
    .filter(a => a.type === 'OpenAI')
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Live AI Activity</h3>
        <span className="text-sm font-medium text-blue-600">
          Cost: ${totalCost.toFixed(4)}
        </span>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activity.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <span className={`w-2 h-2 rounded-full ${
                item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <span className="font-medium text-sm text-gray-700">{item.type}</span>
                <span className="text-xs text-gray-500 ml-2">{item.action}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {item.timestamp.toLocaleTimeString()}
              </div>
              {item.cost > 0 && (
                <div className="text-xs font-medium text-blue-600">
                  ${item.cost.toFixed(4)}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}