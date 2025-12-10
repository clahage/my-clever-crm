// Path: /src/pages/hubs/AnalyticsHub.jsx
// ============================================================================
// ANALYTICS HUB - CONSOLIDATED VERSION 4.0
// ============================================================================
// Purpose: Complete analytics and reporting system with 11 organized tabs
// Version: 4.0.0 - Consolidated Architecture
// Last Updated: 2025-12-10
// Part of: Hub Consolidation Phase 2
// Role Access: user+ (employees and above)
// ============================================================================
//
// TABS:
// 1. Executive Dashboard - High-level business metrics (manager+)
// 2. Revenue Analytics - Revenue performance analysis (admin+)
// 3. Client Analytics - Client behavior and metrics (user+)
// 4. Conversion Funnel - Sales funnel optimization (manager+)
// 5. Performance KPIs - Key performance indicators (manager+)
// 6. Predictive Analytics - AI predictions and forecasts (admin+)
// 7. Custom Reports - Build custom reports (user+)
// 8. Mobile Analytics - Mobile app analytics (admin+)
// 9. Engagement - User engagement metrics (user+)
// 10. AI Insights - AI-generated insights (manager+)
// 11. Goal Tracking - Business goals and targets (manager+)
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
  BarChart,
  LayoutDashboard,
  DollarSign,
  Users,
  GitBranch,
  Target,
  Brain,
  FileText,
  Smartphone,
  Activity,
  Sparkles,
  Trophy,
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
    id: 'executive',
    label: 'Executive Dashboard',
    icon: LayoutDashboard,
    component: lazy(() => import('./analytics/ExecutiveTab')),
    permission: 'manager',
    description: 'High-level business metrics'
  },
  {
    id: 'revenue',
    label: 'Revenue Analytics',
    icon: DollarSign,
    component: lazy(() => import('./analytics/RevenueAnalyticsTab')),
    permission: 'admin',
    description: 'Revenue performance analysis'
  },
  {
    id: 'clients',
    label: 'Client Analytics',
    icon: Users,
    component: lazy(() => import('./analytics/ClientAnalyticsTab')),
    permission: 'user',
    description: 'Client behavior and metrics'
  },
  {
    id: 'funnel',
    label: 'Conversion Funnel',
    icon: GitBranch,
    component: lazy(() => import('./analytics/FunnelTab')),
    permission: 'manager',
    description: 'Sales funnel optimization'
  },
  {
    id: 'performance',
    label: 'Performance KPIs',
    icon: Target,
    component: lazy(() => import('./analytics/PerformanceTab')),
    permission: 'manager',
    description: 'Key performance indicators'
  },
  {
    id: 'predictive',
    label: 'Predictive Analytics',
    icon: Brain,
    component: lazy(() => import('./analytics/PredictiveTab')),
    permission: 'admin',
    description: 'AI predictions and forecasts'
  },
  {
    id: 'reports',
    label: 'Custom Reports',
    icon: FileText,
    component: lazy(() => import('./analytics/ReportsTab')),
    permission: 'user',
    description: 'Build custom reports'
  },
  {
    id: 'mobile',
    label: 'Mobile Analytics',
    icon: Smartphone,
    component: lazy(() => import('./analytics/MobileAnalyticsTab')),
    permission: 'admin',
    description: 'Mobile app analytics'
  },
  {
    id: 'engagement',
    label: 'Engagement',
    icon: Activity,
    component: lazy(() => import('./analytics/EngagementTab')),
    permission: 'user',
    description: 'User engagement metrics'
  },
  {
    id: 'ai',
    label: 'AI Insights',
    icon: Sparkles,
    component: lazy(() => import('./analytics/AIInsightsTab')),
    permission: 'manager',
    description: 'AI-generated insights'
  },
  {
    id: 'goals',
    label: 'Goal Tracking',
    icon: Trophy,
    component: lazy(() => import('./analytics/GoalsTab')),
    permission: 'manager',
    description: 'Business goals and targets'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AnalyticsHub = () => {
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
    const saved = localStorage.getItem('analyticsHubActiveTab');
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
      localStorage.setItem('analyticsHubActiveTab', newValue);
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
          Analytics Hub
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
          <BarChart size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Analytics Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Executive dashboard, reports, AI insights, predictive analytics
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

export default AnalyticsHub;
