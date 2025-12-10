import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export async function requestChange({ db, userId, action, targetType, targetId, details }) {
  if (!db || !userId || !action) return;
  await addDoc(collection(db, 'changeRequests'), {
    userId,
    action,
    targetType,
    targetId,
    details,
    status: 'pending',
    timestamp: serverTimestamp(),
  });
}
