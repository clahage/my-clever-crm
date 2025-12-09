// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add notification to state and trigger toast
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast based on type
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, { id });
        break;
      case 'error':
        toast.error(notification.message, { id });
        break;
      case 'warning':
        toast(notification.message, { 
          id,
          icon: '⚠️',
          style: { background: '#fbbf24', color: '#000' }
        });
        break;
      case 'info':
      default:
        toast(notification.message, { 
          id,
          icon: 'ℹ️',
          style: { background: '#3b82f6', color: '#fff' }
        });
        break;
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.dismiss(id);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    toast.dismiss();
  }, []);

  // Convenience methods
  const notify = {
    success: (message, options = {}) => 
      addNotification({ type: 'success', message, ...options }),
    
    error: (message, options = {}) => 
      addNotification({ type: 'error', message, ...options }),
    
    warning: (message, options = {}) => 
      addNotification({ type: 'warning', message, ...options }),
    
    info: (message, options = {}) => 
      addNotification({ type: 'info', message, ...options }),
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notify,
    // Stats
    unreadCount: notifications.filter(n => !n.read).length,
    totalCount: notifications.length
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;