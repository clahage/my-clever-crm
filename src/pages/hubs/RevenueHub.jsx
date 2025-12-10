// Path: /src/pages/hubs/RevenueHub.jsx
// ============================================================================
// REVENUE HUB - CONSOLIDATED VERSION 4.0
// ============================================================================
// Purpose: Complete revenue management system with 9 organized tabs
// Version: 4.0.0 - Consolidated Architecture
// Last Updated: 2025-12-10
// Part of: Hub Consolidation Phase 2
// Role Access: admin (admin only hub)
// ============================================================================
//
// TABS:
// 1. Revenue Dashboard - Revenue metrics and forecasting
// 2. Billing & Invoices - Invoicing and billing
// 3. Payment Processing - Payment integration and processing
// 4. Collections & AR - Collections management
// 5. Contract Management - Contract lifecycle management
// 6. Affiliates Program - Affiliate partner management
// 7. Referral Engine - Referral tracking and rewards
// 8. Revenue Partnerships - Partnership revenue tracking
// 9. Forecasting - AI revenue predictions
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
  DollarSign,
  LayoutDashboard,
  Receipt,
  CreditCard,
  FileText,
  Handshake,
  Users,
  TrendingUp,
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
    id: 'dashboard',
    label: 'Revenue Dashboard',
    icon: LayoutDashboard,
    component: lazy(() => import('./revenue/DashboardTab')),
    permission: 'admin',
    description: 'Revenue metrics and forecasting'
  },
  {
    id: 'billing',
    label: 'Billing & Invoices',
    icon: Receipt,
    component: lazy(() => import('./revenue/BillingTab')),
    permission: 'admin',
    description: 'Invoicing and billing'
  },
  {
    id: 'payments',
    label: 'Payment Processing',
    icon: CreditCard,
    component: lazy(() => import('./revenue/PaymentsTab')),
    permission: 'admin',
    description: 'Payment integration and processing'
  },
  {
    id: 'collections',
    label: 'Collections & AR',
    icon: DollarSign,
    component: lazy(() => import('./revenue/CollectionsTab')),
    permission: 'admin',
    description: 'Collections management'
  },
  {
    id: 'contracts',
    label: 'Contract Management',
    icon: FileText,
    component: lazy(() => import('./revenue/ContractsTab')),
    permission: 'user',
    description: 'Contract lifecycle management'
  },
  {
    id: 'affiliates',
    label: 'Affiliates Program',
    icon: Handshake,
    component: lazy(() => import('./revenue/AffiliatesTab')),
    permission: 'user',
    description: 'Affiliate partner management'
  },
  {
    id: 'referrals',
    label: 'Referral Engine',
    icon: Users,
    component: lazy(() => import('./revenue/ReferralsTab')),
    permission: 'user',
    description: 'Referral tracking and rewards'
  },
  {
    id: 'partnerships',
    label: 'Revenue Partnerships',
    icon: Handshake,
    component: lazy(() => import('./revenue/PartnershipsTab')),
    permission: 'admin',
    description: 'Partnership revenue tracking'
  },
  {
    id: 'forecasting',
    label: 'Forecasting',
    icon: TrendingUp,
    component: lazy(() => import('./revenue/ForecastingTab')),
    permission: 'admin',
    description: 'AI revenue predictions'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RevenueHub = () => {
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
    const saved = localStorage.getItem('revenueHubActiveTab');
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
      localStorage.setItem('revenueHubActiveTab', newValue);
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
          Revenue Hub
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
          <DollarSign size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Revenue Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revenue analytics, billing, payments, affiliates, contracts
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

export default RevenueHub;
