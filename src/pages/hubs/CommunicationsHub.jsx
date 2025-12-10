// Path: /src/pages/hubs/CommunicationsHub.jsx
// ============================================================================
// COMMUNICATIONS HUB - CONSOLIDATED VERSION 1.0
// ============================================================================
// Purpose: Complete communications management system with 12 organized tabs
// Version: 1.0.0
// Last Updated: 2025-12-10
// Part of: Hub Consolidation Phase 2
// Role Access: user+ (employees and above)
// ============================================================================
//
// TABS:
// 1. Email Manager - Send and manage emails
// 2. SMS Manager - SMS messaging system
// 3. Templates - Email and SMS templates
// 4. Marketing Campaigns - Multi-step email campaigns
// 5. Automation - Trigger-based automation
// 6. Social Media - Social media management
// 7. Content & SEO - Content creation and SEO
// 8. Landing Pages - Website and landing pages (admin+)
// 9. Reviews & Reputation - Reputation management
// 10. Push Notifications - Mobile push notifications
// 11. Inbox - Unified communications inbox
// 12. Analytics - Communication metrics
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
  MessageSquare,
  Mail,
  FileText,
  Target,
  Zap,
  Globe,
  Star,
  Bell,
  Inbox,
  BarChart,
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
    id: 'email',
    label: 'Email Manager',
    icon: Mail,
    component: lazy(() => import('./comms/EmailTab')),
    permission: 'user',
    description: 'Send and manage emails'
  },
  {
    id: 'sms',
    label: 'SMS Manager',
    icon: MessageSquare,
    component: lazy(() => import('./comms/SMSTab')),
    permission: 'user',
    description: 'SMS messaging system'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: FileText,
    component: lazy(() => import('./comms/TemplatesTab')),
    permission: 'user',
    description: 'Email and SMS templates'
  },
  {
    id: 'campaigns',
    label: 'Marketing Campaigns',
    icon: Target,
    component: lazy(() => import('./comms/CampaignsTab')),
    permission: 'user',
    description: 'Multi-step email campaigns'
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Zap,
    component: lazy(() => import('./comms/AutomationTab')),
    permission: 'user',
    description: 'Trigger-based automation'
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: Globe,
    component: lazy(() => import('./comms/SocialTab')),
    permission: 'user',
    description: 'Social media management'
  },
  {
    id: 'content',
    label: 'Content & SEO',
    icon: FileText,
    component: lazy(() => import('./comms/ContentTab')),
    permission: 'user',
    description: 'Content creation and SEO'
  },
  {
    id: 'landing',
    label: 'Landing Pages',
    icon: Globe,
    component: lazy(() => import('./comms/LandingTab')),
    permission: 'admin',
    description: 'Website and landing pages'
  },
  {
    id: 'reviews',
    label: 'Reviews & Reputation',
    icon: Star,
    component: lazy(() => import('./comms/ReviewsTab')),
    permission: 'user',
    description: 'Reputation management'
  },
  {
    id: 'push',
    label: 'Push Notifications',
    icon: Bell,
    component: lazy(() => import('./comms/PushTab')),
    permission: 'user',
    description: 'Mobile push notifications'
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    component: lazy(() => import('./comms/InboxTab')),
    permission: 'user',
    description: 'Unified communications inbox'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart,
    component: lazy(() => import('./comms/AnalyticsTab')),
    permission: 'user',
    description: 'Communication metrics'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CommunicationsHub = () => {
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
    const saved = localStorage.getItem('commsHubActiveTab');
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
      localStorage.setItem('commsHubActiveTab', newValue);
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
          Communications Hub
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
          <MessageSquare size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Communications Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email, SMS, campaigns, automation, social media, and unified inbox management
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

export default CommunicationsHub;
