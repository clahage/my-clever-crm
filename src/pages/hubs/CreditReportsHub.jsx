// src/pages/credit/CreditReportsHub.jsx
// ============================================================================
// 📊 CREDIT REPORTS HUB - IDIQ SYSTEM UNIFIED INTERFACE
// ============================================================================
// UPDATED: 2026-01-21 - Changed Enroll Contact to use CompleteEnrollmentFlow
// with contact selection and CRM mode support
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
  Chip,
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
  CloudUpload as UploadIcon,
  Visibility as ViewerIcon,
  AutoAwesome as ReviewIcon,
  DirectionsCar as AutoIcon,
  Link as AffiliateIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HIERARCHY } from '@/layout/navConfig';

// Lazy load components
const IDIQEnrollment = lazy(() => import('../../components/IDIQEnrollment'));
const CompleteEnrollmentFlow = lazy(() => import('../../components/idiq/CompleteEnrollmentFlow'));
const ClientCreditReport = lazy(() => import('../../components/credit/ClientCreditReport'));
const CreditReportWorkflow = lazy(() => import('../../components/credit/CreditReportWorkflow'));
const AIDisputeGenerator = lazy(() => import('../../components/credit/AIDisputeGenerator'));
const CreditMonitoringSystem = lazy(() => import('../../components/credit/CreditMonitoringSystem'));
const CreditScoreOptimizer = lazy(() => import('../hubs/CreditScoreOptimizer'));
const IDIQControlCenter = lazy(() => import('../../components/credit/IDIQControlCenter'));
const IDIQConfig = lazy(() => import('../../components/credit/IDIQConfig'));
// NEW: Credit Report Upload & Viewer components
const CreditReportUploader = lazy(() => import('../../components/credit/CreditReportUploader'));
const CreditReportViewer = lazy(() => import('../../components/credit/CreditReportViewer'));

// NEW: Revenue & Affiliate Integration components
const CreditReviewGenerator = lazy(() => import('../../components/revenue/CreditReviewGenerator'));
const AutoOpportunityDashboard = lazy(() => import('../../components/revenue/AutoOpportunityDashboard'));
const AffiliateLinkManager = lazy(() => import('../../components/revenue/AffiliateLinkManager'));

// Tab configuration - UPDATED: Changed enroll to use CompleteEnrollmentFlow
const TABS = [
  { id: 'upload', label: 'Upload & Parse', icon: UploadIcon, component: 'CreditReportUploader', permission: 'user', badge: 'NEW' },
  { id: 'viewer', label: 'Report Viewer', icon: ViewerIcon, component: 'CreditReportViewer', permission: 'user', badge: 'AI' },
  { id: 'review', label: 'AI Review', icon: ReviewIcon, component: 'CreditReviewGenerator', permission: 'user', badge: 'REV' },
  { id: 'auto', label: 'Auto Financing', icon: AutoIcon, component: 'AutoOpportunityDashboard', permission: 'manager', badge: '$$$' },
  { id: 'affiliates', label: 'Affiliates', icon: AffiliateIcon, component: 'AffiliateLinkManager', permission: 'admin', badge: 'REV' },
  { id: 'enroll', label: 'Enroll Contact', icon: EnrollIcon, component: 'CompleteEnrollmentFlow', permission: 'user' },
  { id: 'reports', label: 'View Reports', icon: ReportIcon, component: 'ClientCreditReport', permission: 'client' },
  { id: 'workflow', label: 'Workflows', icon: WorkflowIcon, component: 'CreditReportWorkflow', permission: 'user' },
  { id: 'disputes', label: 'Disputes', icon: DisputeIcon, component: 'AIDisputeGenerator', permission: 'client' },
  { id: 'monitoring', label: 'Monitoring', icon: MonitorIcon, component: 'CreditMonitoringSystem', permission: 'client' },
  { id: 'optimizer', label: 'Score Optimizer', icon: OptimizerIcon, component: 'CreditScoreOptimizer', permission: 'client', badge: 'AI' },
  { id: 'control', label: 'Control Center', icon: ControlIcon, component: 'IDIQControlCenter', permission: 'admin' },
  { id: 'config', label: 'Settings', icon: ConfigIcon, component: 'IDIQConfig', permission: 'admin' },
];

// Component map for dynamic rendering
const COMPONENT_MAP = {
  CreditReportUploader,
  CreditReportViewer,
  CreditReviewGenerator,
  AutoOpportunityDashboard,
  AffiliateLinkManager,
  CompleteEnrollmentFlow,
  IDIQEnrollment,
  ClientCreditReport,
  CreditReportWorkflow,
  AIDisputeGenerator,
  CreditMonitoringSystem,
  CreditScoreOptimizer,
  IDIQControlCenter,
  IDIQConfig,
};

const CreditReportsHub = () => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'user';
  
  // ===== SELECTED CONTACT STATE (for Enroll Contact tab) =====
  const [selectedContactId, setSelectedContactId] = useState(null);

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

  // ===== ENROLLMENT COMPLETION HANDLER =====
  const handleEnrollmentComplete = (contactId, enrollmentData) => {
    console.log('✅ Enrollment completed:', { contactId, enrollmentData });
    // Clear selected contact after completion
    setSelectedContactId(null);
    // Optionally switch to View Reports tab
    setActiveTab('reports');
  };

  // Get accessible tabs
  const accessibleTabs = TABS.filter(tab => hasPermission(tab.permission));

  // Get active tab config
  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabConfig ? COMPONENT_MAP[activeTabConfig.component] : null;

  // Loading fallback
  const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress size={60} />
    </Box>
  );

  // ===== RENDER COMPONENT WITH PROPS =====
  const renderActiveComponent = () => {
    if (!ActiveComponent) {
      return (
        <Alert severity="warning">
          You don't have permission to access this tab.
        </Alert>
      );
    }

    // Special handling for CompleteEnrollmentFlow - pass CRM mode props
    if (activeTab === 'enroll') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <CompleteEnrollmentFlow
            mode="crm"
            preFilledContactId={selectedContactId}
            onComplete={handleEnrollmentComplete}
            skipCelebration={true}
          />
        </Suspense>
      );
    }

    // Default rendering for other components
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ActiveComponent 
          // Pass contact selection handler to components that might need it
          onSelectContact={(contactId) => {
            setSelectedContactId(contactId);
            setActiveTab('enroll');
          }}
        />
      </Suspense>
    );
  };

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
        {renderActiveComponent()}
      </Box>
    </Box>
  );
};

export default CreditReportsHub;