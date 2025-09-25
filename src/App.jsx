import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './layout/ProtectedLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard & Core
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';

// AI Features
import AIReceptionist from './pages/AIReceptionist';
import AICommandCenter from './pages/AICommandCenter';
import OpenAI from './pages/OpenAI';

// Analytics & Reports
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import ContactReports from './pages/ContactReports';

// User & Settings
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Billing from './pages/Billing';

// Credit & Disputes
import CreditReports from './pages/CreditReports';
import CreditScores from './pages/CreditScores';
import Disputes from './pages/Disputes';
import DisputeLetters from './pages/DisputeLetters';
import BusinessCredit from './pages/BusinessCredit';

// Communication & Marketing
import Letters from './pages/Letters';
import Communications from './pages/Communications';
import SocialMediaAdmin from './pages/SocialMediaAdmin';
import Automation from './pages/Automation';

// Tools & Admin
import Export from './pages/Export';
import Bulk from './pages/Bulk';
import Portal from './pages/Portal';
import Referrals from './pages/Referrals';
import AdminTools from './pages/AdminTools';
import Learn from './pages/Learn';
import Support from './pages/Support';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="clients" element={<Clients />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="messages" element={<Messages />} />
            
            {/* AI Features */}
            <Route path="ai-receptionist" element={<AIReceptionist />} />
            <Route path="ai-command" element={<AICommandCenter />} />
            <Route path="openai" element={<OpenAI />} />
            
            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="contact-reports" element={<ContactReports />} />
            
            {/* User */}
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="billing" element={<Billing />} />
            
            {/* Credit & Disputes */}
            <Route path="credit-reports" element={<CreditReports />} />
            <Route path="credit-scores" element={<CreditScores />} />
            <Route path="disputes" element={<Disputes />} />
            <Route path="dispute-letters" element={<DisputeLetters />} />
            <Route path="business-credit" element={<BusinessCredit />} />
            
            {/* Progress Portal */}
            <Route path="progress-portal" element={<Portal />} />
            <Route path="portal" element={<Portal />} />
            <Route path="client" element={<Portal />} />
            
            {/* Communications */}
            <Route path="letters" element={<Letters />} />
            <Route path="communications" element={<Communications />} />
            <Route path="social-media" element={<SocialMediaAdmin />} />
            <Route path="automation" element={<Automation />} />
            
            {/* Tools */}
            <Route path="export" element={<Export />} />
            <Route path="bulk" element={<Bulk />} />
            <Route path="referrals" element={<Referrals />} />
            
            {/* Admin & Support */}
            <Route path="admin" element={<AdminTools />} />
            <Route path="learn" element={<Learn />} />
            <Route path="support" element={<Support />} />
            
            {/* Logout */}
            <Route path="logout" element={<Navigate to="/login" replace />} />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;