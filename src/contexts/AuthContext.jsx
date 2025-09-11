import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuthState, login, register, logout, signInWithGoogle } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        // Get ID token result to access custom claims
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claims = tokenResult.claims || {};
        // Merge claims into user object
        setUser({
          ...firebaseUser,
          role: claims.role || 'user',
          tier: claims.tier || '',
          permissions: claims.permissions || [],
          isAdmin: claims.isAdmin || false,
          isMaster: claims.isMaster || false,
          customClaims: claims
        });
        setClaims(tokenResult.claims);
        // console.log('[DEBUG] Raw Firebase claims:', JSON.stringify(tokenResult.claims, null, 2)); // DEBUG
      } else {
        setUser(null);
      }
      setLoading(false);
      // ...removed for production...
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await register(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError('');
    try {
      await logout();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ...removed for production...
  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, signInWithGoogle: googleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    return { user: null, loading: true, error: 'Auth context not found', signIn: () => {}, signUp: () => {}, signOut: () => {} };
  }
  return context;
};
