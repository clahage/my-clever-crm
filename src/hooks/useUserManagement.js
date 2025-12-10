import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export const useUserManagement = () => {
  const { isMasterAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    if (!isMasterAdmin()) {
      setError('Access denied: Admin privileges required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Update user role/permissions
  const updateUser = async (userId, updates) => {
    if (!isMasterAdmin()) throw new Error('Access denied');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...updates, updatedAt: new Date().toISOString(), updatedBy: user?.uid });
    await fetchUsers();
    return true;
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!isMasterAdmin()) throw new Error('Access denied');
    await deleteDoc(doc(db, 'users', userId));
    await fetchUsers();
    return true;
  };

  // Disable/Enable user
  const toggleUserStatus = async (userId, status) => {
    return updateUser(userId, { status, role: status === 'disabled' ? 'disabled' : 'user' });
  };

  useEffect(() => {
    if (isMasterAdmin()) fetchUsers();
  }, [isMasterAdmin]);

  return { users, loading, error, fetchUsers, updateUser, deleteUser, toggleUserStatus };
};
