import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Layout
import ProtectedLayout from './layout/ProtectedLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Main Pages
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import ContactDetailPage from './pages/ContactDetailPage';
import ImportCSV from './pages/ImportCSV';
import Export from './pages/Export';
import ContactReports from './pages/ContactReports';
import Segments from './pages/Segments';

// Credit Management
import BusinessCredit from './pages/BusinessCredit';
import CreditScores from './pages/CreditScores';
import DisputeLetters from './pages/DisputeLetters';
import CreditReports from './pages/CreditReports';
import CreditMonitoring from './pages/CreditMonitoring';
import ScoreSimulator from './pages/ScoreSimulator';

// Communication
import Letters from './pages/Letters';
import Emails from './pages/Emails';
import SMS from './pages/SMS';
import DripCampaigns from './pages/DripCampaigns';  // NEW IMPORT
import Templates from './pages/Templates';
import CallLogs from './pages/CallLogs';
import Notifications from './pages/Notifications';
import Pipeline from './pages/Pipeline';

// Documents
import Documents from './pages/Documents';
import EContracts from './pages/EContracts';
import Forms from './pages/Forms';
import DocumentStorage from './pages/DocumentStorage';

// Business Tools
import Affiliates from './pages/Affiliates';
import Billing from './pages/Billing';
import Invoices from './pages/Invoices';
import Products from './pages/Products';
import Companies from './pages/Companies';
import Location from './pages/Location';  // NEW IMPORT

// Scheduling
import Calendar from './pages/Calendar';
import Appointments from './pages/Appointments';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';

// Analytics
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';

// Admin
import Settings from './pages/Settings';
import Team from './pages/Team';
import Roles from './pages/Roles';
import Integrations from './pages/Integrations';
import Training from './pages/Training';
import Learn from './pages/Learn';  // NEW IMPORT
import Support from './pages/Support';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Home />} />
            
            {/* Contacts & CRM */}
            <Route path="contacts" element={<Contacts />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="contact/:id" element={<ContactDetailPage />} />
            <Route path="import" element={<ImportCSV />} />
            <Route path="export" element={<Export />} />
            <Route path="contact-reports" element={<ContactReports />} />
            <Route path="segments" element={<Segments />} />
            
            {/* Credit Management */}
            <Route path="business-credit" element={<BusinessCredit />} />
            <Route path="credit-scores" element={<CreditScores />} />
            <Route path="disputes" element={<DisputeLetters />} />
            <Route path="credit-reports" element={<CreditReports />} />
            <Route path="credit-monitoring" element={<CreditMonitoring />} />
            <Route path="score-simulator" element={<ScoreSimulator />} />
            
            {/* Communication */}
            <Route path="letters" element={<Letters />} />
            <Route path="emails" element={<Emails />} />
            <Route path="sms" element={<SMS />} />
            <Route path="drip-campaigns" element={<DripCampaigns />} />  {/* NEW ROUTE */}
            <Route path="templates" element={<Templates />} />
            <Route path="call-logs" element={<CallLogs />} />
            <Route path="notifications" element={<Notifications />} />
            
            {/* Documents */}
            <Route path="documents" element={<Documents />} />
            <Route path="econtracts" element={<EContracts />} />
            <Route path="forms" element={<Forms />} />
            <Route path="document-storage" element={<DocumentStorage />} />
            
            {/* Business Tools */}
            <Route path="companies" element={<Companies />} />
            <Route path="location" element={<Location />} />  {/* NEW ROUTE */}
            <Route path="invoices" element={<Invoices />} />
            
            {/* Admin-only Business Tools */}
            <Route
              path="affiliates"
              element={
                <AdminRoute>
                  <Affiliates />
                </AdminRoute>
              }
            />
            <Route
              path="billing"
              element={
                <AdminRoute>
                  <Billing />
                </AdminRoute>
              }
            />
            <Route
              path="products"
              element={
                <AdminRoute>
                  <Products />
                </AdminRoute>
              }
            />
            
            {/* Scheduling */}
            <Route path="calendar" element={<Calendar />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reminders" element={<Reminders />} />
            
            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="goals" element={<Goals />} />
            <Route path="achievements" element={<Achievements />} />
            
            {/* Settings & Admin */}
            <Route path="settings" element={<Settings />} />
            <Route path="training" element={<Training />} />
            <Route path="learn" element={<Learn />} />  {/* NEW ROUTE */}
            <Route path="support" element={<Support />} />
            
            {/* Admin-only Settings */}
            <Route
              path="team"
              element={
                <AdminRoute>
                  <Team />
                </AdminRoute>
              }
            />
            <Route
              path="roles"
              element={
                <AdminRoute>
                  <Roles />
                </AdminRoute>
              }
            />
            <Route
              path="integrations"
              element={
                <AdminRoute>
                  <Integrations />
                </AdminRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;