import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedLayout from "@/layout/ProtectedLayout.jsx";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Logout from "@/routes/Logout.jsx";
import AuthDebug from "./pages/AuthDebug.jsx";
import LoginTest from "./pages/LoginTest.jsx";

// REAL feature screens (lazy)
const Dashboard      = lazy(() => import("@/components/Dashboard.jsx"));
const Contacts       = lazy(() => import("@/pages/ClientManagement.jsx"));
const AddClient      = lazy(() => import("@/pages/AddClient.jsx"));
const Disputes       = lazy(() => import("@/components/DisputeCenter.jsx"));
const Documents      = lazy(() => import("@/pages/ClientPortal/ClientDocuments.jsx"));
const Billing        = lazy(() => import("@/components/Billing.jsx"));
const Reports        = lazy(() => import("@/pages/ContactReports.jsx"));
const IDIQDashboard  = lazy(() => import("@/components/IDIQIntegration/IDIQDashboard.jsx"));
const AdminTools     = lazy(() => import("@/pages/AdminTools.jsx"));
const Settings       = lazy(() => import("@/pages/ClientManagement.jsx"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
            <Route path="/add-client" element={<Suspense fallback={<div />}>{<AddClient />}</Suspense>} />
            <Route path="/disputes"   element={<Suspense fallback={<div />}>{<Disputes />}</Suspense>} />
            <Route path="/documents"  element={<Suspense fallback={<div />}>{<Documents />}</Suspense>} />
            <Route path="/billing"    element={<Suspense fallback={<div />}>{<Billing />}</Suspense>} />
            <Route path="/reports"    element={<Suspense fallback={<div />}>{<Reports />}</Suspense>} />
            <Route path="/idiq"       element={<Suspense fallback={<div />}>{<IDIQDashboard />}</Suspense>} />
            <Route path="/admin-tools"element={<Suspense fallback={<div />}>{<AdminTools />}</Suspense>} />
            <Route path="/settings"   element={<Suspense fallback={<div />}>{<Settings />}</Suspense>} />
            <Route path="/logout"     element={<Logout />} />
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