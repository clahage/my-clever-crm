import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedLayout from './layout/ProtectedLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SocialMediaAdmin from './pages/SocialMediaAdmin';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import ProgressPortal from './pages/ProgressPortal';
import DisputeCenter from './pages/DisputeCenter';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Logout from './routes/Logout';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  console.log('App.jsx is rendering');
  console.log('Current URL:', window.location.pathname);
  
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              
              {/* Protected Routes using the layout */}
              <Route path="/" element={<ProtectedLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="social-admin" element={<SocialMediaAdmin />} />
                <Route path="clients" element={<Clients />} />
                <Route path="leads" element={<Leads />} />
                <Route path="progress" element={<ProgressPortal />} />
                <Route path="disputes" element={<DisputeCenter />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;