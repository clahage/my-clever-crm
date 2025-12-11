// src/App.jsx - SpeedyCRM Complete Application Router
// VERSION: 3.0 - HYBRID HUB ARCHITECTURE INTEGRATION
// LAST UPDATED: 2025-11-06 - All 18 Hubs Integrated
import EmailWorkflowDashboard from './components/EmailWorkflowDashboard';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ProtectedLayout from '@/layout/ProtectedLayout';

// Existing imports...
import Products from '@/pages/Products';
import IDIQEnrollmentWizard from './components/IDIQEnrollmentWizard';
import FinancialPlanningHub from './pages/hubs/FinancialPlanningHub.jsx';

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
// SMART REDIRECT COMPONENT - Redirects to SmartDashboard
// ============================================================================
const SmartRedirect = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Always redirect to SmartDashboard - it handles role-based routing internally
  return <Navigate to="/smart-dashboard" replace />;
};

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const SmartDashboard = lazy(() => import('@/pages/SmartDashboard'));
const Home = lazy(() => import('@/pages/Home'));
const IDIQDashboard = lazy(() => import("@/components/IDIQDashboard"));
const CreditReports = lazy(() => import("@/components/CreditReports"));
const ClientPortal = lazy(() => import('@/pages/ClientPortal'));
const ClientDashboard = lazy(() => import('@/pages/ClientPortal/ClientDashboard'));
const ContactDetailPage = lazy(() => import('./pages/ContactDetailPage'));
const Portal = lazy(() => import('@/pages/Portal'));
const CreditReportWorkflow = lazy(() => import('@/pages/CreditReportWorkflow'));
const AIReviewDashboard = lazy(() => import('@/pages/AIReviewDashboard'));
const AIReviewEditor = lazy(() => import('@/components/AIReviewEditor'));
const CreditAnalysisEngine = lazy(() => import('@/pages/CreditAnalysisEngine'));
const PredictiveAnalytics = lazy(() => import('@/pages/PredictiveAnalytics'));

// ===== CONTACT & CRM PAGES =====
const Contacts = lazy(() => import('@/pages/Contacts'));
const DuplicateManager = lazy(() => import('@/components/DuplicateManager'));
const ClientIntake = lazy(() => import('@/pages/ClientIntake'));
const Pipeline = lazy(() => import('@/pages/Pipeline'));
const ContactImport = lazy(() => import('@/pages/ContactImport'));
const ContactExport = lazy(() => import('@/pages/ContactExport'));
const ContactReports = lazy(() => import('@/pages/ContactReports'));
const Segments = lazy(() => import('@/pages/Segments'));

// ===== CREDIT MANAGEMENT =====
const CreditSimulator = lazy(() => import('@/pages/CreditSimulator'));
const BusinessCredit = lazy(() => import('@/pages/BusinessCredit'));
const CreditScores = lazy(() => import('@/pages/CreditScores'));
const DisputeLetters = lazy(() => import('@/pages/DisputeLetters'));
const DisputeStatus = lazy(() => import('@/pages/DisputeStatus'));
const CreditMonitoring = lazy(() => import('@/pages/CreditMonitoring'));

