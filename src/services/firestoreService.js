import { db } from '../firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Enhanced error handling wrapper
const handleFirestoreError = (error, operation) => {
  console.error(`Firestore ${operation} error:`, error);
  if (error.code === 'permission-denied') {
    throw new Error('Access denied. Please check your permissions.');
  } else if (error.code === 'unavailable') {
    throw new Error('Service temporarily unavailable. Please try again.');
  } else {
    throw new Error(`Database error: ${error.message}`);
  }
};

// Generic CRUD operations
export class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Create document
  async create(data) {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(this.collectionRef, docData);
      return { id: docRef.id, ...docData };
    } catch (error) {
      handleFirestoreError(error, 'create');
    }
  }

  // Update document
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      return { id, ...data };
    } catch (error) {
      handleFirestoreError(error, 'update');
    }
  }

  // Delete document
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      handleFirestoreError(error, 'delete');
    }
  }

  // Get all documents
  async getAll(filters = [], sort = null) {
    try {
      let q = query(this.collectionRef);
      if (filters.length) {
        filters.forEach(f => {
          q = query(q, where(f.field, f.op, f.value));
        });
      }
      if (sort) {
        q = query(q, orderBy(sort.field, sort.direction));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, 'getAll');
    }
  }

  // Real-time listener
  listen(callback, filters = [], sort = null) {
    let q = query(this.collectionRef);
    if (filters.length) {
      filters.forEach(f => {
        q = query(q, where(f.field, f.op, f.value));
      });
    }
    if (sort) {
      q = query(q, orderBy(sort.field, sort.direction));
    }
    return onSnapshot(q, snapshot => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => handleFirestoreError(error, 'listen'));
  }
}
