
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Grid, Chip, CircularProgress } from '@mui/material';
import { Shield, Database, Users, Zap, BarChart3, Settings, DollarSign, Activity } from 'lucide-react';
import StorageIcon from '@mui/icons-material/Storage';
import ServicePlanManager from '../components/admin/ServicePlanManager';
import ActivityLog from '../components/ActivityLog';
import FirestoreManager from '../components/admin/FirestoreManager';
import StorageManager from '../components/admin/StorageManager';
import AuthManager from '../components/admin/AuthManager';

import RealtimeDBManager from '../components/admin/RealtimeDBManager';
import AdminTools from '../components/admin/AdminTools';

function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Example: You can add more state for dashboard stats, etc.

  const handleTabChange = (e, newValue) => setTab(newValue);

  // Sidebar navigation integration (ensure this page is linked in your main nav)
  // This file should be routed as /admin-dashboard or similar, and the sidebar should have a clear "Admin Dashboard" entry.

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        <Shield style={{ verticalAlign: 'middle', marginRight: 8 }} /> Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Master control panel for Firestore, Storage, Auth, Realtime Database, Service Plans, and more.
      </Typography>
      <Paper sx={{ mt: 3, mb: 4 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Database />} label="Firestore" />
          <Tab icon={<StorageIcon />} label="Storage" />
          <Tab icon={<Users />} label="Auth" />
          <Tab icon={<Zap />} label="Realtime DB" />
          <Tab icon={<BarChart3 />} label="Activity Log" />
          <Tab icon={<DollarSign />} label="Service Plans" />
          <Tab icon={<Settings />} label="Admin Tools" />
        </Tabs>
      </Paper>
      <Box>
        {tab === 0 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <FirestoreManager />
          </Paper>
        )}
        {tab === 1 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <StorageManager />
          </Paper>
        )}
        {tab === 2 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <AuthManager />
          </Paper>
        )}
        {tab === 3 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <RealtimeDBManager />
          </Paper>
        )}
        {tab === 4 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Activity Log</Typography>
            <ActivityLog targetType="admin" targetId="dashboard" limit={25} />
          </Paper>
        )}
        {tab === 5 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Service Plan Management</Typography>
            <ServicePlanManager />
          </Paper>
        )}
        {tab === 6 && (
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Admin Tools</Typography>
            <AdminTools />
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default AdminDashboard;
