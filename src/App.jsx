import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Contacts from './pages/Contacts';
import AIReceptionist from './pages/AIReceptionist';
import OpenAI from './pages/OpenAI';
import AdminTools from './pages/AdminTools';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  // Initialize contact pipeline service (if you have it)
  useEffect(() => {
    // This will run the pipeline service if it exists
    try {
      import('./services/contactPipelineService').then(module => {
        console.log('Contact pipeline service initialized');
      }).catch(err => {
        console.log('Contact pipeline service not found or not needed');
      });
    } catch (error) {
      console.log('Pipeline service not configured');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Main Pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="clients" element={<Clients />} />
          <Route path="contacts" element={<Contacts />} />
          
          {/* AI & Automation */}
          <Route path="ai-receptionist" element={<AIReceptionist />} />
          <Route path="openai" element={<OpenAI />} />
          
          {/* Admin Tools - Both routes for compatibility */}
          <Route path="admin" element={<AdminTools />} />
          <Route path="admin-tools" element={<AdminTools />} />
          
          {/* Communication */}
          <Route path="calendar" element={<Calendar />} />
          <Route path="messages" element={<Messages />} />
          
          {/* Resources */}
          <Route path="documents" element={<Documents />} />
          <Route path="analytics" element={<Analytics />} />
          
          {/* User */}
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;