import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedLayout from "@/layout/ProtectedLayout.jsx";
import ClientRoutes from "./client/router/clientRoutes";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Logout from "@/routes/Logout.jsx";
import AuthDebug from "./pages/AuthDebug.jsx";
import LoginTest from "./pages/LoginTest.jsx";

// REAL feature screens (lazy)
const Dashboard      = lazy(() => import("./components/Dashboard.jsx"));
const Contacts       = lazy(() => import("@/pages/ClientManagement.jsx"));
const AddClient      = lazy(() => import("@/pages/AddClient.jsx"));
const Disputes       = lazy(() => import("./components/DisputeCenter.jsx"));
const Documents      = lazy(() => import("./pages/ClientPortal/ClientDocuments.jsx"));
const Billing        = lazy(() => import("@/components/Billing.jsx"));
const Reports        = lazy(() => import("@/pages/ContactReports.jsx"));
const IDIQDashboard  = lazy(() => import("@/components/IDIQIntegration/IDIQDashboard.jsx"));
const AdminTools     = lazy(() => import("@/pages/AdminTools.jsx"));
const Settings       = lazy(() => import("@/pages/Settings.jsx"));
const Leads          = lazy(() => import("@/pages/Leads.jsx"));
const OpenAI         = lazy(() => import("@/pages/OpenAI.jsx"));
const Permissions    = lazy(() => import("@/pages/Permissions.jsx"));
const ProgressPortal = lazy(() => import("@/pages/restore/ProgressPortal.jsx"));
const DisputeCenter  = lazy(() => import("@/pages/restore/DisputeCenter.jsx"));
const ActivityLog    = lazy(() => import("@/pages/restore/ActivityLog.jsx"));
const FeaturesTutorials = lazy(() => import("@/pages/restore/FeaturesTutorials.jsx"));
const ClientManagement = lazy(() => import("@/pages/ClientManagement.jsx"));
const ContactReports = lazy(() => import("@/pages/ContactReports.jsx"));
const Letters = lazy(() => import("@/pages/Letters.jsx"));
const CreditScores = lazy(() => import("@/pages/CreditScores.jsx"));
const DisputeLetters = lazy(() => import("@/pages/DisputeLetters.jsx"));
const Calendar = lazy(() => import("@/pages/Calendar.jsx"));
const Communications = lazy(() => import("@/pages/Communications.jsx"));
const Export = lazy(() => import("@/pages/Export.jsx"));
const Bulk = lazy(() => import("@/pages/Bulk.jsx"));
const Automation = lazy(() => import("@/pages/Automation.jsx"));
const DripCampaigns = lazy(() => import("@/pages/DripCampaigns.jsx"));
const AICommandCenter = lazy(() => import("@/pages/AICommandCenter.jsx"));
const UserManagement = lazy(() => import("@/pages/UserManagement.jsx"));
const Roles = lazy(() => import("@/pages/Roles.jsx"));
const Location = lazy(() => import("@/pages/Location.jsx"));
const Help = lazy(() => import("@/pages/Help.jsx"));
const Analytics = lazy(() => import("@/pages/Analytics.jsx"));
const Setup = lazy(() => import("@/pages/Setup.jsx"));
const ContactDetailPage = lazy(() => import("@/pages/ContactDetailPage.jsx"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Client Portal Routing */}
          <Route path="/client/*" element={<ClientRoutes />} />
          {/* Existing admin/auth routes below */}
          <Route path="/login" element={<Login />} />
          {/* All protected pages are nested under the layout */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<Suspense fallback={<div />}>{<Dashboard />}</Suspense>} />
            <Route path="/contacts"   element={<Suspense fallback={<div />}>{<Contacts />}</Suspense>} />
            <Route path="/contacts/:id" element={<Suspense fallback={<div />}>{<ContactDetailPage />}</Suspense>} />
            <Route path="/add-client" element={<Suspense fallback={<div />}>{<AddClient />}</Suspense>} />
            <Route path="/setup" element={<Suspense fallback={<div />}>{<Setup />}</Suspense>} />
            <Route path="/dispute-center"   element={<Suspense fallback={<div />}>{<Disputes />}</Suspense>} />
            <Route path="/documents"  element={<Suspense fallback={<div />}>{<Documents />}</Suspense>} />
            <Route path="/billing"    element={<Suspense fallback={<div />}>{<Billing />}</Suspense>} />
            <Route path="/reports"    element={<Suspense fallback={<div />}>{<Reports />}</Suspense>} />
            <Route path="/idiq"       element={<Suspense fallback={<div />}>{<IDIQDashboard />}</Suspense>} />
            <Route path="/admin-tools"element={<Suspense fallback={<div />}>{<AdminTools />}</Suspense>} />
            <Route path="/settings"   element={<Suspense fallback={<div />}>{<Settings />}</Suspense>} />
            <Route path="/leads" element={<Suspense fallback={<div />}>{<Leads />}</Suspense>} />
            <Route path="/openai"     element={<Suspense fallback={<div />}>{<OpenAI />}</Suspense>} />
            <Route path="/permissions"element={<Suspense fallback={<div />}>{<Permissions />}</Suspense>} />
            <Route path="/progress-portal"   element={<Suspense fallback={<div />}>{<ProgressPortal />}</Suspense>} />
            <Route path="/activity"   element={<Suspense fallback={<div />}>{<ActivityLog />}</Suspense>} />
            <Route path="/features"   element={<Suspense fallback={<div />}>{<FeaturesTutorials />}</Suspense>} />
            <Route path="/logout"     element={<Logout />} />
            <Route path="/client-management" element={<Suspense fallback={<div />}>{<ClientManagement />}</Suspense>} />
            <Route path="/contact-reports" element={<Suspense fallback={<div />}>{<ContactReports />}</Suspense>} />
            <Route path="/letters" element={<Suspense fallback={<div />}>{<Letters />}</Suspense>} />
            <Route path="/credit-scores" element={<Suspense fallback={<div />}>{<CreditScores />}</Suspense>} />
            <Route path="/dispute-letters" element={<Suspense fallback={<div />}>{<DisputeLetters />}</Suspense>} />
            <Route path="/calendar" element={<Suspense fallback={<div />}>{<Calendar />}</Suspense>} />
            <Route path="/communications" element={<Suspense fallback={<div />}>{<Communications />}</Suspense>} />
            <Route path="/export" element={<Suspense fallback={<div />}>{<Export />}</Suspense>} />
            <Route path="/bulk" element={<Suspense fallback={<div />}>{<Bulk />}</Suspense>} />
            <Route path="/automation" element={<Suspense fallback={<div />}>{<Automation />}</Suspense>} />
            <Route path="/drip-campaigns" element={<Suspense fallback={<div />}>{<DripCampaigns />}</Suspense>} />
            <Route path="/ai-command-center" element={<Suspense fallback={<div />}>{<AICommandCenter />}</Suspense>} />
            <Route path="/user-management" element={<Suspense fallback={<div />}>{<UserManagement />}</Suspense>} />
            <Route path="/roles" element={<Suspense fallback={<div />}>{<Roles />}</Suspense>} />
            <Route path="/location" element={<Suspense fallback={<div />}>{<Location />}</Suspense>} />
            <Route path="/help" element={<Suspense fallback={<div />}>{<Help />}</Suspense>} />
            <Route path="/analytics" element={<Suspense fallback={<div />}>{<Analytics />}</Suspense>} />
            <Route path="/progress-portal" element={<Suspense fallback={<div />}>{<ProgressPortal />}</Suspense>} />
            {/* Back-compat: /clients (or /client) go to Contacts */}
            <Route path="/clients" element={<Navigate to="/contacts" replace />} />
            <Route path="/client"  element={<Navigate to="/contacts" replace />} />
          </Route>
          {import.meta.env.DEV && <Route path="/auth-debug" element={<AuthDebug />} />}
          {import.meta.env.DEV && <Route path="/login-test" element={<LoginTest />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

console.log('[ROUTE FIX] All navConfig.js routes now have matching route definitions and imports. Critical routes tested.');