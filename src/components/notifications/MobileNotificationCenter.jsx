// Path: /src/components/notifications/MobileNotificationCenter.jsx
// ================================================================================
// MOBILE NOTIFICATION CENTER - RESPONSIVE ALERT PANEL
// ================================================================================
// Purpose: Mobile-optimized notification center with real-time alerts
// Features: Live updates, priority sorting, quick actions, swipe gestures
// Mobile-First: Optimized for touch, responsive design, bottom sheet
// ================================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Button,
  Divider,
  SwipeableDrawer,
  Tabs,
  Tab,
  Alert,
  Collapse,
  Fade,
  Slide,
  BottomNavigation,
  BottomNavigationAction,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Bell,
  BellOff,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  Zap,
  Filter,
  Settings,
  ChevronRight,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import liveAlertSystem, { PRIORITY_LEVELS, ALERT_TYPES } from '../../services/LiveAlertSystem';
import { useAuth } from '../../contexts/AuthContext';

// ================================================================================
// MOBILE NOTIFICATION CENTER COMPONENT
// ================================================================================

const MobileNotificationCenter = ({ position = 'bottom' }) => {
  const { currentUser } = useAuth();

  // State
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs
  const audioRef = useRef(null);

  // ================================================================================
  // REAL-TIME NOTIFICATIONS
  // ================================================================================

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Register callback for new alerts
    const handleNewAlert = (alert) => {
      setNotifications(prev => [alert, ...prev]);

      // Play sound for critical alerts
      if (alert.priority === PRIORITY_LEVELS.CRITICAL && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Vibrate for mobile
      if (navigator.vibrate && alert.priority === PRIORITY_LEVELS.CRITICAL) {
        navigator.vibrate([200, 100, 200]);
      }
    };

    liveAlertSystem.registerCallback('all', handleNewAlert);

    return () => {
      liveAlertSystem.unregisterCallback('all', handleNewAlert);
    };
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    const allNotifications = liveAlertSystem.getNotifications({
      limit: 50,
    });
    setNotifications(allNotifications);
    setLoading(false);
  };

  // ================================================================================
  // NOTIFICATION FILTERING
  // ================================================================================

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'critical':
        return notifications.filter(n => n.priority === PRIORITY_LEVELS.CRITICAL);
      case 'high':
        return notifications.filter(n => n.priority === PRIORITY_LEVELS.HIGH);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  // ================================================================================
  // NOTIFICATION ACTIONS
  // ================================================================================

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setDetailsOpen(true);
    liveAlertSystem.markAsRead(notification.id || notification.alertId);

    // Update local state
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate if URL provided
    if (notification.url && !notification.data?.requiresConfirmation) {
      setTimeout(() => {
        window.location.href = notification.url;
      }, 500);
    }
  };

  const handleDismiss = (notification, event) => {
    event.stopPropagation();

    liveAlertSystem.dismissNotification(notification.id || notification.alertId);

    // Remove from local state with animation
    setNotifications(prev =>
      prev.filter(n => n.id !== notification.id)
    );
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        liveAlertSystem.markAsRead(n.id || n.alertId);
      }
    });

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    liveAlertSystem.clearAllNotifications();
  };

  // ================================================================================
  // NOTIFICATION RENDERING
  // ================================================================================

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      size: 24,
      color: getPriorityColor(priority),
    };

    switch (type) {
      case ALERT_TYPES.HIGH_VALUE_LEAD:
        return <Zap {...iconProps} />;
      case ALERT_TYPES.WIN_PROBABILITY_SPIKE:
        return <Target {...iconProps} />;
      case ALERT_TYPES.DEAL_HEALTH_CRITICAL:
        return <AlertCircle {...iconProps} />;
      case ALERT_TYPES.REVENUE_MILESTONE:
        return <Award {...iconProps} />;
      case ALERT_TYPES.PIPELINE_STAGE_CHANGE:
        return <TrendingUp {...iconProps} />;
      case ALERT_TYPES.ENGAGEMENT_SPIKE:
        return <Zap {...iconProps} />;
      case ALERT_TYPES.NEW_LEAD_CAPTURE:
        return <Users {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL:
        return '#F44336';
      case PRIORITY_LEVELS.HIGH:
        return '#FF9800';
      case PRIORITY_LEVELS.MEDIUM:
        return '#2196F3';
      case PRIORITY_LEVELS.LOW:
        return '#4CAF50';
      default:
        return '#607D8B';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL:
        return 'CRITICAL';
      case PRIORITY_LEVELS.HIGH:
        return 'HIGH';
      case PRIORITY_LEVELS.MEDIUM:
        return 'MEDIUM';
      case PRIORITY_LEVELS.LOW:
        return 'LOW';
      default:
        return 'INFO';
    }
  };

  const renderNotificationItem = (notification) => {
    const isUnread = !notification.read;

    return (
      <Slide
        key={notification.id || notification.alertId}
        direction="left"
        in={true}
        mountOnEnter
        unmountOnExit
      >
        <ListItem
          button
          onClick={() => handleNotificationClick(notification)}
          sx={{
            backgroundColor: isUnread ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
            borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
            mb: 1,
            borderRadius: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar
              sx={{
                backgroundColor: `${getPriorityColor(notification.priority)}20`,
                color: getPriorityColor(notification.priority),
              }}
            >
              {getNotificationIcon(notification.type, notification.priority)}
            </Avatar>
          </ListItemAvatar>

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isUnread ? 600 : 400,
                    flex: 1,
                  }}
                >
                  {notification.title}
                </Typography>
                {isUnread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#2196F3',
                    }}
                  />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 0.5,
                  }}
                >
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getPriorityLabel(notification.priority)}
                    size="small"
                    sx={{
                      backgroundColor: `${getPriorityColor(notification.priority)}20`,
                      color: getPriorityColor(notification.priority),
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            }
          />

          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => handleDismiss(notification, e)}
              sx={{ color: 'text.secondary' }}
            >
              <X size={18} />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Slide>
    );
  };

  // ================================================================================
  // FLOATING ACTION BUTTON (MOBILE)
  // ================================================================================

  const renderFloatingButton = () => (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 80, md: 24 },
        right: 24,
        zIndex: 1000,
      }}
    >
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        invisible={unreadCount === 0}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: 3,
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 6,
            },
          }}
        >
          <Bell size={24} />
        </IconButton>
      </Badge>
    </Box>
  );

  // ================================================================================
  // NOTIFICATION DRAWER
  // ================================================================================

  const renderDrawerContent = () => (
    <Box sx={{ width: { xs: '100vw', sm: 400 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Notifications
          </Typography>
          <IconButton color="inherit" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <CheckCircle size={20} />
          </IconButton>
          <IconButton color="inherit" onClick={() => setOpen(false)}>
            <X size={20} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`All (${notifications.length})`} value="all" />
        <Tab
          label={
            <Badge badgeContent={unreadCount} color="error" max={99}>
              Unread
            </Badge>
          }
          value="unread"
        />
        <Tab label="Critical" value="critical" />
      </Tabs>

      {/* Notification List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BellOff size={48} style={{ color: '#ccc', marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You're all caught up!
            </Typography>
          </Box>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map(renderNotificationItem)}
          </List>
        )}
      </Box>

      {/* Footer Actions */}
      {filteredNotifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );

  // ================================================================================
  // NOTIFICATION DETAILS DIALOG
  // ================================================================================

  const renderDetailsDialog = () => (
    <Dialog
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth < 600}
    >
      {selectedNotification && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: `${getPriorityColor(selectedNotification.priority)}20`,
                  color: getPriorityColor(selectedNotification.priority),
                }}
              >
                {getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {selectedNotification.title}
                </Typography>
                <Chip
                  label={getPriorityLabel(selectedNotification.priority)}
                  size="small"
                  sx={{
                    backgroundColor: `${getPriorityColor(selectedNotification.priority)}20`,
                    color: getPriorityColor(selectedNotification.priority),
                    mt: 0.5,
                  }}
                />
              </Box>
              <IconButton onClick={() => setDetailsOpen(false)}>
                <X size={20} />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Typography variant="body1" paragraph>
              {selectedNotification.message}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(selectedNotification.timestamp, { addSuffix: true })}
            </Typography>

            {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Details:
                </Typography>
                <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
                  {Object.entries(selectedNotification.data).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {key}:{' '}
                      </Typography>
                      <Typography variant="caption">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedNotification.url && (
              <Button
                variant="contained"
                endIcon={<ExternalLink size={16} />}
                onClick={() => {
                  window.location.href = selectedNotification.url;
                  setDetailsOpen(false);
                }}
              >
                View Details
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // ================================================================================
  // MAIN RENDER
  // ================================================================================

  return (
    <>
      {/* Hidden audio for notification sounds */}
      <audio ref={audioRef} src="/notification-sound.mp3" preload="auto" />

      {/* Floating Action Button */}
      {renderFloatingButton()}

      {/* Notification Drawer */}
      <SwipeableDrawer
        anchor={position === 'bottom' ? 'bottom' : 'right'}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen={false}
        sx={{
          '& .MuiDrawer-paper': {
            maxHeight: position === 'bottom' ? '80vh' : '100vh',
            borderTopLeftRadius: position === 'bottom' ? 16 : 0,
            borderTopRightRadius: position === 'bottom' ? 16 : 0,
          },
        }}
      >
        {renderDrawerContent()}
      </SwipeableDrawer>

      {/* Notification Details Dialog */}
      {renderDetailsDialog()}
    </>
  );
};

export default MobileNotificationCenter;

// ================================================================================
// INLINE NOTIFICATION BANNER (FOR USE IN HEADER)
// ================================================================================

export const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleNewAlert = (alert) => {
      if (alert.priority === PRIORITY_LEVELS.CRITICAL) {
        setNotifications(prev => [alert, ...prev.slice(0, 2)]);
        setVisible(true);

        // Auto-hide after 10 seconds for non-critical
        if (alert.priority !== PRIORITY_LEVELS.CRITICAL) {
          setTimeout(() => setVisible(false), 10000);
        }
      }
    };

    liveAlertSystem.registerCallback('all', handleNewAlert);

    return () => {
      liveAlertSystem.unregisterCallback('all', handleNewAlert);
    };
  }, []);

  if (!visible || notifications.length === 0) {
    return null;
  }

  const latestAlert = notifications[0];

  return (
    <Collapse in={visible}>
      <Alert
        severity={latestAlert.priority === PRIORITY_LEVELS.CRITICAL ? 'error' : 'warning'}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setVisible(false)}
          >
            <X size={18} />
          </IconButton>
        }
        sx={{ borderRadius: 0 }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {latestAlert.title}
        </Typography>
        <Typography variant="body2">
          {latestAlert.message}
        </Typography>
      </Alert>
    </Collapse>
  );
};
