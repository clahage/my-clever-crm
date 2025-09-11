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
  const docRef = await addDoc(clientsCollection, data);
  return docRef.id;
}

export async function getClients() {
  const snapshot = await getDocs(clientsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getClient(id) {
  const docRef = doc(db, 'clients', id);
  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() };
}

export async function updateClient(id, data) {
  const docRef = doc(db, 'clients', id);
  await updateDoc(docRef, data);
}

export async function deleteClient(id) {
  const docRef = doc(db, 'clients', id);
  await deleteDoc(docRef);
}
