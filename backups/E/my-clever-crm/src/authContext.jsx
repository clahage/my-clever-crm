import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin email list
  const adminEmails = ['chris@speedycreditrepair.com', 'clahage@gmail.com'];

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        } else {
          // Create profile if not exists
          const newProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: adminEmails.includes(firebaseUser.email?.toLowerCase()) ? 'master_admin' : 'user',
            status: 'active',
            allowedFeatures: adminEmails.includes(firebaseUser.email?.toLowerCase()) ? ['*'] : [
              'dispute_center',
              'progress_portal',
              'page_contacts',
              'page_clients'
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(profileRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      // Profile will be loaded by onAuthStateChanged
      window.location.href = '/dashboard';
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      window.location.href = '/dashboard';
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Helper function to check if email is admin
  const isAdminEmail = (email) => {
    return adminEmails.includes(email?.toLowerCase());
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (!user) return;
      const profileRef = doc(db, 'users', user.uid);
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await setDoc(profileRef, updatedProfile);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value = {
    // Core auth state
    user,
    userProfile,
    loading,
    
    // Auth methods
    signIn,
    signInWithGoogle,
    signOut,
    
    // Utility methods
    isAdminEmail,
    updateUserProfile,
    
    // Legacy support for existing code
    setUser,
    roles: [],
    setRoles: () => {},
    features: [],
    setFeatures: () => {}
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};