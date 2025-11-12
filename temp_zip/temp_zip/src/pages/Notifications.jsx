import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Mail, 
  MessageSquare, 
  Users, 
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  Archive,
  Settings,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  CreditCard,
  Send,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    contactUpdates: true,
    taskReminders: true,
    systemAlerts: true,
    creditAlerts: true,
    paymentAlerts: true
  });

  // Notification type configurations
  const notificationTypes = {
    contact_added: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-100' },
    contact_updated: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    email_sent: { icon: Send, color: 'text-purple-500', bg: 'bg-purple-100' },
    email_received: { icon: Mail, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    task_reminder: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    payment_received: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    credit_alert: { icon: CreditCard, color: 'text-red-500', bg: 'bg-red-100' },
    system_update: { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' },
    document_uploaded: { icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-100' }
  };

  // Load notifications
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      try {
        setLoading(true);
        
        // Create sample notifications if none exist
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            // Create sample notifications for demo
            createSampleNotifications();
          } else {
            const notificationsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setNotifications(notificationsList);
            setFilteredNotifications(notificationsList);
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Create sample notifications on error
        createSampleNotifications();
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [user]);

  // Create sample notifications for demo
  const createSampleNotifications = async () => {
    const sampleNotifications = [
      {
        id: '1',
        type: 'contact_added',
        title: 'New Contact Added',
        message: 'John Smith has been added to your contacts',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        priority: 'low',
        actionUrl: '/contacts',
        userId: user?.uid
      },
      {
        id: '2',
        type: 'email_sent',
        title: 'Email Sent Successfully',
        message: 'Your email to Sarah Johnson was delivered',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        priority: 'low',
        actionUrl: '/emails',
        userId: user?.uid
      },
      {
        id: '3',
        type: 'task_reminder',
        title: 'Task Due Soon',
        message: 'Follow up with client about proposal - Due in 2 hours',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        priority: 'high',
        actionUrl: '/tasks',
        userId: user?.uid
      },
      {
        id: '4',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Payment of $500 received from ABC Company',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        priority: 'medium',
        actionUrl: '/billing',
        userId: user?.uid
      },
      {
        id: '5',
        type: 'credit_alert',
        title: 'Credit Score Update',
        message: 'Client credit score improved by 25 points',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        priority: 'medium',
        actionUrl: '/credit-scores',
        userId: user?.uid
      },
      {
        id: '6',
        type: 'system_update',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight at 2 AM EST',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        priority: 'low',
        actionUrl: null,
        userId: user?.uid
      },
      {
        id: '7',
        type: 'document_uploaded',
        title: 'New Document',
        message: 'Contract_2024.pdf uploaded by Mike Wilson',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        priority: 'medium',
        actionUrl: '/documents',
        userId: user?.uid
      },
      {
        id: '8',
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from support team',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        priority: 'medium',
        actionUrl: '/messages',
        userId: user?.uid
      }
    ];
    
    setNotifications(sampleNotifications);
    setFilteredNotifications(sampleNotifications);
  };

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];
    
    // Read/Unread filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }
    
    setFilteredNotifications(filtered);
  }, [filter, typeFilter, notifications]);

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update in Firebase if not a sample
      if (!notification.id.startsWith('1') && !notification.id.startsWith('2')) {
        const docRef = doc(db, 'notifications', notificationId);
        await updateDoc(docRef, { read: true, readAt: serverTimestamp() });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // Update in Firebase
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        if (!notification.id.startsWith('1') && !notification.id.startsWith('2')) {
          const docRef = doc(db, 'notifications', notification.id);
          await updateDoc(docRef, { read: true, readAt: serverTimestamp() });
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Delete from Firebase if not a sample
      if (!notificationId.startsWith('1') && !notificationId.startsWith('2')) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      // Update local state
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      
      // Delete from Firebase
      for (const notificationId of selectedNotifications) {
        if (!notificationId.startsWith('1') && !notificationId.startsWith('2')) {
          await deleteDoc(doc(db, 'notifications', notificationId));
        }
      }
      
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
    }
  };

  // Toggle selection
  const toggleSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Calculate stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => {
      const date = n.createdAt?.seconds 
        ? new Date(n.createdAt.seconds * 1000) 
        : new Date(n.createdAt);
      return date.toDateString() === new Date().toDateString();
    }).length,
    high: notifications.filter(n => n.priority === 'high' && !n.read).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notifications Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with your latest activities and alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.unread}
              </p>
            </div>
            <div className="relative">
              <Bell className="w-8 h-8 text-blue-400" />
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.today}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.high}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="contact_added">Contacts</option>
              <option value="email_sent">Emails</option>
              <option value="task_reminder">Tasks</option>
              <option value="payment_received">Payments</option>
              <option value="credit_alert">Credit Alerts</option>
              <option value="document_uploaded">Documents</option>
              <option value="message">Messages</option>
              <option value="system_update">System</option>
            </select>
            
            {selectedNotifications.length > 0 && (
              <span className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg">
                {selectedNotifications.length} selected
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {selectedNotifications.length > 0 ? (
              <>
                <button
                  onClick={bulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={markAllAsRead}
                  disabled={stats.unread === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Notification Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter !== 'all' || typeFilter !== 'all' 
                ? 'No notifications match your filters' 
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const typeConfig = notificationTypes[notification.type] || notificationTypes.message;
            const Icon = typeConfig.icon;
            
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
                  notification.read 
                    ? 'border-gray-200 dark:border-gray-700' 
                    : 'border-blue-200 dark:border-blue-800 shadow-sm'
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 rounded border-gray-300 dark:border-gray-600"
                    />
                    
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${typeConfig.bg}`}>
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.createdAt)}
                            </span>
                            {notification.priority && (
                              <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title="View"
                            >
                              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 -rotate-90" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;