// ===== COMMUNICATION =====
const Letters = lazy(() => import('@/pages/Letters'));
const Emails = lazy(() => import('@/pages/Emails'));
const SMS = lazy(() => import('@/pages/SMS'));
const DripCampaigns = lazy(() => import('@/pages/DripCampaigns'));
const Templates = lazy(() => import('@/pages/Templates'));
const CallLogs = lazy(() => import('@/pages/CallLogs'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// ===== LEARNING =====
const LearningCenter = lazy(() => import('@/pages/LearningCenter'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Certificates = lazy(() => import('@/pages/Certificates'));

// ===== PAYMENTS =====
const PaymentsDashboard = lazy(() => import('@/pages/Payments/PaymentsDashboard'));
const ClientPaymentSetup = lazy(() => import('@/pages/Payments/ClientPaymentSetup'));
const PaymentTracking = lazy(() => import('@/pages/Payments/PaymentTracking'));
const RecurringPayments = lazy(() => import('@/pages/Payments/RecurringPayments'));
const PaymentHistory = lazy(() => import('@/pages/Payments/PaymentHistory'));
const CollectionList = lazy(() => import('@/pages/Payments/CollectionList'));
const PaymentReconciliation = lazy(() => import('@/pages/Payments/PaymentReconciliation'));

// ===== DOCUMENTS =====
const Documents = lazy(() => import('@/pages/Documents'));
const EContracts = lazy(() => import('@/pages/EContracts'));
const Forms = lazy(() => import('@/pages/Forms'));
const FullAgreement = lazy(() => import('@/pages/FullAgreement'));
const InformationSheet = lazy(() => import('@/pages/InformationSheet'));
const PowerOfAttorney = lazy(() => import('@/pages/PowerOfAttorney'));
const ACHAuthorization = lazy(() => import('@/pages/ACHAuthorization'));
const Addendums = lazy(() => import('@/pages/Addendums'));
const DocumentStorage = lazy(() => import('@/pages/DocumentStorage'));

// ===== BUSINESS TOOLS =====
const Companies = lazy(() => import('@/pages/Companies'));
const Location = lazy(() => import('@/pages/Location'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const Affiliates = lazy(() => import('@/pages/Affiliates'));
const Billing = lazy(() => import('@/pages/BillingPage'));

// ===== SCHEDULING =====
const Calendar = lazy(() => import('@/pages/Calendar'));
const Appointments = lazy(() => import('@/pages/Appointments'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Reminders = lazy(() => import('@/pages/Reminders'));

// ===== ANALYTICS & REPORTING =====
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
// ===== 🎯 HYBRID HUB IMPORTS (41 Hubs - ALL HUBS) =====
// ============================================================================
const AffiliatesHub = lazy(() => import('@/pages/hubs/AffiliatesHub'));
const AIHub = lazy(() => import('@/pages/hubs/AIHub'));
const AnalyticsHub = lazy(() => import('@/pages/hubs/AnalyticsHub'));
const AutomationHub = lazy(() => import('@/pages/hubs/AutomationHub'));
const BillingHub = lazy(() => import('@/pages/hubs/BillingHub'));
const BillingPaymentsHub = lazy(() => import('@/pages/hubs/BillingPaymentsHub'));
const PaymentIntegrationHub = lazy(() => import('@/pages/hubs/PaymentIntegrationHub'));
const BureauCommunicationHub = lazy(() => import('@/pages/hubs/BureauCommunicationHub'));
const CalendarSchedulingHub = lazy(() => import('@/pages/hubs/CalendarSchedulingHub'));
const CertificationSystem = lazy(() => import('@/pages/CertificationSystem')); // Restored - correct path
const ClientSuccessRetentionHub = lazy(() => import('@/pages/hubs/ClientSuccessRetentionHub'));
const ClientsHub = lazy(() => import('@/pages/hubs/ClientsHub'));
const CollectionsARHub = lazy(() => import('@/pages/hubs/CollectionsARHub'));
const CommunicationsHub = lazy(() => import('@/pages/hubs/CommunicationsHub'));
const ComplianceHub = lazy(() => import('@/pages/hubs/ComplianceHub'));
const ContentCreatorSEOHub = lazy(() => import('@/pages/hubs/ContentCreatorSEOHub'));
const ContractManagementHub = lazy(() => import('@/pages/hubs/ContractManagementHub'));
const CreditReportsHub = lazy(() => import('@/pages/hubs/CreditReportsHub'));
// DashboardHub removed - consolidated into SmartDashboard
const DisputeAdminPanel = lazy(() => import('@/pages/hubs/DisputeAdminPanel'));
const DisputeHub = lazy(() => import('@/pages/hubs/DisputeHub'));
const DocumentsHub = lazy(() => import('@/pages/hubs/DocumentsHub'));
const DripCampaignsHub = lazy(() => import('@/pages/hubs/DripCampaignsHub'));
const LearningHub = lazy(() => import('@/pages/hubs/LearningHub'));
const MarketingHub = lazy(() => import('@/pages/hubs/MarketingHub'));
const MobileAppHub = lazy(() => import('@/pages/hubs/MobileAppHub'));
const OnboardingWelcomeHub = lazy(() => import('@/pages/hubs/OnboardingWelcomeHub'));
const ProgressPortalHub = lazy(() => import('@/pages/hubs/ProgressPortalHub'));
const ReferralEngineHub = lazy(() => import('@/pages/hubs/ReferralEngineHub'));
const ReferralPartnerHub = lazy(() => import('@/pages/hubs/ReferralPartnerHub'));
const ReportsHub = lazy(() => import('@/pages/hubs/ReportsHub'));
const ResourceLibraryHub = lazy(() => import('@/pages/hubs/ResourceLibraryHub'));
const RevenueHub = lazy(() => import('@/pages/hubs/RevenueHub'));
const RevenuePartnershipsHub = lazy(() => import('@/pages/hubs/RevenuePartnershipsHub'));
const ReviewsReputationHub = lazy(() => import('@/pages/hubs/ReviewsReputationHub'));
const SettingsHub = lazy(() => import('@/pages/hubs/SettingsHub'));
const SocialMediaHub = lazy(() => import('@/pages/hubs/SocialMediaHub'));
const SupportHub = lazy(() => import('@/pages/hubs/SupportHub'));
const TasksSchedulingHub = lazy(() => import('@/pages/hubs/TasksSchedulingHub'));
const TaxServicesHub = lazy(() => import('@/pages/hubs/TaxServicesHub'));
const TrainingHub = lazy(() => import('@/pages/hubs/TrainingHub'));
const WebsiteLandingPagesHub = lazy(() => import('@/pages/hubs/WebsiteLandingPagesHub'));

// ===== NEW ENTERPRISE AI HUBS (November 2025) =====
const RentalApplicationBoostHub = lazy(() => import('@/pages/hubs/RentalApplicationBoostHub'));
const MortgageReadinessHub = lazy(() => import('@/pages/hubs/MortgageReadinessHub'));
const AutoLoanConciergeHub = lazy(() => import('@/pages/hubs/AutoLoanConciergeHub'));
const CreditEmergencyResponseHub = lazy(() => import('@/pages/hubs/CreditEmergencyResponseHub'));
const AttorneyNetworkHub = lazy(() => import('@/pages/hubs/AttorneyNetworkHub'));
const CertificationAcademyHub = lazy(() => import('@/pages/hubs/CertificationAcademyHub'));
const WhiteLabelCRMHub = lazy(() => import('@/pages/hubs/WhiteLabelCRMHub'));

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================
const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Normalize allowedRoles to an array. Support legacy requiredRole and new requiredRoles.
  let allowedRoles = null;
  if (requiredRoles) {
    allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  } else if (requiredRole) {
    allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  }

  if (allowedRoles) {
    const userRole = userProfile?.role || currentUser?.role || 'user';

    // Convert numeric role arrays to strings for consistent comparison, but keep non-numeric role checks.
    const normalizedAllowed = allowedRoles.map(r => (typeof r === 'number' ? String(r) : r));
    const normalizedUserRole = typeof userRole === 'number' ? String(userRole) : userRole;

    console.debug && console.debug('🔒 Protected Route Check:', { userRole: normalizedUserRole, allowedRoles: normalizedAllowed });

    if (normalizedUserRole === 'masterAdmin') {
      return <>{children}</>;
    }

    if (normalizedAllowed.includes('admin') && normalizedUserRole === 'admin') {
      return <>{children}</>;
    }

    if (normalizedAllowed.includes('user') && (normalizedUserRole === 'user' || normalizedUserRole === 'client')) {
      return <>{children}</>;
    }

    // Check numeric/string role membership
    if (normalizedAllowed.includes(normalizedUserRole)) {
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
              Required: {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles} | Your role: {userRole}
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

        {/* SMART DASHBOARD - Intelligent Role-Based Landing Page */}
        <Route path="smart-dashboard" element={<Suspense fallback={<LoadingFallback />}><SmartDashboard /></Suspense>} />

{/* Dashboard Routes */}
        <Route path="dashboard" element={<Navigate to="/smart-dashboard" replace />} />
        {/* Home - Welcome Hub (separate from analytics dashboard) */}
        <Route path="home" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
        <Route path="client-portal" element={<Suspense fallback={<LoadingFallback />}><ClientPortal /></Suspense>} />
        <Route path="client" element={<Suspense fallback={<LoadingFallback />}><ClientDashboard /></Suspense>} />
        <Route path="portal" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Portal /></Suspense></ProtectedRoute>} />
        <Route path="credit-report-workflow" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><CreditReportWorkflow /></Suspense></ProtectedRoute>} />
        <Route path="admin/ai-reviews" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AIReviewDashboard /></Suspense></ProtectedRoute>} />
        <Route path="admin/ai-reviews/:reviewId" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><AIReviewEditor /></Suspense></ProtectedRoute>} />
        <Route path="credit-analysis" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><CreditAnalysisEngine /></Suspense></ProtectedRoute>} />
        <Route path="predictive-analytics" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><PredictiveAnalytics /></Suspense></ProtectedRoute>} />

        {/* ============================================================================ */}
        {/* REDIRECTS: Standalone pages → Parent Hubs */}
        {/* ============================================================================ */}

        {/* ============================================================================ */}
        {/* CLIENTS & CONTACTS SECTION */}
        {/* ============================================================================ */}

        {/* Contacts - Redirect to clients-hub */}
        <Route path="contacts" element={<Navigate to="/clients-hub" replace />} />
        <Route path="contacts/:id" element={<Suspense fallback={<LoadingFallback />}><ContactDetailPage /></Suspense>} />
        <Route path="intake" element={<Navigate to="/clients-hub" replace />} />
        <Route path="new-client" element={<Navigate to="/clients-hub" replace />} />

        {/* Pipeline - Standalone AND ClientsHub Tab 12 */}
        <Route 
          path="pipeline" 
          element={
            <ProtectedRoute requiredRole="user">
              <Suspense fallback={<LoadingFallback />}>
                <Pipeline />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* ===== DUPLICATE MANAGER - AI-POWERED CONTACT DEDUPLICATION ===== */}
        <Route 
          path="duplicate-manager" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<LoadingFallback />}>
                <DuplicateManager />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* Disputes Hub redirects */}
        <Route path="credit-simulator" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="business-credit" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="credit-scores" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="dispute-letters" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="dispute-center" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="dispute-status" element={<Navigate to="/dispute-hub" replace />} />
        <Route path="admin/dispute-admin-panel" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><DisputeAdminPanel /></Suspense></ProtectedRoute>} />
        <Route path="credit-reports" element={<Navigate to="/credit-hub" replace />} />
        <Route path="idiq-dashboard" element={<Navigate to="/credit-hub" replace />} />
        <Route path="credit-monitoring" element={<Navigate to="/credit-hub" replace />} />
        <Route path="letters" element={<Navigate to="/dispute-hub" replace />} />

        {/* Communications Hub redirects */}
        <Route path="emails" element={<Navigate to="/comms-hub" replace />} />
        <Route path="communications" element={<Navigate to="/comms-hub" replace />} />
        <Route path="email-workflows" element={<Navigate to="/comms-hub" replace />} />
        <Route path="sms" element={<Navigate to="/comms-hub" replace />} />
        <Route path="drip-campaigns" element={<Navigate to="/marketing-hub" replace />} />
        <Route path="templates" element={<Navigate to="/documents-hub" replace />} />
        <Route path="call-logs" element={<Navigate to="/comms-hub" replace />} />
        <Route path="notifications" element={<Navigate to="/comms-hub" replace />} />

        {/* Learning Hub redirects */}
        <Route path="learning-center" element={<Navigate to="/learning-hub" replace />} />
        <Route path="achievements" element={<Navigate to="/learning-hub" replace />} />
        <Route path="certificates" element={<Navigate to="/learning-hub" replace />} />

        {/* Documents Hub redirects */}
        <Route path="documents" element={<Navigate to="/documents-hub" replace />} />
        <Route path="econtracts" element={<Navigate to="/documents-hub" replace />} />
        <Route path="forms" element={<Navigate to="/documents-hub" replace />} />
        <Route path="full-agreement" element={<Navigate to="/documents-hub" replace />} />
        <Route path="information-sheet" element={<Navigate to="/documents-hub" replace />} />
        <Route path="power-of-attorney" element={<Navigate to="/documents-hub" replace />} />
        <Route path="ach-authorization" element={<Navigate to="/documents-hub" replace />} />
        <Route path="addendums" element={<Navigate to="/documents-hub" replace />} />
        <Route path="document-storage" element={<Navigate to="/documents-hub" replace />} />
        <Route path="document-center" element={<Navigate to="/documents-hub" replace />} />

        {/* Settings Hub redirects */}
        <Route path="companies" element={<Navigate to="/settings-hub" replace />} />
        <Route path="location" element={<Navigate to="/settings-hub" replace />} />
        <Route path="settings" element={<Navigate to="/settings-hub" replace />} />
        <Route path="team" element={<Navigate to="/settings-hub" replace />} />
        <Route path="roles" element={<Navigate to="/settings-hub" replace />} />
        <Route path="user-roles" element={<Navigate to="/settings-hub" replace />} />
        <Route path="integrations" element={<Navigate to="/settings-hub" replace />} />

        {/* Billing Hub redirects */}
        <Route path="invoices" element={<Navigate to="/billing-hub" replace />} />
        <Route path="payment-success" element={<Suspense fallback={<LoadingFallback />}><PaymentSuccess /></Suspense>} />
  <Route path="affiliates" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Affiliates /></Suspense></ProtectedRoute>} />
  <Route path="billing" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Billing /></Suspense></ProtectedRoute>} />
  <Route path="products" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><Products /></Suspense></ProtectedRoute>} />

  {/* Payment Management System Routes */}
  <Route path="payments" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin"]}><Suspense fallback={<LoadingFallback />}><PaymentsDashboard /></Suspense></ProtectedRoute>} />
  <Route path="payments/setup" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin", "client"]}><Suspense fallback={<LoadingFallback />}><ClientPaymentSetup /></Suspense></ProtectedRoute>} />
  <Route path="payments/tracking" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin", "client"]}><Suspense fallback={<LoadingFallback />}><PaymentTracking /></Suspense></ProtectedRoute>} />
  <Route path="payments/recurring" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin"]}><Suspense fallback={<LoadingFallback />}><RecurringPayments /></Suspense></ProtectedRoute>} />
  <Route path="payments/history" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin", "client"]}><Suspense fallback={<LoadingFallback />}><PaymentHistory /></Suspense></ProtectedRoute>} />
  <Route path="payments/collections" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin"]}><Suspense fallback={<LoadingFallback />}><CollectionList /></Suspense></ProtectedRoute>} />
  <Route path="payments/reconciliation" element={<ProtectedRoute requiredRoles={["admin", "masterAdmin"]}><Suspense fallback={<LoadingFallback />}><PaymentReconciliation /></Suspense></ProtectedRoute>} />
  <Route path="calendar" element={<Suspense fallback={<LoadingFallback />}><Calendar /></Suspense>} />
  <Route path="appointments" element={<Suspense fallback={<LoadingFallback />}><Appointments /></Suspense>} />
  <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><Tasks /></Suspense>} />
  <Route path="reminders" element={<Suspense fallback={<LoadingFallback />}><Reminders /></Suspense>} />
  <Route path="analytics" element={<Navigate to="/analytics-hub" replace />} />
  <Route path="reports" element={<Navigate to="/reports-hub" replace />} />
  <Route path="goals" element={<Navigate to="/analytics-hub" replace />} />
        {/* Resources & Support redirects */}
        <Route path="resources/articles" element={<Navigate to="/resources-hub" replace />} />
        <Route path="resources/faq" element={<Navigate to="/support-hub" replace />} />
        <Route path="support" element={<Navigate to="/support-hub" replace />} />

        {/* Apps redirects */}
        <Route path="apps/overview" element={<Navigate to="/mobile-app-hub" replace />} />
        <Route path="apps/employee" element={<Navigate to="/mobile-app-hub" replace />} />
        <Route path="apps/client" element={<Navigate to="/mobile-app-hub" replace />} />
        <Route path="apps/affiliate" element={<Navigate to="/mobile-app-hub" replace />} />

        {/* WhiteLabel redirects → Settings Hub */}
        <Route path="whitelabel/branding" element={<Navigate to="/settings-hub" replace />} />
        <Route path="whitelabel/domains" element={<Navigate to="/settings-hub" replace />} />
        <Route path="whitelabel/plans" element={<Navigate to="/settings-hub" replace />} />
        <Route path="whitelabel/tenants" element={<Navigate to="/settings-hub" replace />} />

        {/* System Map - keep as utility */}
        <Route path="system-map" element={<ProtectedRoute requiredRole="admin"><Suspense fallback={<LoadingFallback />}><SystemMap /></Suspense></ProtectedRoute>} />
        
  {/* IDIQ Enrollment / Reporting */}
  <Route
    path="idiq/enroll"
    element={
      <ProtectedRoute requiredRoles={[5,6,7,8]}>
        <Suspense fallback={<LoadingFallback />}>
          <IDIQEnrollmentWizard />
        </Suspense>
      </ProtectedRoute>
    }
  />

  <Route
    path="idiq/enroll/:contactId"
    element={
      <ProtectedRoute requiredRoles={[5,6,7,8]}>
        <Suspense fallback={<LoadingFallback />}>
          <IDIQEnrollmentWizard />
        </Suspense>
      </ProtectedRoute>
    }
  />

