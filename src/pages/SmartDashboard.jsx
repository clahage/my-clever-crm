// src/pages/SmartDashboard.jsx
// ============================================================================
// 🎯 SMART LANDING DASHBOARD - INTELLIGENT ROLE-BASED ROUTING
// ============================================================================
// Features:
// ✅ Detects user role on load
// ✅ Auto-routes to appropriate dashboard
// ✅ MasterAdmin special feature: View toggle switcher
// ✅ Smooth transitions between views
// ✅ Maintains context when switching
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box, Typography, Paper, ButtonGroup, Button, Chip, Alert,
  Container, Fade, CircularProgress, Card, CardContent
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Crown as CrownIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

// Import dashboard components
import Dashboard from './Dashboard';
import DashboardHub from './hubs/DashboardHub';
import ClientPortal from './ClientPortal';
import Home from './Home';

// ============================================================================
// SMART DASHBOARD COMPONENT
// ============================================================================

const SmartDashboard = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const [activeView, setActiveView] = useState(() => {
    // MasterAdmin can choose view, others get default
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('dashboard-view');
      if (savedView && userProfile?.role === 'masterAdmin') {
        return savedView;
      }
    }
    return null; // Will be set by getRoleDefaultView
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const userRole = userProfile?.role || currentUser?.role || 'user';

  // ============================================================================
  // ROLE-BASED VIEW MAPPING
  // ============================================================================

  const getRoleDefaultView = (role) => {
    const roleMap = {
      masterAdmin: 'admin',
      admin: 'admin',
      manager: 'manager',
      user: 'staff',
      client: 'client',
      prospect: 'prospect',
      affiliate: 'staff',
      viewer: 'staff'
    };
    return roleMap[role] || 'staff';
  };

  // Set initial view based on role
  useEffect(() => {
    if (!loading && userProfile) {
      const defaultView = getRoleDefaultView(userProfile.role);
      if (!activeView) {
        setActiveView(defaultView);
      }
    }
  }, [userProfile, loading]);

  // ============================================================================
  // VIEW SWITCHER HANDLER
  // ============================================================================

  const handleViewSwitch = (view) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView(view);
      localStorage.setItem('dashboard-view', view);
      setIsTransitioning(false);
    }, 300);
  };

  // ============================================================================
  // MASTER ADMIN VIEW SWITCHER COMPONENT
  // ============================================================================

  const ViewSwitcher = () => {
    if (userRole !== 'masterAdmin') return null;

    const views = [
      { id: 'admin', label: 'Admin View', icon: <SettingsIcon sx={{ fontSize: 16 }} />, color: 'error' },
      { id: 'manager', label: 'Manager View', icon: <PeopleIcon sx={{ fontSize: 16 }} />, color: 'warning' },
      { id: 'staff', label: 'Staff View', icon: <PersonIcon sx={{ fontSize: 16 }} />, color: 'info' },
      { id: 'client', label: 'Client View', icon: <StarIcon sx={{ fontSize: 16 }} />, color: 'success' }
    ];

    return (
      <Fade in={true}>
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative background pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 20px)',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CrownIcon sx={{ color: 'gold', fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                Master Admin View Switcher
              </Typography>
              <Chip
                label="MASTER ADMIN"
                size="small"
                sx={{
                  ml: 'auto',
                  bgcolor: 'rgba(255, 215, 0, 0.2)',
                  color: 'gold',
                  fontWeight: 700,
                  border: '1px solid gold'
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
              Switch between different role perspectives to test user experiences
            </Typography>

            <ButtonGroup
              variant="contained"
              size="large"
              sx={{
                width: '100%',
                '& .MuiButton-root': {
                  flex: 1,
                  py: 1.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  transition: 'all 0.3s ease'
                }
              }}
            >
              {views.map((view) => (
                <Button
                  key={view.id}
                  variant={activeView === view.id ? 'contained' : 'outlined'}
                  color={view.color}
                  onClick={() => handleViewSwitch(view.id)}
                  startIcon={view.icon}
                  sx={{
                    bgcolor: activeView === view.id
                      ? 'white'
                      : 'rgba(255,255,255,0.1)',
                    color: activeView === view.id
                      ? `${view.color}.main`
                      : 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: activeView === view.id
                        ? 'white'
                        : 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.5)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    fontWeight: activeView === view.id ? 700 : 500
                  }}
                >
                  {view.label}
                </Button>
              ))}
            </ButtonGroup>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <VisibilityIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Current View: <strong>{views.find(v => v.id === activeView)?.label || 'Loading...'}</strong>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading || !activeView) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Loading Your Dashboard...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preparing your personalized experience
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ============================================================================
  // RENDER APPROPRIATE DASHBOARD
  // ============================================================================

  return (
    <Box sx={{ width: '100%' }}>
      {/* Master Admin View Switcher (only visible to masterAdmin) */}
      <ViewSwitcher />

      {/* View Transition Overlay */}
      {isTransitioning && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Switching view...</Typography>
          </Paper>
        </Box>
      )}

      {/* Render Dashboard Based on Active View */}
      <Fade in={!isTransitioning} timeout={500}>
        <Box>
          {activeView === 'admin' && (
            <Box>
              <Alert severity="info" icon={<DashboardIcon />} sx={{ mb: 2 }}>
                <strong>Admin Dashboard View</strong> - Full system control and management tools
              </Alert>
              <Dashboard />
            </Box>
          )}

          {activeView === 'manager' && (
            <Box>
              <Alert severity="warning" icon={<PeopleIcon />} sx={{ mb: 2 }}>
                <strong>Manager Dashboard View</strong> - Team management and oversight
              </Alert>
              <DashboardHub />
            </Box>
          )}

          {activeView === 'staff' && (
            <Box>
              <Alert severity="info" icon={<PersonIcon />} sx={{ mb: 2 }}>
                <strong>Staff Dashboard View</strong> - Daily operations and tasks
              </Alert>
              <Home />
            </Box>
          )}

          {activeView === 'client' && (
            <Box>
              <Alert severity="success" icon={<StarIcon />} sx={{ mb: 2 }}>
                <strong>Client Portal View</strong> - Client-facing dashboard
              </Alert>
              <ClientPortal />
            </Box>
          )}

          {activeView === 'prospect' && (
            <Box>
              <Alert severity="info" icon={<PersonIcon />} sx={{ mb: 2 }}>
                <strong>Prospect View</strong> - Welcome and onboarding
              </Alert>
              <Home />
            </Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default SmartDashboard;
