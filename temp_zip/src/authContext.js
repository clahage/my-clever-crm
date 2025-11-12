// authContext.js - Compatibility layer to fix import path issues
// This file acts as a bridge to redirect old import paths to the correct location

export * from './contexts/AuthContext';
export { default } from './contexts/AuthContext';
export { useAuth } from './contexts/AuthContext';
