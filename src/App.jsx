import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './layout/ProtectedLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';

// Protected Pages - Core
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import AIReceptionist from './pages/AIReceptionist';
import OpenAI from './pages/OpenAI';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Protected Pages - CRM Features
import Billing from './pages/Billing';
import CreditReports from './pages/CreditReports';
import CreditScores from './pages/CreditScores';
import Disputes from './pages/Disputes';
import DisputeLetters from './pages/DisputeLetters';
import Letters from './pages/Letters';
import Communications from './pages/Communications';
import Export from './pages/Export';
import Bulk from './pages/Bulk';
import Reports from './pages/Reports';
import ContactReports from './pages/ContactReports';
import Automation from './pages/Automation';
import SocialMediaAdmin from './pages/SocialMediaAdmin';
import BusinessCredit from './pages/BusinessCredit';
import Referrals from './pages/Referrals';
import Affiliates from './pages/Affiliates';
import AdminTools from './pages/AdminTools';
import Portal from './pages/Portal';
import Learn from './pages/Learn';
import Support from './pages/Support';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="clients" element={<Clients />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="messages" element={<Messages />} />
            <Route path="ai-receptionist" element={<AIReceptionist />} />
            <Route path="openai" element={<OpenAI />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Credit & Dispute Management Routes */}
            <Route path="billing" element={<Billing />} />
            <Route path="credit-reports" element={<CreditReports />} />
            <Route path="credit-scores" element={<CreditScores />} />
            <Route path="disputes" element={<Disputes />} />
            <Route path="dispute-letters" element={<DisputeLetters />} />
            <Route path="progress-portal" element={<Portal />} />
            
            {/* Communication & Marketing Routes */}
            <Route path="letters" element={<Letters />} />
            <Route path="communications" element={<Communications />} />
            <Route path="social-media" element={<SocialMediaAdmin />} />
            <Route path="automation" element={<Automation />} />
            
            {/* Business Management Routes */}
            <Route path="export" element={<Export />} />
            <Route path="bulk" element={<Bulk />} />
            <Route path="reports" element={<Reports />} />
            <Route path="contact-reports" element={<ContactReports />} />
            <Route path="business-credit" element={<BusinessCredit />} />
            <Route path="affiliates" element={<Affiliates />} />
            <Route path="referrals" element={<Referrals />} />
            
            {/* Admin & Support Routes */}
            <Route path="admin" element={<AdminTools />} />
            <Route path="portal" element={<Portal />} />
            <Route path="client" element={<Portal />} />
            <Route path="learn" element={<Learn />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;