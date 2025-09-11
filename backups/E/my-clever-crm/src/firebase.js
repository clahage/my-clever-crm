// src/firebase.js - Complete Firebase Setup
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUH0RQTzR4x_g0o1z_RCBcdb7YXvm5dGM",
  authDomain: "my-clever-crm.firebaseapp.com",
  projectId: "my-clever-crm",
  storageBucket: "my-clever-crm.appspot.com", // Using the standard .appspot.com format
  messagingSenderId: "305382808826",
  appId: "1:305382808826:web:22bba4367c358a76f2bd43",
  measurementId: "G-SZ1CYYKSZ8"
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export the app and config for reference
export { app, firebaseConfig };
export const appId = firebaseConfig.appId;

// Helper function to check if Firebase is properly initialized
export const isFirebaseConnected = () => {
  try {
    return !!(app && auth && db && storage);
  } catch (error) {
    console.error("Firebase connection check failed:", error);
    return false;
  }
};

console.log("🔥 Firebase initialized:", {
  auth: !!auth,
  firestore: !!db,
  storage: !!storage,
  analytics: !!analytics
});