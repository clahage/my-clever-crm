import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export class RoleService {
  constructor(db) {
    this.db = db;
  }

  async getRoles() {
    try {
      const rolesRef = collection(this.db, 'roles');
      const snapshot = await getDocs(rolesRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async createRole(roleData) {
    try {
      const roleRef = await addDoc(collection(this.db, 'roles'), {
        ...roleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return roleRef.id;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(roleId, updates) {
    try {
      const roleRef = doc(this.db, 'roles', roleId);
      await updateDoc(roleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      await deleteDoc(doc(this.db, 'roles', roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }
}