{/* ============================================================================ */}
{/* ===== 🎯 HYBRID HUB ROUTES (41 Hubs - ALL HUBS) ===== */}
{/* ============================================================================ */}

{/* Credit Reports Hub - Consolidated IDIQ System */}
<Route
  path="credit-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <CreditReportsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>


{/* Affiliates Hub - Complete affiliate management */}
<Route
  path="affiliates-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <AffiliatesHub />
      </Suspense>
    </ProtectedRoute>
  }
/>


{/* Automation Hub - Workflow automation and triggers */}
<Route
  path="automation-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <AutomationHub />
      </Suspense>
    </ProtectedRoute>
  }
/>
{/* AI Hub - AI-powered features and analytics */}
<Route
  path="ai-hub"

  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <AIHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Analytics Hub - Business intelligence and reporting */}
<Route
  path="analytics-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <AnalyticsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Billing Hub - Invoicing and payment management */}
<Route
  path="billing-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <BillingHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Billing Payments Hub - Redirect to main Billing Hub */}
<Route path="billing-payments-hub" element={<Navigate to="/billing-hub" replace />} />

{/* Payment Integration Hub - Stripe & PayPal integration */}
<Route
  path="payment-integration-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentIntegrationHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Clients Hub - Complete client management */}
<Route
  path="clients-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <ClientsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Communications Hub - Email, SMS, campaigns */}
