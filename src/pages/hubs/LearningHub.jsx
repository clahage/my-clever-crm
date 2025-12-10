import React, { useState, useEffect } from 'react';
import {
  GraduationCap, LayoutDashboard, BookOpen, Users, CheckSquare,
  Archive, Award, GitBranch, Brain, TrendingUp
} from 'lucide-react';
import { Box, Tabs, Tab, Paper, Typography, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardTab from './learning/DashboardTab';
import CoursesTab from './learning/CoursesTab';
import LiveTab from './learning/LiveTab';
import QuizzesTab from './learning/QuizzesTab';
import KnowledgeBaseTab from './learning/KnowledgeBaseTab';
import ResourcesTab from './learning/ResourcesTab';
import CertificationsTab from './learning/CertificationsTab';
import PathsTab from './learning/PathsTab';
import AITutorTab from './learning/AITutorTab';
import ProgressTab from './learning/ProgressTab';

const TABS = [
  { id: 'dashboard', label: 'Learning Dashboard', icon: LayoutDashboard, component: DashboardTab, permission: 'prospect' },
  { id: 'courses', label: 'Course Library', icon: BookOpen, component: CoursesTab, permission: 'prospect' },
  { id: 'live', label: 'Live Training', icon: Users, component: LiveTab, permission: 'user' },
  { id: 'quizzes', label: 'Quizzes & Assessments', icon: CheckSquare, component: QuizzesTab, permission: 'prospect' },
  { id: 'kb', label: 'Knowledge Base', icon: BookOpen, component: KnowledgeBaseTab, permission: 'prospect' },
  { id: 'resources', label: 'Resource Library', icon: Archive, component: ResourcesTab, permission: 'prospect' },
  { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationsTab, permission: 'user' },
  { id: 'paths', label: 'Learning Paths', icon: GitBranch, component: PathsTab, permission: 'prospect' },
  { id: 'ai-tutor', label: 'AI Tutor', icon: Brain, component: AITutorTab, permission: 'prospect' },
  { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp, component: ProgressTab, permission: 'prospect' },
];

const LearningHub = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('learningHubActiveTab');
    return savedTab || 'dashboard';
  });

  // Filter tabs based on user permissions
  const availableTabs = TABS.filter(tab => {
    if (tab.permission === 'prospect') return true;
    if (tab.permission === 'user') return hasPermission('user');
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
    localStorage.setItem('learningHubActiveTab', activeTab);
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
          <GraduationCap size={32} />
          <Typography variant="h4" component="h1">
            Learning Hub
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Training courses, certifications, knowledge base, AI tutor
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

export default LearningHub;
