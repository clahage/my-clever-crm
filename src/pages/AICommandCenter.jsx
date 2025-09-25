import React from 'react';
import AIIntelligenceDashboard from '../components/AIIntelligenceDashboard';

export default function AICommandCenter() {
  // Real-time stats - you can connect to Firebase later
  const openaiStats = {
    costToday: 0.23,
    accuracy: 98,
    conversionRate: 42,
    emailsSent: 12,
  };
  
  const myaiStats = {
    uptime: '100%',
    callsProcessed: 47,
    leadsGenerated: 18
  };
  
  return (
    <div className="p-6">
      <AIIntelligenceDashboard openaiStats={openaiStats} myaiStats={myaiStats} />
    </div>
  );
}