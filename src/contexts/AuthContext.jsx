// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getUserRole, getRoleConfig, SPECIAL_ROLE_ASSIGNMENTS } from '@/config/roleConfig';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Signup function with role support
  const signup = async (email, password, displayName, initialRole = 'user') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    // Check if user has special role assignment
    const assignedRole = getUserRole(result.user.uid, initialRole);
    const roleConfig = getRoleConfig(assignedRole);
    
    // Create user profile in Firestore with role
    await setDoc(doc(db, 'userProfiles', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      displayName: displayName || 'User',
      role: assignedRole,
      roleLabel: roleConfig?.label || 'User',
      permissions: Array.isArray(roleConfig?.permissions) ? roleConfig.permissions : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      lastLoginAt: serverTimestamp()
    });
    
    return result;
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        
        // Check for special role assignment override
        const assignedRole = getUserRole(uid, profileData.role);
        
        // If role was overridden, update profile
        if (assignedRole !== profileData.role) {
          const roleConfig = getRoleConfig(assignedRole);
          await updateDoc(docRef, {
            role: assignedRole,
            roleLabel: roleConfig?.label || assignedRole,
            permissions: Array.isArray(roleConfig?.permissions) ? roleConfig.permissions : [],
            updatedAt: serverTimestamp()
          });
          profileData.role = assignedRole;
          profileData.roleLabel = roleConfig?.label;
          profileData.permissions = roleConfig?.permissions;
        }
        
        // Update last login
        await updateDoc(docRef, {
          lastLoginAt: serverTimestamp()
        });
        
        console.log('✅ User Profile Loaded:', profileData);
        console.log('✅ Role:', profileData.role);
        setUserProfile(profileData);
        return profileData;
      } else {
        console.log('⚠️ No profile found, creating new one');
        // Check for special role assignment
        const assignedRole = getUserRole(uid, 'user');
        const roleConfig = getRoleConfig(assignedRole);
        
        // Create profile if doesn't exist
        const newProfile = {
          uid: uid,
          email: auth.currentUser?.email,
          displayName: auth.currentUser?.displayName || 'User',
          role: assignedRole,
          roleLabel: roleConfig?.label || 'User',
          permissions: Array.isArray(roleConfig?.permissions) ? roleConfig.permissions : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          lastLoginAt: serverTimestamp()
        };
        await setDoc(doc(db, 'userProfiles', uid), newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  };

  // Update user role (admin function)
  const updateUserRole = async (uid, newRole) => {
    try {
      const roleConfig = getRoleConfig(newRole);
      if (!roleConfig) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      const docRef = doc(db, 'userProfiles', uid);
      await updateDoc(docRef, {
        role: newRole,
        roleLabel: roleConfig.label,
        permissions: Array.isArray(roleConfig.permissions) ? roleConfig.permissions : [],
        updatedAt: serverTimestamp()
      });

      // If updating current user, refresh profile
      if (currentUser?.uid === uid) {
        await fetchUserProfile(uid);
      }

      console.log(`✅ Role updated for user ${uid} to ${newRole}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (currentUser) {
      return await fetchUserProfile(currentUser.uid);
    }
    return null;
  };

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    updateUserRole,
    refreshProfile,
    loading,
    user: currentUser, // alias for compatibility
    
    // Quick role access
    role: userProfile?.role || 'viewer',
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;