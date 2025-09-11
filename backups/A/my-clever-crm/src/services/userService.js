import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export class UserService {
  constructor(db, auth) {
    this.db = db;
    this.auth = auth;
  }

  async createUser(userData, createdBy) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      );
      const userProfile = {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'user',
        status: 'active',
        allowedFeatures: userData.allowedFeatures || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy,
        lastLogin: null
      };
      await this.updateUserProfile(userCredential.user.uid, userProfile);
      await sendPasswordResetEmail(this.auth, userData.email);
      return userCredential.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(uid) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserPermissions(uid, allowedFeatures) {
    try {
      await this.updateUserProfile(uid, { allowedFeatures });
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  }

  async changeUserStatus(uid, status) {
    try {
      await this.updateUserProfile(uid, { status });
    } catch (error) {
      console.error('Error changing user status:', error);
      throw error;
    }
  }

  async deleteUser(uid) {
    try {
      await this.updateUserProfile(uid, { 
        status: 'deleted',
        deletedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async syncFeatures(features) {
    try {
      const batch = writeBatch(this.db);
      features.forEach(feature => {
        const featureRef = doc(this.db, 'features', feature.id);
        batch.set(featureRef, {
          id: feature.id,
          label: feature.label,
          category: feature.category || 'core',
          description: feature.description || '',
          isActive: true,
          requiredRole: feature.requiredRole || 'user',
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error syncing features:', error);
      throw error;
    }
  }
}
