import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

class SocialMediaService {
  constructor() {
    this.platforms = ['Facebook', 'Instagram', 'Google Reviews'];
  }

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

  async getStats() {
    return {
      totalRequests: 156,
      pendingResponses: 8,
      autoResponded: 148,
      avgResponseTime: '2.3 min'
    };
  }
}

export default new SocialMediaService();
