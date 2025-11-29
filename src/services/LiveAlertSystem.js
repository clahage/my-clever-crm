// ================================================================================
// LIVE ALERT SYSTEM - REAL-TIME NOTIFICATIONS
// ================================================================================
// Purpose: Comprehensive notification system for pipeline events, conversions,
//          and critical business alerts
// Features: Desktop notifications, mobile push, email, in-app, SMS
// Priority Levels: Critical, High, Medium, Low
// ================================================================================

import { db } from '../lib/firebase';
import { collection, doc, addDoc, updateDoc, query, where, onSnapshot, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import EnhancedPipelineAI from './EnhancedPipelineAIService';

// ================================================================================
// ALERT TYPES & PRIORITIES
// ================================================================================

export const ALERT_TYPES = {
  // Critical Alerts (Immediate notification)
  HIGH_VALUE_LEAD: 'high_value_lead',
  WIN_PROBABILITY_SPIKE: 'win_probability_spike',
  DEAL_HEALTH_CRITICAL: 'deal_health_critical',
  REVENUE_MILESTONE: 'revenue_milestone',
  CONVERSION_EVENT: 'conversion_event',

  // High Priority (Within 15 minutes)
  PIPELINE_STAGE_CHANGE: 'pipeline_stage_change',
  LEAD_SCORE_INCREASE: 'lead_score_increase',
  COMPETITIVE_MENTION: 'competitive_mention',
  BUDGET_CONFIRMED: 'budget_confirmed',

  // Medium Priority (Within 1 hour)
  NEW_LEAD_CAPTURE: 'new_lead_capture',
  ENGAGEMENT_SPIKE: 'engagement_spike',
  FOLLOW_UP_DUE: 'follow_up_due',
  TASK_COMPLETED: 'task_completed',

  // Low Priority (Daily digest)
  PERFORMANCE_METRIC: 'performance_metric',
  WEEKLY_SUMMARY: 'weekly_summary',
  TREND_REPORT: 'trend_report',
  SUCCESS_STORY: 'success_story',
};

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const NOTIFICATION_CHANNELS = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  EMAIL: 'email',
  IN_APP: 'in_app',
  SMS: 'sms',
};

// ================================================================================
// ALERT CONFIGURATION
// ================================================================================

const DEFAULT_THRESHOLDS = {
  highValueLead: 7, // leadScore >= 7
  winProbabilitySpike: 80, // >= 80%
  dealHealthCritical: 50, // < 50 health
  revenueMilestones: [10000, 25000, 50000, 100000],
  urgentFollowUpDays: 14, // days since last contact
  engagementSpikeThreshold: 3, // interactions in 24h
};

const PRIORITY_CHANNELS = {
  [PRIORITY_LEVELS.CRITICAL]: ['desktop', 'mobile', 'sms', 'in_app'],
  [PRIORITY_LEVELS.HIGH]: ['desktop', 'mobile', 'in_app'],
  [PRIORITY_LEVELS.MEDIUM]: ['desktop', 'in_app'],
  [PRIORITY_LEVELS.LOW]: ['in_app', 'email'],
};

// ================================================================================
// LIVE ALERT SYSTEM CLASS
// ================================================================================

class LiveAlertSystem {
  constructor() {
    this.listeners = new Map();
    this.notifications = [];
    this.callbacks = new Map();
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    this.userPreferences = {};
    this.quietHours = { start: '22:00', end: '07:00' };

    // Request notification permission on initialization
    this.requestNotificationPermission();

    // Initialize real-time listeners
    this.initializeListeners();
  }

  // ================================================================================
  // BROWSER NOTIFICATION API
  // ================================================================================

