// TEMPORARY MOCK AUTH CONTEXT - Replace this with real Firebase auth when fixed
// Save as: /src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
export const AuthContext = createContext();

// Mock user data
const mockUser = {
  uid: 'mock-user-123',
  email: 'admin@speedycreditrepair.com',
  displayName: 'Admin User',
  emailVerified: true
};

const mockUserProfile = {
  uid: 'mock-user-123',
  email: 'admin@speedycreditrepair.com',
  displayName: 'Admin User',
  role: 'admin',
  permissions: ['all'],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock data even if context is missing
    return {
      currentUser: mockUser,
      userProfile: mockUserProfile,
      loading: false,
      login: () => Promise.resolve(mockUser),
      logout: () => Promise.resolve(),
      signup: () => Promise.resolve(mockUser),
      resetPassword: () => Promise.resolve(),
      updateUserProfile: () => Promise.resolve(mockUserProfile),
      changePassword: () => Promise.resolve()
    };
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [userProfile, setUserProfile] = useState(mockUserProfile);
  const [loading, setLoading] = useState(false);

  // Mock functions
  const login = async (email, password) => {
    console.log('Mock login:', email);
    setCurrentUser(mockUser);
    setUserProfile(mockUserProfile);
    return mockUser;
  };

  const logout = async () => {
    console.log('Mock logout');
    // Don't actually log out in mock mode
    return;
  };

  const signup = async (email, password, displayName) => {
    console.log('Mock signup:', email);
    setCurrentUser(mockUser);
    setUserProfile(mockUserProfile);
    return mockUser;
  };

  const resetPassword = async (email) => {
    console.log('Mock password reset:', email);
    return;
  };

  const updateUserProfile = async (updates) => {
    console.log('Mock profile update:', updates);
    setUserProfile({ ...userProfile, ...updates });
    return userProfile;
  };

  const changePassword = async (currentPassword, newPassword) => {
    console.log('Mock password change');
    return true;
  };

  // Set mock user on mount
  useEffect(() => {
    setCurrentUser(mockUser);
    setUserProfile(mockUserProfile);
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    signup,
    resetPassword,
    updateUserProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Also export usePermission if any components need it
export const usePermission = (permission) => {
  // Mock - always return true for now
  return true;
};

export default AuthContext;