import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logActivity({ db, userId, action, targetType, targetId, details }) {
  if (!db || !userId || !action) return;
  try {
    await addDoc(collection(db, "activityLogs"), {
      userId,
      action,
      targetType,
      targetId,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Optionally handle/log error
  }
}
