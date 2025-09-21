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
import CommunicationsPage from './pages/CommunicationsPage';
import BillingPage from './pages/BillingPage';
import AIReceptionist from './pages/AIReceptionist';
import OpenAI from './pages/OpenAI';
import AdminTools from './pages/AdminTools';
import Portal from './pages/Portal';
import Support from './pages/Support';
import Contacts from './pages/Contacts';
import CreditReports from './pages/CreditReports';
import CreditScores from './components/CreditScores';
import DisputeLetters from './components/DisputeLetters';
import Letters from './components/Letters';
import Calendar from './components/Calendar';
import Export from './components/Export';
import BulkActions from './components/BulkActions';
import Analytics from './pages/Analytics';
import ContactReports from './components/ContactReports';
import BusinessCredit from './pages/BusinessCredit';
import Referrals from './pages/Referrals';
import Learn from './pages/Learn';
import Automation from './pages/Automation';

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
                <Route path="social-media" element={<SocialMediaAdmin />} />
                <Route path="clients" element={<Clients />} />
                <Route path="leads" element={<Leads />} />
                <Route path="progress-portal" element={<ProgressPortal />} />
                <Route path="disputes" element={<DisputeCenter />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                {/* Added routes for new pages */}
                <Route path="communications" element={<CommunicationsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="ai-receptionist" element={<AIReceptionist />} />
                <Route path="openai" element={<OpenAI />} />
                <Route path="admin" element={<AdminTools />} />
                <Route path="portal" element={<Portal />} />
                <Route path="support" element={<Support />} />
                {/* New routes from Prompt #19 */}
                <Route path="contacts" element={<Contacts />} />
                <Route path="credit-reports" element={<CreditReports />} />
                <Route path="credit-scores" element={<CreditScores />} />
                <Route path="dispute-letters" element={<DisputeLetters />} />
                <Route path="letters" element={<Letters />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="export" element={<Export />} />
                <Route path="bulk" element={<BulkActions />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="contact-reports" element={<ContactReports />} />
                <Route path="business-credit" element={<BusinessCredit />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="learn" element={<Learn />} />
                <Route path="automation" element={<Automation />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;