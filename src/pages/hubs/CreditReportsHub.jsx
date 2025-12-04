// src/pages/credit/CreditReportsHub.jsx
// ============================================================================
// 📊 CREDIT REPORTS HUB - IDIQ SYSTEM UNIFIED INTERFACE
// ============================================================================

import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Shield as ShieldIcon,
  PersonAdd as EnrollIcon,
  Assessment as ReportIcon,
  Workspaces as WorkflowIcon,
  Gavel as DisputeIcon,
  Timeline as MonitorIcon,
  Dashboard as ControlIcon,
  Settings as ConfigIcon,
  TrendingUp as OptimizerIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HIERARCHY } from '@/layout/navConfig';

// Lazy load components
const IDIQEnrollment = lazy(() => import('../../components/credit/IDIQEnrollment'));
const ClientCreditReport = lazy(() => import('../../components/credit/ClientCreditReport'));
const CreditReportWorkflow = lazy(() => import('../../components/credit/CreditReportWorkflow'));
const AIDisputeGenerator = lazy(() => import('../../components/credit/AIDisputeGenerator'));
const CreditMonitoringSystem = lazy(() => import('../../components/credit/CreditMonitoringSystem'));
const CreditScoreOptimizer = lazy(() => import('../hubs/CreditScoreOptimizer'));
const IDIQControlCenter = lazy(() => import('../../components/credit/IDIQControlCenter'));
const IDIQConfig = lazy(() => import('../../components/credit/IDIQConfig'));

// Tab configuration
const TABS = [
  { id: 'enroll', label: 'Enroll Client', icon: EnrollIcon, component: IDIQEnrollment, permission: 'user' },
  { id: 'reports', label: 'View Reports', icon: ReportIcon, component: ClientCreditReport, permission: 'client' },
  { id: 'workflow', label: 'Workflows', icon: WorkflowIcon, component: CreditReportWorkflow, permission: 'user' },
  { id: 'disputes', label: 'Disputes', icon: DisputeIcon, component: AIDisputeGenerator, permission: 'client' },
  { id: 'monitoring', label: 'Monitoring', icon: MonitorIcon, component: CreditMonitoringSystem, permission: 'client' },
  { id: 'optimizer', label: 'Score Optimizer', icon: OptimizerIcon, component: CreditScoreOptimizer, permission: 'client', badge: 'AI' },
  { id: 'control', label: 'Control Center', icon: ControlIcon, component: IDIQControlCenter, permission: 'admin' },
  { id: 'config', label: 'Settings', icon: ConfigIcon, component: IDIQConfig, permission: 'admin' },
];

const CreditReportsHub = () => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';

  // Permission check function - DEFINED FIRST
  const hasPermission = (requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 5;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 5;
    return userLevel >= requiredLevel;
  };

  // Get initial tab - USES hasPermission
  const getInitialTab = () => {
    const saved = localStorage.getItem('creditHubActiveTab');
    if (saved) {
      const savedTab = TABS.find(t => t.id === saved);
      if (savedTab && hasPermission(savedTab.permission)) {
        return saved;
      }
    }
    const firstAccessible = TABS.find(t => hasPermission(t.permission));
    return firstAccessible?.id || 'enroll';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    const tab = TABS.find(t => t.id === newValue);
    if (tab && hasPermission(tab.permission)) {
      setActiveTab(newValue);
      localStorage.setItem('creditHubActiveTab', newValue);
    }
  };

  // Get accessible tabs
  const accessibleTabs = TABS.filter(tab => hasPermission(tab.permission));

  // Get active component
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  // Loading fallback
  const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress size={60} />
    </Box>
  );

  return (
    <Box className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #5e35b1 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'white',
              color: 'primary.main',
              mr: 2,
            }}
          >
            <ShieldIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Credit Reports Hub
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Complete IDIQ credit management system
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 72,
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          {accessibleTabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={<IconComponent />}
                iconPosition="start"
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {ActiveComponent ? (
          <Suspense fallback={<LoadingFallback />}>
            <ActiveComponent />
          </Suspense>
        ) : (
          <Alert severity="warning">
            You don't have permission to access this tab.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default CreditReportsHub;