// Path: /src/pages/hubs/CreditHub.jsx
// ============================================================================
// CREDIT HUB - CONSOLIDATED VERSION 1.0
// ============================================================================
// Purpose: IDIQ integration, credit monitoring, disputes, bureau communication
// Version: 1.0.0
// Last Updated: 2025-12-10
// Part of: Hub Consolidation Phase 2
// Role Access: client+ (clients and above)
// ============================================================================
//
// TABS:
// 1. IDIQ Enrollment - Enroll clients in IDIQ system
// 2. Credit Reports - View credit reports
// 3. Credit Monitoring - Real-time credit monitoring
// 4. Dispute Management - Create and track disputes
// 5. Dispute Admin - Admin dispute panel (admin+)
// 6. Bureau Communication - Bureau correspondence
// 7. AI Analysis - AI-powered credit analysis
// 8. Workflows - Credit report workflows
// 9. Control Center - IDIQ control center (admin+)
//
// ============================================================================

import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Box,
  Card,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Shield,
  UserPlus,
  FileText,
  Eye,
  AlertCircle,
  Send,
  Brain,
  GitBranch,
  LayoutDashboard,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

const ROLE_HIERARCHY = {
  viewer: 1,
  prospect: 2,
  client: 3,
  affiliate: 4,
  user: 5,
  manager: 6,
  admin: 7,
  masterAdmin: 8
};

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const TABS = [
  {
    id: 'enrollment',
    label: 'IDIQ Enrollment',
    icon: UserPlus,
    component: lazy(() => import('./credit/EnrollmentTab')),
    permission: 'user',
    description: 'Enroll clients in IDIQ system'
  },
  {
    id: 'reports',
    label: 'Credit Reports',
    icon: FileText,
    component: lazy(() => import('./credit/ReportsTab')),
    permission: 'client',
    description: 'View credit reports'
  },
  {
    id: 'monitoring',
    label: 'Credit Monitoring',
    icon: Eye,
    component: lazy(() => import('./credit/MonitoringTab')),
    permission: 'client',
    description: 'Real-time credit monitoring'
  },
  {
    id: 'disputes',
    label: 'Dispute Management',
    icon: AlertCircle,
    component: lazy(() => import('./credit/DisputesTab')),
    permission: 'client',
    description: 'Create and track disputes'
  },
  {
    id: 'disputes-admin',
    label: 'Dispute Admin',
    icon: Shield,
    component: lazy(() => import('./credit/DisputeAdminTab')),
    permission: 'admin',
    description: 'Admin dispute panel'
  },
  {
    id: 'bureau',
    label: 'Bureau Communication',
    icon: Send,
    component: lazy(() => import('./credit/BureauTab')),
    permission: 'user',
    description: 'Bureau correspondence'
  },
  {
    id: 'analysis',
    label: 'AI Analysis',
    icon: Brain,
    component: lazy(() => import('./credit/AnalysisTab')),
    permission: 'client',
    description: 'AI-powered credit analysis'
  },
  {
    id: 'workflow',
    label: 'Workflows',
    icon: GitBranch,
    component: lazy(() => import('./credit/WorkflowTab')),
    permission: 'user',
    description: 'Credit report workflows'
  },
  {
    id: 'control',
    label: 'Control Center',
    icon: LayoutDashboard,
    component: lazy(() => import('./credit/ControlTab')),
    permission: 'admin',
    description: 'IDIQ control center'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreditHub = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = userProfile?.role || 'client';

  // Permission check helper
  const hasPermission = (requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 3;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 3;
    return userLevel >= requiredLevel;
  };

  // Get initial tab from URL or localStorage
  const getInitialTab = () => {
    // Check URL hash for tab
    const hash = location.hash.replace('#', '');
    if (hash) {
      const tabIndex = TABS.findIndex(t => t.id === hash);
      if (tabIndex !== -1 && hasPermission(TABS[tabIndex].permission)) {
        return TABS[tabIndex].id;
      }
    }

    // Check localStorage
    const saved = localStorage.getItem('creditHubActiveTab');
    if (saved) {
      const tabIndex = TABS.findIndex(t => t.id === saved);
      if (tabIndex !== -1 && hasPermission(TABS[tabIndex].permission)) {
        return saved;
      }
    }

    // Return first accessible tab
    const firstAccessible = TABS.find(t => hasPermission(t.permission));
    return firstAccessible ? firstAccessible.id : TABS[0].id;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    const tab = TABS.find(t => t.id === newValue);
    if (tab && hasPermission(tab.permission)) {
      setActiveTab(newValue);
      localStorage.setItem('creditHubActiveTab', newValue);
      // Update URL hash
      window.location.hash = newValue;
    }
  };

  // Filter tabs by permission
  const accessibleTabs = TABS.filter(tab => hasPermission(tab.permission));

  // Get active component
  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  // Update tab when URL changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && hash !== activeTab) {
      const tab = TABS.find(t => t.id === hash);
      if (tab && hasPermission(tab.permission)) {
        setActiveTab(hash);
      }
    }
  }, [location.hash]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/smart-dashboard')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Home size={16} />
          Dashboard
        </Link>
        <Typography variant="body2" color="text.primary">
          Credit Hub
        </Typography>
        {activeTabConfig && (
          <Typography variant="body2" color="text.primary">
            {activeTabConfig.label}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          <Shield size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Credit Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          IDIQ integration, credit monitoring, disputes, bureau communication
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
        >
          {accessibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        }
      >
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <Alert severity="error">
            <Typography variant="body1">
              Tab component not found or you don't have permission to access this tab.
            </Typography>
          </Alert>
        )}
      </Suspense>
    </Box>
  );
};

export default CreditHub;
