import React, { useState, useEffect } from 'react';
import {
  Settings, Users, Shield, CreditCard, Zap, Key, Lock,
  HelpCircle, Smartphone, Database, FileText
} from 'lucide-react';
import { Box, Tabs, Tab, Paper, Typography, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GeneralTab from './settings/GeneralTab';
import UsersTab from './settings/UsersTab';
import RolesTab from './settings/RolesTab';
import BillingSettingsTab from './settings/BillingSettingsTab';
import IntegrationsTab from './settings/IntegrationsTab';
import APITab from './settings/APITab';
import SecurityTab from './settings/SecurityTab';
import SupportTab from './settings/SupportTab';
import MobileTab from './settings/MobileTab';
import ActionsTab from './settings/ActionsTab';
import SystemTab from './settings/SystemTab';
import AuditTab from './settings/AuditTab';

const TABS = [
  { id: 'general', label: 'General Settings', icon: Settings, component: GeneralTab, permission: 'admin' },
  { id: 'users', label: 'User Management', icon: Users, component: UsersTab, permission: 'admin' },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield, component: RolesTab, permission: 'admin' },
  { id: 'billing', label: 'Billing Settings', icon: CreditCard, component: BillingSettingsTab, permission: 'admin' },
  { id: 'integrations', label: 'Integrations', icon: Zap, component: IntegrationsTab, permission: 'admin' },
  { id: 'api', label: 'API Keys & Webhooks', icon: Key, component: APITab, permission: 'admin' },
  { id: 'security', label: 'Security & Compliance', icon: Lock, component: SecurityTab, permission: 'admin' },
  { id: 'support', label: 'Support & Help Desk', icon: HelpCircle, component: SupportTab, permission: 'user' },
  { id: 'mobile', label: 'Mobile App Management', icon: Smartphone, component: MobileTab, permission: 'admin' },
  { id: 'actions', label: 'Action Library', icon: Zap, component: ActionsTab, permission: 'admin' },
  { id: 'system', label: 'System Configuration', icon: Database, component: SystemTab, permission: 'masterAdmin' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, component: AuditTab, permission: 'admin' },
];

const SettingsHub = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('settingsHubActiveTab');
    return savedTab || 'general';
  });

  // Filter tabs based on user permissions
  const availableTabs = TABS.filter(tab => {
    if (tab.permission === 'user') return true;
    if (tab.permission === 'admin') return hasPermission('admin');
    if (tab.permission === 'masterAdmin') return hasPermission('masterAdmin');
    return true;
  });

  // Ensure active tab is available to user
  useEffect(() => {
    const isActiveTabAvailable = availableTabs.some(tab => tab.id === activeTab);
    if (!isActiveTabAvailable && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    localStorage.setItem('settingsHubActiveTab', activeTab);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const activeTabConfig = availableTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Settings size={32} />
          <Typography variant="h4" component="h1">
            Administration Hub
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Settings, user management, security, integrations, mobile apps
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
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
              fontWeight: 500,
            },
          }}
        >
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon size={18} />
                    {tab.label}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      <Box>
        {ActiveComponent && <ActiveComponent />}
      </Box>
    </Container>
  );
};

export default SettingsHub;
