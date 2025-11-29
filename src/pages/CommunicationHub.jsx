// CommunicationHub.jsx - Unified Communications Management Hub
// Combines: Center, Messages, Email, SMS, Drip, Templates, Call Logs, Notifications

import React, { useState } from 'react';
import CommunicationsCenter from './CommunicationsCenter.jsx';
import Messages from './Messages.jsx';
import Emails from './Emails.jsx';
import SMS from './SMS.jsx';
import DripCampaigns from './DripCampaigns.jsx';
import Templates from './Templates.jsx';
import CallLogs from './CallLogs.jsx';
import Notifications from './Notifications.jsx';
import { Tabs, Tab, Box } from '@mui/material';

const TAB_CONFIG = [
  { label: 'Center', component: <CommunicationsCenter /> },
  { label: 'Messages', component: <Messages /> },
  { label: 'Email', component: <Emails /> },
  { label: 'SMS', component: <SMS /> },
  { label: 'Drip Campaigns', component: <DripCampaigns /> },
  { label: 'Templates', component: <Templates /> },
  { label: 'Call Logs', component: <CallLogs /> },
  { label: 'Notifications', component: <Notifications /> },
];

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Communication Hub Tabs"
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
// - Each tab integrates a major communication feature from previous separate files.
// - All unique logic and UI preserved.
// - Save after each major merge step.
