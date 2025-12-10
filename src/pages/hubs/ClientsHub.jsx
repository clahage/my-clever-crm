// Path: /src/pages/hubs/ClientsHub.jsx
// ============================================================================
// CLIENTS HUB - CONSOLIDATED VERSION 4.0
// ============================================================================
// Purpose: Complete client management system with 8 organized tabs
// Version: 4.0.0 - Consolidated Architecture
// Last Updated: 2025-12-10
// Part of: Hub Consolidation Phase 2
// Role Access: user+ (employees and above)
// ============================================================================
//
// TABS:
// 1. Overview - Client dashboard and quick actions
// 2. Client List - All clients with search and filters
// 3. Onboarding - Client intake and welcome wizard
// 4. Progress Tracking - Milestones and success metrics
// 5. Documents - Client document management
// 6. Appointments - Scheduling and calendar
// 7. Tasks - Task management per client
// 8. Client Success - Retention and success analytics (manager+)
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
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  FileText,
  Calendar,
  CheckSquare,
  Award,
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
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    component: lazy(() => import('./clients/OverviewTab')),
    permission: 'user',
    description: 'Client dashboard and quick actions'
  },
  {
    id: 'list',
    label: 'Client List',
    icon: Users,
    component: lazy(() => import('./clients/ClientListTab')),
    permission: 'user',
    description: 'All clients with search and filters'
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    icon: UserPlus,
    component: lazy(() => import('./clients/OnboardingTab')),
    permission: 'user',
    description: 'Client intake and welcome wizard'
  },
  {
    id: 'progress',
    label: 'Progress Tracking',
    icon: TrendingUp,
    component: lazy(() => import('./clients/ProgressTab')),
    permission: 'user',
    description: 'Milestones and success metrics'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    component: lazy(() => import('./clients/DocumentsTab')),
    permission: 'user',
    description: 'Client document management'
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    component: lazy(() => import('./clients/AppointmentsTab')),
    permission: 'user',
    description: 'Scheduling and calendar'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    component: lazy(() => import('./clients/TasksTab')),
    permission: 'user',
    description: 'Task management per client'
  },
  {
    id: 'success',
    label: 'Client Success',
    icon: Award,
    component: lazy(() => import('./clients/SuccessTab')),
    permission: 'manager',
    description: 'Retention and success analytics'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClientsHub = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = userProfile?.role || 'user';

  // Permission check helper
  const hasPermission = (requiredRole) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 5;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 5;
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
    const saved = localStorage.getItem('clientsHubActiveTab');
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
      localStorage.setItem('clientsHubActiveTab', newValue);
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
          Clients Hub
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
          <Users size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Clients Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete client management, onboarding, progress tracking, and success analytics
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

export default ClientsHub;
