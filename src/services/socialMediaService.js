import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

class SocialMediaService {
  constructor() {
    this.platforms = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'];
  }

  // Handle incoming webhooks from social platforms
  async handleWebhook(platform, data) {
    try {
      const request = {
        platform,
        type: data.rating ? 'review' : 'message',
        message: data.message || data.text,
        senderName: data.sender?.name || 'Unknown',
        rating: data.rating || null,
        timestamp: serverTimestamp(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'social_requests'), request);

      if (data.rating && data.rating < 4) {
        await this.createAlert(request);
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Social webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create urgent alert for low ratings
  async createAlert(request) {
    const alert = {
      type: 'urgent_review',
      platform: request.platform,
      rating: request.rating,
      message: request.message,
      timestamp: serverTimestamp(),
      status: 'unread'
    };

    return await addDoc(collection(db, 'social_alerts'), alert);
  }

  // Get real stats from Firebase
  async getStats(userId) {
    try {
      // Get total requests
      const requestsQuery = query(
        collection(db, 'social_requests'),
        where('userId', '==', userId)
      );
      const requestsSnap = await getDocs(requestsQuery);
      const totalRequests = requestsSnap.size;

      // Get pending responses
      const pendingQuery = query(
        collection(db, 'social_requests'),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      const pendingSnap = await getDocs(pendingQuery);
      const pendingResponses = pendingSnap.size;

      // Get auto-responded count
      const autoQuery = query(
        collection(db, 'social_requests'),
        where('userId', '==', userId),
        where('autoResponded', '==', true)
      );
      const autoSnap = await getDocs(autoQuery);
      const autoResponded = autoSnap.size;

      // Calculate average response time from completed requests
      let avgResponseTime = 'N/A';
      const completedQuery = query(
        collection(db, 'social_requests'),
        where('userId', '==', userId),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc'),
        limit(50)
      );
      const completedSnap = await getDocs(completedQuery);

      if (!completedSnap.empty) {
        let totalTime = 0;
        let count = 0;
        completedSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.timestamp && data.completedAt) {
            const responseTime = data.completedAt.toMillis() - data.timestamp.toMillis();
            totalTime += responseTime;
            count++;
          }
        });
        if (count > 0) {
          const avgMs = totalTime / count;
          const avgMin = Math.round(avgMs / 60000 * 10) / 10;
          avgResponseTime = `${avgMin} min`;
        }
      }

      return {
        totalRequests,
        pendingResponses,
        autoResponded,
        avgResponseTime
      };
    } catch (error) {
      console.error('Error getting social stats:', error);
      return {
        totalRequests: 0,
        pendingResponses: 0,
        autoResponded: 0,
        avgResponseTime: 'N/A'
      };
    }
  }

  // Connect a social platform
  async connectPlatform(userId, platformId, credentials) {
    try {
      const docRef = await addDoc(collection(db, 'socialMedia', 'platforms', 'connected'), {
        userId,
        platformId,
        credentials,
        status: 'active',
        connectedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error connecting platform:', error);
      return { success: false, error: error.message };
    }
  }

  // Disconnect a social platform
  async disconnectPlatform(connectionId) {
    try {
      await deleteDoc(doc(db, 'socialMedia', 'platforms', 'connected', connectionId));
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      return { success: false, error: error.message };
    }
  }

  // Get connected platforms for a user
  async getConnectedPlatforms(userId) {
    try {
      const q = query(
        collection(db, 'socialMedia', 'platforms', 'connected'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting connected platforms:', error);
      return [];
    }
  }

  // Schedule a post
  async schedulePost(userId, postData) {
    try {
      const post = {
        ...postData,
        userId,
        status: 'scheduled',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'socialMedia', 'posts', 'scheduled'), post);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error scheduling post:', error);
      return { success: false, error: error.message };
    }
  }

  // Get scheduled posts
  async getScheduledPosts(userId) {
    try {
      const q = query(
        collection(db, 'socialMedia', 'posts', 'scheduled'),
        where('userId', '==', userId),
        where('status', '==', 'scheduled'),
        orderBy('scheduledTime', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      return [];
    }
  }

  // Log analytics data
  async logAnalytics(userId, analyticsData) {
    try {
      const data = {
        ...analyticsData,
        userId,
        date: serverTimestamp()
      };
      await addDoc(collection(db, 'socialMedia', 'analytics', 'daily'), data);
      return { success: true };
    } catch (error) {
      console.error('Error logging analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SocialMediaService();