<Route
  path="comms-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <CommunicationsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Compliance Hub - Regulatory compliance tools */}
<Route
  path="compliance-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <ComplianceHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Dashboard Hub - Redirects to SmartDashboard (consolidated) */}
<Route path="dashboard-hub" element={<Navigate to="/smart-dashboard" replace />} />

{/* Dispute Hub - Dispute management panel */}
<Route
  path="dispute-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <DisputeHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Documents Hub - Document management system */}
<Route
  path="documents-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <DocumentsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Learning Hub - Training and education */}
<Route
  path="learning-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <LearningHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Marketing Hub - Marketing campaigns and tools */}
<Route
  path="marketing-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <MarketingHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Payment Integration Hub - Payment processing */}
<Route
  path="payment-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentIntegrationHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Reports Hub - Comprehensive reporting */}
<Route
  path="reports-hub"
  element={
    <ProtectedRoute requiredRoles={['user', 'manager', 'admin', 'masterAdmin']}>
      <Suspense fallback={<LoadingFallback />}>
        <ReportsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Revenue Hub - Revenue tracking and analytics */}
<Route
  path="revenue-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <RevenueHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Settings Hub - System configuration */}
<Route
  path="settings-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <SettingsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Support Hub - Help desk and support resources */}
<Route
  path="support-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <SupportHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Tasks & Scheduling Hub - Task and calendar management */}
