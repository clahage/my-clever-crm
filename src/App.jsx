// src/App.jsx - SpeedyCRM Complete Application Router
// VERSION: 2.2 - FIXED DUPLICATE PublicRoute ERROR
// LAST UPDATED: 2025-10-11
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ProtectedLayout from '@/layout/ProtectedLayout';

// ============================================================================
// LOADING COMPONENT
// ============================================================================
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">
        Loading SpeedyCRM...
      </p>
    </div>
  </div>
);

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error Boundary Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-red-500 text-8xl mb-6 animate-bounce">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something Went Wrong
              </h1>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 mb-2">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                      Technical Details
                    </summary>
                    <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white dark:bg-gray-900 p-2 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔄 Reload Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🏠 Go Home
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                If this persists, contact support at support@speedycrm.com
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// SMART REDIRECT COMPONENT
// ============================================================================
const SmartRedirect = () => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userProfile?.role || currentUser?.role || 'user';
  
  console.log('🎯 Smart Redirect:', { userRole, userProfile });

  if (userRole === 'masterAdmin' || userRole === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (userRole === 'client') {
    return <Navigate to="/client-portal" replace />;
  }

  return <Navigate to="/home" replace />;
};

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Home = lazy(() => import('@/pages/Home'));
const ClientPortal = lazy(() => import('@/pages/ClientPortal'));
const ClientDashboard = lazy(() => import('@/pages/ClientPortal/ClientDashboard'));
const Portal = lazy(() => import('@/pages/Portal'));
const CreditReportWorkflow = lazy(() => import('@/pages/CreditReportWorkflow'));
const AIReviewDashboard = lazy(() => import('@/pages/AIReviewDashboard'));
const AIReviewEditor = lazy(() => import('@/components/AIReviewEditor'));
const CreditAnalysisEngine = lazy(() => import('@/pages/CreditAnalysisEngine'));
const PredictiveAnalytics = lazy(() => import('@/pages/PredictiveAnalytics'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Pipeline = lazy(() => import('@/pages/Pipeline'));
const ContactImport = lazy(() => import('@/pages/ContactImport'));
const ContactExport = lazy(() => import('@/pages/ContactExport'));
const ContactReports = lazy(() => import('@/pages/ContactReports'));
const Segments = lazy(() => import('@/pages/Segments'));
const CreditSimulator = lazy(() => import('@/pages/CreditSimulator'));
const BusinessCredit = lazy(() => import('@/pages/BusinessCredit'));
const CreditScores = lazy(() => import('@/pages/CreditScores'));
const DisputeLetters = lazy(() => import('@/pages/DisputeLetters'));
const DisputeStatus = lazy(() => import('@/pages/DisputeStatus'));
const DisputeAdminPanel = lazy(() => import('@/pages/admin/DisputeAdminPanel'));
const CreditReports = lazy(() => import('@/pages/CreditReports'));
const CreditMonitoring = lazy(() => import('@/pages/CreditMonitoring'));
const Letters = lazy(() => import('@/pages/Letters'));
const Emails = lazy(() => import('@/pages/Emails'));
const SMS = lazy(() => import('@/pages/SMS'));
const DripCampaigns = lazy(() => import('@/pages/DripCampaigns'));
const Templates = lazy(() => import('@/pages/Templates'));
const CallLogs = lazy(() => import('@/pages/CallLogs'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const LearningCenter = lazy(() => import('@/pages/LearningCenter'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Certificates = lazy(() => import('@/pages/Certificates'));
const Documents = lazy(() => import('@/pages/Documents'));
const EContracts = lazy(() => import('@/pages/EContracts'));
const Forms = lazy(() => import('@/pages/Forms'));
const FullAgreement = lazy(() => import('@/pages/FullAgreement'));
const InformationSheet = lazy(() => import('@/pages/InformationSheet'));
const PowerOfAttorney = lazy(() => import('@/pages/PowerOfAttorney'));
const ACHAuthorization = lazy(() => import('@/pages/ACHAuthorization'));
const Addendums = lazy(() => import('@/pages/Addendums'));
const DocumentStorage = lazy(() => import('@/pages/DocumentStorage'));
const Companies = lazy(() => import('@/pages/Companies'));
const Location = lazy(() => import('@/pages/Location'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const Affiliates = lazy(() => import('@/pages/Affiliates'));
const Billing = lazy(() => import('@/pages/Billing'));
const Products = lazy(() => import('@/pages/Products'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Appointments = lazy(() => import('@/pages/Appointments'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Reminders = lazy(() => import('@/pages/Reminders'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Reports = lazy(() => import('@/pages/Reports'));
const Goals = lazy(() => import('@/pages/Goals'));
const ResourcesArticles = lazy(() => import('@/pages/resources/Articles'));
const ResourcesFAQ = lazy(() => import('@/pages/resources/FAQ'));
const AppsOverview = lazy(() => import('@/pages/apps/Overview'));
const AppsEmployee = lazy(() => import('@/pages/apps/Employee'));
const AppsClient = lazy(() => import('@/pages/apps/Client'));
const AppsAffiliate = lazy(() => import('@/pages/apps/Affiliate'));
const Settings = lazy(() => import('@/pages/Settings'));
const Team = lazy(() => import('@/pages/Team'));
const DocumentCenter = lazy(() => import('@/pages/DocumentCenter'));
const Roles = lazy(() => import('@/pages/Roles'));
const UserRoles = lazy(() => import('@/pages/UserRoles'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const Support = lazy(() => import('@/pages/Support'));
const SystemMap = lazy(() => import('@/pages/SystemMap'));
const WhiteLabelBranding = lazy(() => import('@/pages/whitelabel/Branding'));
const WhiteLabelDomains = lazy(() => import('@/pages/whitelabel/Domains'));
const WhiteLabelPlans = lazy(() => import('@/pages/whitelabel/Plans'));
const WhiteLabelTenants = lazy(() => import('@/pages/whitelabel/Tenants'));

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRole = userProfile?.role || currentUser?.role || 'user';
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    console.log('🔒 Protected Route Check:', { userRole, allowedRoles, requiredRole });

    if (userRole === 'masterAdmin') {
      return <>{children}</>;
    }

    if (allowedRoles.includes('admin') && userRole === 'admin') {
      return <>{children}</>;
    }

    if (allowedRoles.includes('user') && (userRole === 'user' || userRole === 'client')) {
      return <>{children}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
            <br />
            <span className="text-sm mt-2 block">
              Required: {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole} | Your role: {userRole}
            </span>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏠 Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// PUBLIC ROUTE - ONLY ONE DEFINITION
// ============================================================================
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ============================================================================
// APP CONTENT (ROUTES)
// ============================================================================
const AppContent = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<PublicRoute><Suspense fallback={<LoadingFallback />}><Login /></Suspense></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Suspense fallback={<LoadingFallback />}><Register /></Suspense></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><Suspense fallback={<LoadingFallback />}><ForgotPassword /></Suspense></PublicRoute>} />

      {/* PROTECTED ROUTES */}
      <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
        <Route index element={<SmartRedirect />} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
        <Route path="home" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
        <Route path="client-portal" element={<Suspense fallback={<LoadingFallback />}><ClientPortal /></Suspense>} />
        <Route path="client" element={<Suspense fallback={<LoadingFallback />}><ClientDashboard /></Suspense>} />
        <Route path="portal" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Portal /></Suspense></ProtectedRoute>} />
        <Route path="credit-report-workflow" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><CreditReportWorkflow /></Suspense></ProtectedRoute>} />
        <Route path="admin/ai-reviews" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AIReviewDashboard /></Suspense></ProtectedRoute>} />
        <Route path="admin/ai-reviews/:reviewId" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AIReviewEditor /></Suspense></ProtectedRoute>} />
        <Route path="credit-analysis" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><CreditAnalysisEngine /></Suspense></ProtectedRoute>} />
        <Route path="predictive-analytics" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><PredictiveAnalytics /></Suspense></ProtectedRoute>} />
        <Route path="contacts" element={<Suspense fallback={<LoadingFallback />}><Contacts /></Suspense>} />
        <Route path="pipeline" element={<Suspense fallback={<LoadingFallback />}><Pipeline /></Suspense>} />
        <Route path="import" element={<Suspense fallback={<LoadingFallback />}><ContactImport /></Suspense>} />
        <Route path="export" element={<Suspense fallback={<LoadingFallback />}><ContactExport /></Suspense>} />
        <Route path="contact-reports" element={<Suspense fallback={<LoadingFallback />}><ContactReports /></Suspense>} />
        <Route path="segments" element={<Suspense fallback={<LoadingFallback />}><Segments /></Suspense>} />
        <Route path="credit-simulator" element={<Suspense fallback={<LoadingFallback />}><CreditSimulator /></Suspense>} />
        <Route path="business-credit" element={<Suspense fallback={<LoadingFallback />}><BusinessCredit /></Suspense>} />
        <Route path="credit-scores" element={<Suspense fallback={<LoadingFallback />}><CreditScores /></Suspense>} />
        <Route path="dispute-letters" element={<Suspense fallback={<LoadingFallback />}><DisputeLetters /></Suspense>} />
        <Route path="dispute-center" element={<Navigate to="/dispute-letters" replace />} />
        <Route path="dispute-status" element={<Suspense fallback={<LoadingFallback />}><DisputeStatus /></Suspense>} />
        <Route path="admin/dispute-admin-panel" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><DisputeAdminPanel /></Suspense></ProtectedRoute>} />
        <Route path="credit-reports" element={<Suspense fallback={<LoadingFallback />}><CreditReports /></Suspense>} />
        <Route path="credit-monitoring" element={<Suspense fallback={<LoadingFallback />}><CreditMonitoring /></Suspense>} />
        <Route path="letters" element={<Suspense fallback={<LoadingFallback />}><Letters /></Suspense>} />
        <Route path="emails" element={<Suspense fallback={<LoadingFallback />}><Emails /></Suspense>} />
        <Route path="sms" element={<Suspense fallback={<LoadingFallback />}><SMS /></Suspense>} />
        <Route path="drip-campaigns" element={<Suspense fallback={<LoadingFallback />}><DripCampaigns /></Suspense>} />
        <Route path="templates" element={<Suspense fallback={<LoadingFallback />}><Templates /></Suspense>} />
        <Route path="call-logs" element={<Suspense fallback={<LoadingFallback />}><CallLogs /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<LoadingFallback />}><Notifications /></Suspense>} />
        <Route path="learning-center" element={<Suspense fallback={<LoadingFallback />}><LearningCenter /></Suspense>} />
        <Route path="achievements" element={<Suspense fallback={<LoadingFallback />}><Achievements /></Suspense>} />
        <Route path="certificates" element={<Suspense fallback={<LoadingFallback />}><Certificates /></Suspense>} />
        <Route path="documents" element={<Suspense fallback={<LoadingFallback />}><Documents /></Suspense>} />
        <Route path="econtracts" element={<Suspense fallback={<LoadingFallback />}><EContracts /></Suspense>} />
        <Route path="forms" element={<Suspense fallback={<LoadingFallback />}><Forms /></Suspense>} />
        <Route path="full-agreement" element={<Suspense fallback={<LoadingFallback />}><FullAgreement /></Suspense>} />
        <Route path="information-sheet" element={<Suspense fallback={<LoadingFallback />}><InformationSheet /></Suspense>} />
        <Route path="power-of-attorney" element={<Suspense fallback={<LoadingFallback />}><PowerOfAttorney /></Suspense>} />
        <Route path="ach-authorization" element={<Suspense fallback={<LoadingFallback />}><ACHAuthorization /></Suspense>} />
        <Route path="addendums" element={<Suspense fallback={<LoadingFallback />}><Addendums /></Suspense>} />
        <Route path="document-storage" element={<Suspense fallback={<LoadingFallback />}><DocumentStorage /></Suspense>} />
        <Route path="companies" element={<Suspense fallback={<LoadingFallback />}><Companies /></Suspense>} />
        <Route path="location" element={<Suspense fallback={<LoadingFallback />}><Location /></Suspense>} />
        <Route path="invoices" element={<Suspense fallback={<LoadingFallback />}><Invoices /></Suspense>} />
        <Route path="affiliates" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Affiliates /></Suspense></ProtectedRoute>} />
        <Route path="billing" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Billing /></Suspense></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Products /></Suspense></ProtectedRoute>} />
        <Route path="calendar" element={<Suspense fallback={<LoadingFallback />}><Calendar /></Suspense>} />
        <Route path="appointments" element={<Suspense fallback={<LoadingFallback />}><Appointments /></Suspense>} />
        <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><Tasks /></Suspense>} />
        <Route path="reminders" element={<Suspense fallback={<LoadingFallback />}><Reminders /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<LoadingFallback />}><Analytics /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><Reports /></Suspense>} />
        <Route path="goals" element={<Suspense fallback={<LoadingFallback />}><Goals /></Suspense>} />
        <Route path="resources/articles" element={<Suspense fallback={<LoadingFallback />}><ResourcesArticles /></Suspense>} />
        <Route path="resources/faq" element={<Suspense fallback={<LoadingFallback />}><ResourcesFAQ /></Suspense>} />
        <Route path="apps/overview" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AppsOverview /></Suspense></ProtectedRoute>} />
        <Route path="apps/employee" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AppsEmployee /></Suspense></ProtectedRoute>} />
        <Route path="apps/client" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AppsClient /></Suspense></ProtectedRoute>} />
        <Route path="apps/affiliate" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AppsAffiliate /></Suspense></ProtectedRoute>} />
        <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />
        <Route path="team" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Team /></Suspense></ProtectedRoute>} />
        <Route path="document-center" element={<Suspense fallback={<LoadingFallback />}><DocumentCenter /></Suspense>} />
        <Route path="roles" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Roles /></Suspense></ProtectedRoute>} />
        <Route path="user-roles" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><UserRoles /></Suspense></ProtectedRoute>} />
        <Route path="integrations" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Integrations /></Suspense></ProtectedRoute>} />
        <Route path="support" element={<Suspense fallback={<LoadingFallback />}><Support /></Suspense>} />
        <Route path="system-map" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><SystemMap /></Suspense></ProtectedRoute>} />
        <Route path="whitelabel/branding" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><WhiteLabelBranding /></Suspense></ProtectedRoute>} />
        <Route path="whitelabel/domains" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><WhiteLabelDomains /></Suspense></ProtectedRoute>} />
        <Route path="whitelabel/plans" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><WhiteLabelPlans /></Suspense></ProtectedRoute>} />
        <Route path="whitelabel/tenants" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><WhiteLabelTenants /></Suspense></ProtectedRoute>} />
        
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
            <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
              <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                🏠 Go to Dashboard
              </button>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;