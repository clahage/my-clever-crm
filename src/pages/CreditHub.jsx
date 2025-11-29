// CreditHub.jsx - Unified Credit Management Hub
// Combines: Intake, Simulation, History, Reports, Business Credit, Monitoring

import React, { useState } from 'react';
import CreditReportWorkflow from './CreditReportWorkflow.jsx';
import CreditSimulator from './CreditSimulator.jsx';
import CreditScores from './CreditScores.jsx';
import ClientReports from './ClientReports.jsx';
import BusinessCredit from './BusinessCredit.jsx';
import CreditMonitoring from './CreditMonitoring.jsx';
import { Tabs, Tab, Box } from '@mui/material';

const TAB_CONFIG = [
  { label: 'Intake/Workflow', component: <CreditReportWorkflow /> },
  { label: 'Score Simulation', component: <CreditSimulator /> },
  { label: 'Score History', component: <CreditScores /> },
  { label: 'Reports', component: <ClientReports /> },
  { label: 'Business Credit', component: <BusinessCredit /> },
  { label: 'Monitoring', component: <CreditMonitoring /> },
];

export default function CreditHub() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Credit Hub Tabs"
        sx={{ mb: 2 }}
      >
        {TAB_CONFIG.map((tab, idx) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {TAB_CONFIG[activeTab].component}
      </Box>
    </Box>
  );
}

// Documentation:
// - Each tab integrates a major credit feature from previous separate files.
// - Redundant/placeholder files (ScoreSimulator.jsx, Simulator.jsx) can be removed.
// - All unique logic and UI preserved.
// - Save after each major merge step.
