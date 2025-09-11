import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  GoogleAuthProvider,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

// IMPORTANT: Keep this project config consistent across dev/prod.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "my-clever-crm.firebaseapp.com",
  projectId: "my-clever-crm",
  storageBucket: "my-clever-crm.appspot.com",
  // Include these if available for this project:
  // messagingSenderId: "1042713435709",
  appId: "1:1042713435709:web:364304bffb4c77d5c31454",
};

// Single app instance (avoids HMR dupes)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// IMPORTANT: initializeAuth with redirect resolver + layered persistence
// Note: initializeAuth is required to supply the popup/redirect resolver.
export const auth = initializeAuth(app, {
  persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    inMemoryPersistence,
  ],
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Configure Google provider (force account chooser)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