<Route
  path="tasks-hub"
  element={
    <ProtectedRoute requiredRole="prospect">
      <Suspense fallback={<LoadingFallback />}>
        <TasksSchedulingHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Tax Services Hub - AI-powered tax preparation and management */}
<Route
  path="tax-services-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <TaxServicesHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* ============================================================================ */}
{/* ===== 🆕 ADDITIONAL HUBS (23 NEW ROUTES) ===== */}
{/* ============================================================================ */}

{/* Bureau Communication Hub */}
<Route
  path="bureau-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <BureauCommunicationHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Calendar & Scheduling Hub */}
<Route
  path="calendar-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <CalendarSchedulingHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Certification System */}
<Route
  path="certification-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <CertificationSystem />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Client Success & Retention Hub */}
<Route
  path="client-success-hub"
  element={
    <ProtectedRoute requiredRole="manager">
      <Suspense fallback={<LoadingFallback />}>
        <ClientSuccessRetentionHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Collections & AR Hub */}
<Route
  path="collections-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <CollectionsARHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Content Creator & SEO Hub */}
<Route
  path="content-seo-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ContentCreatorSEOHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Contract Management Hub */}
<Route
  path="contracts-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ContractManagementHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Drip Campaigns Hub */}
<Route
  path="drip-campaigns-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <DripCampaignsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Mobile App Hub */}
