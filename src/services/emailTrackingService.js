// src/services/emailTrackingService.js
import { db } from '../config/firebase';
import { 
  doc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs,
  increment
} from 'firebase/firestore';

class EmailTrackingService {
  constructor() {
    // Updated to use your deployed Firebase Functions
    this.baseUrl = 'https://us-central1-my-clever-crm.cloudfunctions.net';
    this.pixelEndpoint = '/trackEmailOpen';
    this.clickEndpoint = '/trackEmailClick';
  }

  // Generate unique tracking ID for each email
  generateTrackingId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const userId = localStorage.getItem('userId') || 'anonymous';
    return `${userId}-${timestamp}-${random}`;
  }

  // Create tracking pixel HTML
  createTrackingPixel(emailId, recipientEmail) {
    const trackingId = this.generateTrackingId();
    const pixelUrl = `${this.baseUrl}${this.pixelEndpoint}/${trackingId}`;
    
    // Store tracking data in Firebase
    this.storeTrackingData(trackingId, emailId, recipientEmail);
    
    // Return invisible pixel image
    return {
      trackingId,
      pixelHtml: `<img src="${pixelUrl}" width="1" height="1" style="display:none;border:0;" alt="" />`,
      pixelUrl
    };
  }

  // Store tracking data in Firebase
  async storeTrackingData(trackingId, emailId, recipientEmail) {
    try {
      await addDoc(collection(db, 'emailTracking'), {
        trackingId,
        emailId,
        recipientEmail,
        createdAt: serverTimestamp(),
        opened: false,
        openedAt: null,
        openCount: 0,
        clicked: false,
        clickedAt: null,
        clickCount: 0,
        userAgent: null,
        ipAddress: null,
        location: null,
        device: null
      });
    } catch (error) {
      console.error('Error storing tracking data:', error);
    }
  }

  // Process email open tracking
  async trackEmailOpen(trackingId) {
    try {
      // Find the tracking record
      const q = query(
        collection(db, 'emailTracking'), 
        where('trackingId', '==', trackingId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const trackingDoc = snapshot.docs[0];
        const trackingData = trackingDoc.data();
        
        // Update tracking record
        await updateDoc(doc(db, 'emailTracking', trackingDoc.id), {
          opened: true,
          openedAt: trackingData.openedAt || serverTimestamp(),
          openCount: increment(1),
          lastOpenedAt: serverTimestamp()
        });
        
        // Update the email record
        if (trackingData.emailId) {
          await updateDoc(doc(db, 'emails', trackingData.emailId), {
            opened: true,
            openedAt: trackingData.openedAt || serverTimestamp(),
            openCount: increment(1)
          });
          
          // Log interaction
          await this.logInteraction('email_opened', {
            emailId: trackingData.emailId,
            recipientEmail: trackingData.recipientEmail,
            trackingId
          });
        }
        
        return { success: true, message: 'Email open tracked' };
      }
      
      return { success: false, message: 'Tracking ID not found' };
    } catch (error) {
      console.error('Error tracking email open:', error);
      return { success: false, error: error.message };
    }
  }

  // Track link clicks in emails
  async trackLinkClick(trackingId, linkUrl) {
    try {
      const q = query(
        collection(db, 'emailTracking'), 
        where('trackingId', '==', trackingId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const trackingDoc = snapshot.docs[0];
        const trackingData = trackingDoc.data();
        
        // Update tracking record
        await updateDoc(doc(db, 'emailTracking', trackingDoc.id), {
          clicked: true,
          clickedAt: trackingData.clickedAt || serverTimestamp(),
          clickCount: increment(1),
          lastClickedAt: serverTimestamp(),
          lastClickedLink: linkUrl
        });
        
        // Update email record
        if (trackingData.emailId) {
          await updateDoc(doc(db, 'emails', trackingData.emailId), {
            clicked: true,
            clickedAt: trackingData.clickedAt || serverTimestamp(),
            clickCount: increment(1)
          });
          
          // Log interaction
          await this.logInteraction('email_link_clicked', {
            emailId: trackingData.emailId,
            recipientEmail: trackingData.recipientEmail,
            trackingId,
            linkUrl
          });
        }
        
        return { success: true, message: 'Link click tracked' };
      }
      
      return { success: false, message: 'Tracking ID not found' };
    } catch (error) {
      console.error('Error tracking link click:', error);
      return { success: false, error: error.message };
    }
  }

  // Wrap links in email with tracking
  wrapLinksWithTracking(htmlContent, trackingId) {
    // Regular expression to find all href links
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
    
    return htmlContent.replace(linkRegex, (match, quote, url) => {
      // Don't track unsubscribe links or internal anchors
      if (url.includes('unsubscribe') || url.startsWith('#')) {
        return match;
      }
      
      // Create tracked URL using your Firebase Function
      const trackedUrl = `${this.baseUrl}${this.clickEndpoint}/${trackingId}?url=${encodeURIComponent(url)}`;
      
      return match.replace(url, trackedUrl);
    });
  }

  // Log interaction to the interactions collection
  async logInteraction(type, data) {
    try {
      await addDoc(collection(db, 'interactions'), {
        type,
        timestamp: serverTimestamp(),
        ...data,
        source: 'email_tracking'
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  // Get email statistics for a contact
  async getEmailStats(contactEmail) {
    try {
      const q = query(
        collection(db, 'emails'),
        where('to', '==', contactEmail)
      );
      const snapshot = await getDocs(q);
      
      const stats = {
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        totalReplied: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        lastEmailSent: null,
        lastEmailOpened: null,
        mostRecentActivity: null
      };
      
      snapshot.docs.forEach(doc => {
        const email = doc.data();
        stats.totalSent++;
        if (email.opened) stats.totalOpened++;
        if (email.clicked) stats.totalClicked++;
        if (email.replied) stats.totalReplied++;
        
        if (email.sentAt && (!stats.lastEmailSent || email.sentAt > stats.lastEmailSent)) {
          stats.lastEmailSent = email.sentAt;
        }
        
        if (email.openedAt && (!stats.lastEmailOpened || email.openedAt > stats.lastEmailOpened)) {
          stats.lastEmailOpened = email.openedAt;
        }
      });
      
      if (stats.totalSent > 0) {
        stats.avgOpenRate = (stats.totalOpened / stats.totalSent * 100).toFixed(1);
        stats.avgClickRate = (stats.totalClicked / stats.totalSent * 100).toFixed(1);
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting email stats:', error);
      return null;
    }
  }

  // Get engagement score for a contact based on email interactions
  async calculateEngagementScore(contactEmail) {
    try {
      const stats = await this.getEmailStats(contactEmail);
      
      if (!stats) return 0;
      
      let score = 0;
      
      // Base score from email interactions
      score += stats.totalOpened * 2;  // 2 points per open
      score += stats.totalClicked * 5; // 5 points per click
      score += stats.totalReplied * 10; // 10 points per reply
      
      // Bonus for high engagement rates
      if (stats.avgOpenRate > 50) score += 10;
      if (stats.avgClickRate > 20) score += 15;
      
      // Recency bonus
      if (stats.lastEmailOpened) {
        const daysSinceOpen = Math.floor((Date.now() - stats.lastEmailOpened.toMillis()) / (1000 * 60 * 60 * 24));
        if (daysSinceOpen < 7) score += 20;
        else if (daysSinceOpen < 30) score += 10;
      }
      
      // Cap score at 100
      return Math.min(score, 100);
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  }

  // Batch update tracking data (for webhook processing)
  async processBatchTracking(trackingEvents) {
    const results = [];
    
    for (const event of trackingEvents) {
      try {
        let result;
        
        switch (event.type) {
          case 'open':
            result = await this.trackEmailOpen(event.trackingId);
            break;
          case 'click':
            result = await this.trackLinkClick(event.trackingId, event.url);
            break;
          default:
            result = { success: false, message: 'Unknown event type' };
        }
        
        results.push({ ...event, ...result });
      } catch (error) {
        results.push({ 
          ...event, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Generate email performance report
  async generateEmailReport(startDate, endDate) {
    try {
      const q = query(
        collection(db, 'emails'),
        where('sentAt', '>=', startDate),
        where('sentAt', '<=', endDate)
      );
      
      const snapshot = await getDocs(q);
      
      const report = {
        period: {
          start: startDate,
          end: endDate
        },
        totals: {
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0
        },
        rates: {
          open: 0,
          click: 0,
          reply: 0
        },
        byDay: {},
        byRecipient: {},
        topPerformers: [],
        lowEngagement: []
      };
      
      // Process each email
      snapshot.docs.forEach(doc => {
        const email = doc.data();
        report.totals.sent++;
        
        if (email.opened) report.totals.opened++;
        if (email.clicked) report.totals.clicked++;
        if (email.replied) report.totals.replied++;
        
        // Group by day
        if (email.sentAt) {
          const day = new Date(email.sentAt.toMillis()).toLocaleDateString();
          if (!report.byDay[day]) {
            report.byDay[day] = { sent: 0, opened: 0, clicked: 0 };
          }
          report.byDay[day].sent++;
          if (email.opened) report.byDay[day].opened++;
          if (email.clicked) report.byDay[day].clicked++;
        }
        
        // Group by recipient
        if (!report.byRecipient[email.to]) {
          report.byRecipient[email.to] = { 
            sent: 0, 
            opened: 0, 
            clicked: 0,
            engagement: 0 
          };
        }
        report.byRecipient[email.to].sent++;
        if (email.opened) report.byRecipient[email.to].opened++;
        if (email.clicked) report.byRecipient[email.to].clicked++;
      });
      
      // Calculate rates
      if (report.totals.sent > 0) {
        report.rates.open = (report.totals.opened / report.totals.sent * 100).toFixed(1);
        report.rates.click = (report.totals.clicked / report.totals.sent * 100).toFixed(1);
        report.rates.reply = (report.totals.replied / report.totals.sent * 100).toFixed(1);
      }
      
      // Calculate recipient engagement scores
      Object.keys(report.byRecipient).forEach(recipient => {
        const stats = report.byRecipient[recipient];
        if (stats.sent > 0) {
          stats.engagement = (
            (stats.opened / stats.sent * 0.3) +
            (stats.clicked / stats.sent * 0.7)
          ) * 100;
        }
      });
      
      // Find top performers and low engagement
      const recipients = Object.entries(report.byRecipient)
        .map(([email, stats]) => ({ email, ...stats }))
        .sort((a, b) => b.engagement - a.engagement);
      
      report.topPerformers = recipients.slice(0, 5);
      report.lowEngagement = recipients
        .filter(r => r.engagement < 20 && r.sent > 2)
        .slice(0, 5);
      
      return report;
    } catch (error) {
      console.error('Error generating email report:', error);
      return null;
    }
  }
}

// Export singleton instance
const emailTrackingService = new EmailTrackingService();
export default emailTrackingService;