  async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
    } else {
      console.warn('Browser does not support notifications');
    }
  }

  sendDesktopNotification(title, body, data = {}, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Desktop notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Check quiet hours
    if (this.isQuietHours() && data.priority !== PRIORITY_LEVELS.CRITICAL) {
      console.log('Notification suppressed due to quiet hours');
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: options.icon || '/speedycrm-icon.png',
        badge: options.badge || '/speedycrm-badge.png',
        tag: options.tag || data.alertId,
        data,
        requireInteraction: data.priority === PRIORITY_LEVELS.CRITICAL,
        silent: data.priority === PRIORITY_LEVELS.LOW,
        ...options,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to relevant page
        if (data.url) {
          window.location.href = data.url;
        }

        // Mark notification as clicked
        this.markNotificationClicked(data.alertId);

        notification.close();
      };

      // Auto-close after delay based on priority
      const timeout = this.getAutoCloseTimeout(data.priority);
      if (timeout) {
        setTimeout(() => notification.close(), timeout);
      }

      return notification;
    } catch (error) {
      console.error('Error sending desktop notification:', error);
    }
  }

  getAutoCloseTimeout(priority) {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL:
        return null; // Don't auto-close critical
      case PRIORITY_LEVELS.HIGH:
        return 30000; // 30 seconds
      case PRIORITY_LEVELS.MEDIUM:
        return 10000; // 10 seconds
      case PRIORITY_LEVELS.LOW:
        return 5000; // 5 seconds
      default:
        return 10000;
    }
  }

  isQuietHours() {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(this.quietHours.start.replace(':', ''));
    const endTime = parseInt(this.quietHours.end.replace(':', ''));

    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
    return currentTime >= startTime && currentTime <= endTime;
  }

  // ================================================================================
  // REAL-TIME MONITORING & ALERT GENERATION
  // ================================================================================

  initializeListeners() {
    // Monitor pipeline changes
    this.monitorPipelineChanges();

    // Monitor lead score changes
    this.monitorLeadScores();

    // Monitor engagement activity
    this.monitorEngagement();

    // Monitor follow-up needs
    this.monitorFollowUps();

    // Monitor revenue milestones
    this.monitorRevenue();
  }

  monitorPipelineChanges() {
    const q = query(
      collection(db, 'contacts'),
      where('pipelineStage', '!=', null),
      orderBy('updatedAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const newData = change.doc.data();
          const oldData = change.doc.data(); // Would need to cache previous state

          this.checkPipelineAlerts(change.doc.id, newData, oldData);
        }
      });
    });

    this.listeners.set('pipeline', unsubscribe);
  }

  monitorLeadScores() {
    const q = query(
      collection(db, 'contacts'),
      where('leadScore', '>=', this.thresholds.highValueLead),
      orderBy('leadScore', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data();
          this.checkLeadScoreAlerts(change.doc.id, data);
        }
      });
    });

    this.listeners.set('leadScores', unsubscribe);
  }

  monitorEngagement() {
    const q = query(
      collection(db, 'contacts'),
      orderBy('lastInteraction', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          this.checkEngagementAlerts(change.doc.id, data);
        }
      });
    });

    this.listeners.set('engagement', unsubscribe);
  }

  monitorFollowUps() {
    // Check for contacts that need follow-up
    const checkInterval = setInterval(() => {
      this.checkFollowUpNeeds();
    }, 60000); // Check every minute

    this.listeners.set('followUps', () => clearInterval(checkInterval));
  }

  monitorRevenue() {
    const q = query(
      collection(db, 'revenue'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          this.checkRevenueMilestones(data);
        }
      });
    });

    this.listeners.set('revenue', unsubscribe);
  }

  // ================================================================================
  // ALERT CHECKING LOGIC
  // ================================================================================

  async checkPipelineAlerts(contactId, newData, oldData) {
    // Stage advancement
    if (newData.pipelineStage !== oldData?.pipelineStage) {
      await this.createAlert({
        type: ALERT_TYPES.PIPELINE_STAGE_CHANGE,
        priority: PRIORITY_LEVELS.HIGH,
        contactId,
        title: `${newData.name} advanced to ${newData.pipelineStage}`,
        message: `Pipeline stage changed from ${oldData?.pipelineStage || 'new'} to ${newData.pipelineStage}`,
        data: { contactId, newStage: newData.pipelineStage, oldStage: oldData?.pipelineStage },
        url: `/clients?contact=${contactId}`,
      });
    }

    // Win probability spike
    if (newData.winProbability >= this.thresholds.winProbabilitySpike &&
        (oldData?.winProbability || 0) < this.thresholds.winProbabilitySpike) {
      await this.createAlert({
        type: ALERT_TYPES.WIN_PROBABILITY_SPIKE,
        priority: PRIORITY_LEVELS.CRITICAL,
        contactId,
        title: `🎯 High Win Probability: ${newData.name}`,
        message: `Win probability reached ${newData.winProbability}% - ready to close!`,
        data: { contactId, winProbability: newData.winProbability },
        url: `/clients?contact=${contactId}`,
      });
    }

    // Deal health critical
    if (newData.dealHealth < this.thresholds.dealHealthCritical &&
        (oldData?.dealHealth || 100) >= this.thresholds.dealHealthCritical) {
      await this.createAlert({
        type: ALERT_TYPES.DEAL_HEALTH_CRITICAL,
        priority: PRIORITY_LEVELS.CRITICAL,
        contactId,
        title: `🚨 Deal at Risk: ${newData.name}`,
        message: `Deal health dropped to ${newData.dealHealth}% - immediate action needed`,
        data: { contactId, dealHealth: newData.dealHealth },
        url: `/clients?contact=${contactId}`,
      });
    }
  }

  async checkLeadScoreAlerts(contactId, data) {
    if (data.leadScore >= this.thresholds.highValueLead) {
      await this.createAlert({
        type: ALERT_TYPES.HIGH_VALUE_LEAD,
        priority: PRIORITY_LEVELS.CRITICAL,
        contactId,
        title: `🔥 Hot Lead Alert: ${data.name}`,
        message: `Lead score ${data.leadScore}/10 - Contact immediately!`,
        data: { contactId, leadScore: data.leadScore },
        url: `/clients?contact=${contactId}`,
        sound: true,
      });
    }
  }

  async checkEngagementAlerts(contactId, data) {
    // Check for engagement spike (3+ interactions in 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentInteractions = (data.interactions || []).filter(
      i => i.date?.toDate() > last24h
    );

    if (recentInteractions.length >= this.thresholds.engagementSpikeThreshold) {
      await this.createAlert({
        type: ALERT_TYPES.ENGAGEMENT_SPIKE,
        priority: PRIORITY_LEVELS.MEDIUM,
        contactId,
        title: `⚡ Engagement Spike: ${data.name}`,
        message: `${recentInteractions.length} interactions in 24 hours - highly engaged!`,
        data: { contactId, interactions: recentInteractions.length },
        url: `/clients?contact=${contactId}`,
      });
    }
  }

  async checkFollowUpNeeds() {
    try {
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() - this.thresholds.urgentFollowUpDays);

      const q = query(
        collection(db, 'contacts'),
        where('lastInteraction', '<', urgentDate),
        where('status', 'in', ['lead', 'prospect', 'active']),
        limit(10)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        this.createAlert({
          type: ALERT_TYPES.FOLLOW_UP_DUE,
          priority: PRIORITY_LEVELS.MEDIUM,
          contactId: doc.id,
          title: `📞 Follow-up Needed: ${data.name}`,
          message: `No contact in ${this.thresholds.urgentFollowUpDays}+ days`,
          data: { contactId: doc.id, daysSinceContact: Math.floor((Date.now() - data.lastInteraction.toDate()) / (1000 * 60 * 60 * 24)) },
          url: `/clients?contact=${doc.id}`,
        });
      });
    } catch (error) {
      console.error('Error checking follow-ups:', error);
    }
  }

  async checkRevenueMilestones(revenueData) {
    const amount = revenueData.amount || 0;

    // Check if this crosses a milestone
    for (const milestone of this.thresholds.revenueMilestones) {
      if (amount >= milestone && !revenueData.milestoneCelebrated) {
        await this.createAlert({
          type: ALERT_TYPES.REVENUE_MILESTONE,
          priority: PRIORITY_LEVELS.CRITICAL,
          title: `🎉 Revenue Milestone: $${milestone.toLocaleString()}`,
          message: `Congratulations! You've reached $${milestone.toLocaleString()} in revenue!`,
          data: { milestone, amount },
          celebratory: true,
        });

        // Mark milestone as celebrated
        await updateDoc(doc(db, 'revenue', revenueData.id), {
          milestoneCelebrated: true,
        });
      }
    }
  }

  // ================================================================================
  // ALERT CREATION & DISTRIBUTION
  // ================================================================================

  async createAlert(alertConfig) {
    const alert = {
      ...alertConfig,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      clicked: false,
      dismissed: false,
    };

    // Store in Firebase
    try {
      const docRef = await addDoc(collection(db, 'alerts'), {
        ...alert,
        timestamp: serverTimestamp(),
      });
      alert.alertId = docRef.id;
    } catch (error) {
      console.error('Error storing alert:', error);
    }

    // Store locally
    this.notifications.push(alert);

    // Distribute to channels based on priority
    this.distributeAlert(alert);

    // Notify callbacks
    this.notifyCallbacks(alert);

    return alert;
  }

  distributeAlert(alert) {
    const channels = PRIORITY_CHANNELS[alert.priority] || PRIORITY_CHANNELS[PRIORITY_LEVELS.MEDIUM];

    channels.forEach(channel => {
      switch (channel) {
        case NOTIFICATION_CHANNELS.DESKTOP:
          this.sendDesktopNotification(alert.title, alert.message, alert.data, {
            tag: alert.type,
            icon: this.getIconForAlertType(alert.type),
          });
          break;

        case NOTIFICATION_CHANNELS.IN_APP:
          // In-app notifications are handled by callbacks
          break;

        case NOTIFICATION_CHANNELS.MOBILE:
          // Would integrate with push notification service
          this.sendMobilePush(alert);
          break;

        case NOTIFICATION_CHANNELS.EMAIL:
          // Would integrate with email service
          this.sendEmailAlert(alert);
          break;

        case NOTIFICATION_CHANNELS.SMS:
          // Would integrate with SMS service
          this.sendSMSAlert(alert);
          break;
      }
    });
  }

  getIconForAlertType(type) {
    const icons = {
      [ALERT_TYPES.HIGH_VALUE_LEAD]: '🔥',
      [ALERT_TYPES.WIN_PROBABILITY_SPIKE]: '🎯',
      [ALERT_TYPES.DEAL_HEALTH_CRITICAL]: '🚨',
      [ALERT_TYPES.REVENUE_MILESTONE]: '🎉',
      [ALERT_TYPES.PIPELINE_STAGE_CHANGE]: '⚡',
      [ALERT_TYPES.ENGAGEMENT_SPIKE]: '⚡',
      [ALERT_TYPES.FOLLOW_UP_DUE]: '📞',
    };
    return icons[type] || '🔔';
  }

  sendMobilePush(alert) {
    // Integration with Firebase Cloud Messaging or similar
    console.log('Mobile push:', alert.title);
  }

  sendEmailAlert(alert) {
    // Integration with email service
    console.log('Email alert:', alert.title);
  }

  sendSMSAlert(alert) {
    // Integration with SMS service (Twilio/Telnyx)
    console.log('SMS alert:', alert.title);
  }

  // ================================================================================
  // NOTIFICATION MANAGEMENT
  // ================================================================================

  registerCallback(eventType, callback) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    this.callbacks.get(eventType).push(callback);
  }

  unregisterCallback(eventType, callback) {
    if (this.callbacks.has(eventType)) {
      const callbacks = this.callbacks.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyCallbacks(alert) {
    // Notify specific type listeners
    if (this.callbacks.has(alert.type)) {
      this.callbacks.get(alert.type).forEach(callback => callback(alert));
    }

    // Notify all listeners
    if (this.callbacks.has('all')) {
      this.callbacks.get('all').forEach(callback => callback(alert));
    }
  }

  getNotifications(filters = {}) {
    let notifications = [...this.notifications];

    if (filters.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    if (filters.priority) {
      notifications = notifications.filter(n => n.priority === filters.priority);
    }

    if (filters.type) {
      notifications = notifications.filter(n => n.type === filters.type);
    }

    if (filters.limit) {
      notifications = notifications.slice(0, filters.limit);
    }

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  async markAsRead(alertId) {
    const alert = this.notifications.find(n => n.id === alertId || n.alertId === alertId);
    if (alert) {
      alert.read = true;

      // Update in Firebase
      try {
        if (alert.alertId) {
          await updateDoc(doc(db, 'alerts', alert.alertId), { read: true });
        }
      } catch (error) {
        console.error('Error marking alert as read:', error);
      }
    }
  }

  async markNotificationClicked(alertId) {
    const alert = this.notifications.find(n => n.id === alertId || n.alertId === alertId);
    if (alert) {
      alert.clicked = true;
      alert.read = true;

      // Update in Firebase
      try {
        if (alert.alertId) {
          await updateDoc(doc(db, 'alerts', alert.alertId), {
            clicked: true,
            read: true,
            clickedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error marking alert as clicked:', error);
      }
    }
  }

  async dismissNotification(alertId) {
    const index = this.notifications.findIndex(n => n.id === alertId || n.alertId === alertId);
    if (index > -1) {
      this.notifications[index].dismissed = true;

      // Update in Firebase
      try {
        const alert = this.notifications[index];
        if (alert.alertId) {
          await updateDoc(doc(db, 'alerts', alert.alertId), {
            dismissed: true,
            dismissedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error dismissing alert:', error);
      }
    }
  }

  clearAllNotifications() {
    this.notifications = [];
  }

  // ================================================================================
  // CONFIGURATION
  // ================================================================================

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  setQuietHours(start, end) {
    this.quietHours = { start, end };
  }

  setUserPreferences(preferences) {
    this.userPreferences = { ...this.userPreferences, ...preferences };
  }

  // ================================================================================
  // CLEANUP
  // ================================================================================

  dispose() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    this.callbacks.clear();
  }
}

// ================================================================================
// SINGLETON INSTANCE
// ================================================================================

const liveAlertSystem = new LiveAlertSystem();

export default liveAlertSystem;

// ================================================================================
// CONVENIENCE EXPORTS
// ================================================================================

export const createAlert = (config) => liveAlertSystem.createAlert(config);
export const getNotifications = (filters) => liveAlertSystem.getNotifications(filters);
export const markAsRead = (id) => liveAlertSystem.markAsRead(id);
export const dismissNotification = (id) => liveAlertSystem.dismissNotification(id);
export const registerCallback = (type, callback) => liveAlertSystem.registerCallback(type, callback);
export const unregisterCallback = (type, callback) => liveAlertSystem.unregisterCallback(type, callback);