<Route
  path="mobile-app-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <MobileAppHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* ============================================================================ */}
{/* ===== 🆕 NEW ENTERPRISE AI HUBS (November 2025) ===== */}
{/* ============================================================================ */}

{/* Rental Application Boost Hub - AI-powered rental preparation */}
<Route
  path="rental-boost-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <RentalApplicationBoostHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Mortgage Readiness Accelerator Hub - 90-day mortgage prep */}
<Route
  path="mortgage-readiness-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <MortgageReadinessHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Auto Loan Concierge Hub - AI auto financing */}
<Route
  path="auto-loan-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <AutoLoanConciergeHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Credit Emergency Response Hub - 7-14 day rapid repair */}
<Route
  path="credit-emergency-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <CreditEmergencyResponseHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Attorney Network Hub - FCRA/FDCPA violation cases and attorney matching */}
<Route
  path="attorney-network-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <AttorneyNetworkHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Certification Academy Hub - Credit repair professional training */}
<Route
  path="certification-academy-hub"
  element={
    <ProtectedRoute requiredRoles={[3,4,5,6,7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <CertificationAcademyHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* White Label CRM Licensing Hub - Partner management and licensing */}
<Route
  path="white-label-crm-hub"
  element={
    <ProtectedRoute requiredRoles={[7,8]}>
      <Suspense fallback={<LoadingFallback />}>
        <WhiteLabelCRMHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Onboarding & Welcome Hub */}
<Route
  path="onboarding-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <OnboardingWelcomeHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Progress Portal Hub (Client-facing) */}
<Route
  path="progress-portal-hub"
  element={
    <ProtectedRoute requiredRole="client">
      <Suspense fallback={<LoadingFallback />}>
        <ProgressPortalHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Referral Engine Hub */}
<Route
  path="referral-engine-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ReferralEngineHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Referral Partner Hub */}
<Route
  path="referral-partner-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ReferralPartnerHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Resource Library Hub */}
<Route
  path="resources-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ResourceLibraryHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Revenue Partnerships Hub */}
<Route
  path="revenue-partnerships-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <RevenuePartnershipsHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Reviews & Reputation Hub */}
<Route
  path="reviews-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <ReviewsReputationHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Social Media Hub */}
<Route
  path="social-media-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <SocialMediaHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Training Hub */}
<Route
  path="training-hub"
  element={
    <ProtectedRoute requiredRole="user">
      <Suspense fallback={<LoadingFallback />}>
        <TrainingHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Website & Landing Pages Hub */}
<Route
  path="website-hub"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <WebsiteLandingPagesHub />
      </Suspense>
    </ProtectedRoute>
  }
/>

{/* Dispute Admin Panel (Separate from Dispute Hub) */}
<Route
  path="dispute-admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={<LoadingFallback />}>
        <DisputeAdminPanel />
      </Suspense>
    </ProtectedRoute>
  }
/>

        <Route path="financial-planning-hub" element={<ProtectedRoute requiredRole="user"><Suspense fallback={<LoadingFallback />}><FinancialPlanningHub /></Suspense></ProtectedRoute>} />

  {/* 404 - NOT FOUND */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
            <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              <div className="text-8xl mb-4">🔍</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                404 - Page Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
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
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  // Default options
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  // Success
                  success: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  // Error
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Suspense fallback={<LoadingFallback />}>
                <AppContent />
              </Suspense>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;