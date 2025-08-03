import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUH0RQTzR4x_g0o1z_RCBcdb7YXvm5dGM",
  authDomain: "my-clever-crm.firebaseapp.com",
  projectId: "my-clever-crm",
  storageBucket: "my-clever-crm.appspot.com",
  messagingSenderId: "305382808826",
  appId: "1:305382808826:web:ed4e267a0d7d5a6af2bd43",
  measurementId: "G-RGYMDH8G61"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
