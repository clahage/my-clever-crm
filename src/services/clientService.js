// src/services/clientService.js
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query
} from 'firebase/firestore';

const clientsCollection = collection(db, 'clients');
// Real-time subscription for clients
export function subscribeClients(callback, errorCallback) {
  const q = query(clientsCollection);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, errorCallback);
}

export async function createClient(data) {
  try {
    const docRef = await addDoc(clientsCollection, data);
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export async function getClients() {
  try {
    const snapshot = await getDocs(clientsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
}

export async function getClient(id) {
  try {
    const docRef = doc(db, 'clients', id);
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    throw error;
  }
}

export async function updateClient(id, data) {
  try {
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, data);
  } catch (error) {
    throw error;
  }
}

export async function deleteClient(id) {
  try {
    const docRef = doc(db, 'clients', id);
    await deleteDoc(docRef);
  } catch (error) {
    throw error;
  }
}
