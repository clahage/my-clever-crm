import React from 'react';
import AIIntelligenceDashboard from '../components/AIIntelligenceDashboard';

export default function AICommandCenter() {
  // Demo: Replace with real stats from backend/services
  const openaiStats = {
    costToday: 0.23,
    accuracy: 98,
    conversionRate: 42,
    emailsSent: 12,
  };
  const myaiStats = {
    uptime: '100%',
  };
  return <AIIntelligenceDashboard openaiStats={openaiStats} myaiStats={myaiStats} />;
}
