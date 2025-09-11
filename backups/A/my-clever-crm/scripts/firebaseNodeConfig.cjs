// scripts/firebaseNodeConfig.cjs
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const firebaseConfig = {
  apiKey: "AIzaSyBUH0RQTzR4x_g0o1z_RCBcdb7YXvm5dGM",
  authDomain: "my-clever-crm.firebaseapp.com",
  projectId: "my-clever-crm",
  storageBucket: "my-clever-crm.appspot.com",
  messagingSenderId: "305382808826",
  appId: "1:305382808826:web:22bba4367c358a76f2bd43",
  measurementId: "G-SZ1CYYKSZ8"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
module.exports = { db };
