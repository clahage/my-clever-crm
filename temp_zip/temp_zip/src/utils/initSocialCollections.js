import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function initializeSocialCollections() {
  try {
    // Create sample data for testing
    const sampleRequest = {
      platform: 'Facebook',
      type: 'message',
      message: 'Hi, I need help with credit repair',
      senderName: 'John Sample',
      status: 'pending',
      timestamp: serverTimestamp()
    };
    await addDoc(collection(db, 'social_requests'), sampleRequest);
    console.log('Social collections initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize collections:', error);
    return false;
  }
}
