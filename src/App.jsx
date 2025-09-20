import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ProtectedLayout from './layout/ProtectedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SocialMediaAdmin from './pages/SocialMediaAdmin';
import Leads from './pages/Leads';
import Clients from './pages/Clients';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/social-admin" element={<SocialMediaAdmin />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/clients" element={<Clients />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;