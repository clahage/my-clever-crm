// src/lib/firebase-test.js
console.log('Firebase test file loaded!');

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUH0RQTzR4x_g0o1z_RCBcdb7YXvm5dGM",
  authDomain: "my-clever-crm.firebaseapp.com",
  projectId: "my-clever-crm",
  storageBucket: "my-clever-crm.appspot.com",
  appId: "1:1042713435709:web:364304bffb4c77d5c31454",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase initialized:', { auth, db });

export default { auth, db };