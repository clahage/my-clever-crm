import React, { Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import './App.css';
import ContactReports from './pages/ContactReports.jsx';
import OpenAI from './pages/OpenAI.jsx';
const Dashboard = React.lazy(() => import('./components/Dashboard.jsx'));
const Contacts = React.lazy(() => import('./pages/Contacts.jsx'));
const AddClient = React.lazy(() => import('./pages/AddClient.jsx'));
const EditClient = React.lazy(() => import('./pages/EditClient.jsx'));
const ClientProfile = React.lazy(() => import('./pages/ClientProfile.jsx'));
const DisputeCenter = React.lazy(() => import('./components/DisputeCenter.jsx'));
const ProgressPortal = React.lazy(() => import('./components/ProgressPortal.jsx'));
const Analytics = React.lazy(() => import('./components/Analytics.jsx'));
const Letters = React.lazy(() => import('./components/Letters.jsx'));
const Billing = React.lazy(() => import('./components/Billing.jsx'));
const Calendar = React.lazy(() => import('./components/Calendar.jsx'));
const Communications = React.lazy(() => import('./components/Communications.jsx'));
const Export = React.lazy(() => import('./components/Export.jsx'));
const Bulk = React.lazy(() => import('./components/Bulk.jsx'));
const Automation = React.lazy(() => import('./components/Automation.jsx'));
const Settings = React.lazy(() => import('./components/Settings.jsx'));
import ContactDetailPage from './components/ContactDetailPage.jsx';

// Debug component to log current route
const RouteDebugger = () => {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  console.log('Current search:', location.search);
  console.log('Current hash:', location.hash);
  return null;
};

// Error Boundary for catching component errors
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Route Error</h1>
            <p className="text-gray-600 mb-4">Component failed to load: {this.props.componentName}</p>
            <pre className="bg-red-50 p-4 rounded text-sm text-left overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for each route with error handling
const RouteWrapper = ({ component: Component, componentName }) => (
  <RouteErrorBoundary componentName={componentName}>
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {componentName}...</p>
        </div>
      </div>
    }>
      <Component />
    </Suspense>
  </RouteErrorBoundary>
);

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading, error } = useAuth();
  if (error && error.includes('Auth context not found')) {
    return <Login />;
  }
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, error, signOut } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto">
          <Login />
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 bg-gray-50">
        <div className="flex justify-end p-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 font-semibold" onClick={signOut}>
            Logout
          </button>
        </div>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/clients" element={<Navigate to="/contacts?category=client" replace />} />
            <Route path="/leads" element={<Navigate to="/contacts?category=lead" replace />} />
            <Route path="/openai" element={<OpenAI />} />
            {/* Removed Prospects route */}
            <Route path="/add-client" element={<AddClient />} />
            <Route path="/edit-client/:id" element={<EditClient />} />
            <Route path="/client/:id" element={<ClientProfile />} />
            <Route path="/dispute-center" element={<DisputeCenter />} />
            <Route path="/progress-portal" element={<ProgressPortal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/contact-reports" element={<ContactReports />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/export" element={<Export />} />
            <Route path="/bulk" element={<Bulk />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/drip-campaigns" element={<RouteWrapper component={React.lazy(() => import('./pages/DripCampaign.jsx'))} componentName="DripCampaign" />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<RouteWrapper component={React.lazy(() => import('./pages/Help.jsx'))} componentName="Help" />} />
            <Route path="/setup" element={<RouteWrapper component={React.lazy(() => import('./pages/Setup.jsx'))} componentName="Setup" />} />
            <Route path="/administration" element={<RouteWrapper component={React.lazy(() => import('./pages/Administration.jsx'))} componentName="Administration" />} />
            <Route path="/permissions" element={<RouteWrapper component={React.lazy(() => import('./pages/Permissions.jsx'))} componentName="Permissions" />} />
            <Route path="/location" element={<RouteWrapper component={React.lazy(() => import('./pages/Location.jsx'))} componentName="Location" />} />
            {/* Add more protected CRM routes as needed */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;