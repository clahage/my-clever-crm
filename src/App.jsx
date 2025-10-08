// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts/providers (keep your existing ones)
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout
import ProtectedLayout from './layout/ProtectedLayout';

// If you have a real Home/Dashboard, import it; otherwise fallback:
const Home = lazy(() => import('./pages/Home.jsx').catch(() => ({ default: () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-slate-600 mt-2">No Home.jsx detected. This is a temporary dashboard.</p>
  </div>
)})));

// If you already created SystemMap.jsx this will load it; otherwise show a message.
const SystemMap = lazy(() => import('./pages/SystemMap.jsx').catch(() => ({ default: () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">System Map</h1>
    <p className="text-slate-600 mt-2">SystemMap.jsx not found. Create <code>src/pages/SystemMap.jsx</code> to enable the interactive graph.</p>
  </div>
)})));

const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage.jsx').catch(() => ({
  default: ({ title = 'Coming Soon', description = 'This page is a placeholder.' }) => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-slate-600 mt-2">{description}</p>
    </div>
  )
})));

// Document Center: If you already have a rich DocumentCenter.jsx, use it.
// Otherwise we render a single-hub Documents page and interpret /documents/* segments as tabs.
const DocumentCenter = lazy(() => import('./pages/DocumentCenter.jsx').catch(() => ({
  default: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Document Center</h1>
      <p className="text-slate-600 mt-2">
        A single hub for Agreements, ACH, Addenda, and all templates. Your nav items can point to
        <code className="mx-2">/documents</code> or <code className="mx-2">/documents/&lt;section&gt;</code> and this page will handle it.
      </p>
      <ul className="list-disc pl-6 mt-3 text-sm text-slate-700">
        <li>Expected file: <code>src/pages/DocumentCenter.jsx</code> (optional)</li>
        <li>If you keep individual links (e.g. “ACH Authorization”), route them to <code>/documents/ach</code>.</li>
      </ul>
    </div>
  )
})));

// Optional: Login page if you route unauth users here
const Login = lazy(() => import('./pages/Login.jsx').catch(() => ({ default: () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="max-w-sm w-full border rounded-xl p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-slate-600 mt-2">Implement <code>src/pages/Login.jsx</code> for a full login experience.</p>
    </div>
  </div>
)})));

function RoutePlaceholder({ title, description }) {
  // Helper to render a placeholder without needing separate files
  return (
    <PlaceholderPage
      title={title}
      description={
        <>
          <div className="mt-2">{description}</div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
            This is a working placeholder route. When you’re ready, replace this with a real page
            at the same path to avoid breaking navigation or URLs.
          </div>
        </>
      }
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <Routes>
                {/* Public auth routes (if any) */}
                <Route path="/login" element={<Login />} />

                {/* Protected application */}
                <Route element={<ProtectedLayout />}>
                  <Route index element={<Home />} />

                  {/* ---- Document Center (single hub + legacy child routes) ---- */}
                  <Route path="/documents" element={<DocumentCenter />} />
                  <Route path="/documents/*" element={<DocumentCenter />} />

                  {/* ---- Resources ---- */}
                  <Route
                    path="/resources/articles"
                    element={<RoutePlaceholder
                      title="Articles"
                      description="Knowledge base articles for clients, DIY users, and staff. Search, categories, tags, and role-based visibility planned." />}
                  />
                  <Route
                    path="/resources/faq"
                    element={<RoutePlaceholder
                      title="FAQ"
                      description="Frequently asked questions with smart suggestions, links to articles, and contact options." />}
                  />

                  {/* ---- White Label ---- */}
                  <Route
                    path="/whitelabel/branding"
                    element={<RoutePlaceholder
                      title="White Label: Branding"
                      description="Upload logos, pick brand colors, custom support email, and light/dark defaults per tenant." />}
                  />
                  <Route
                    path="/whitelabel/domains"
                    element={<RoutePlaceholder
                      title="White Label: Domains"
                      description="Connect custom domains/subdomains with guided DNS steps and automated SSL." />}
                  />
                  <Route
                    path="/whitelabel/plans"
                    element={<RoutePlaceholder
                      title="White Label: Plans & Billing"
                      description="Multi-tier plans, usage-based add-ons, billing portal integration, and coupons/affiliates." />}
                  />
                  <Route
                    path="/whitelabel/tenants"
                    element={<RoutePlaceholder
                      title="White Label: Tenants"
                      description="Provision, manage, and monitor tenant orgs. Role mapping, quotas, invoicing hooks." />}
                  />

                  {/* ---- Mobile Apps ---- */}
                  <Route
                    path="/apps/overview"
                    element={<RoutePlaceholder
                      title="Mobile Apps: Overview"
                      description="iOS/Android strategy, release channels, feature parity, deep link routes, and SSO." />}
                  />
                  <Route
                    path="/apps/employee"
                    element={<RoutePlaceholder
                      title="Employee App"
                      description="Field tools: lead capture, tasking, notes, notifications, and call/text logging." />}
                  />
                  <Route
                    path="/apps/client"
                    element={<RoutePlaceholder
                      title="Client App"
                      description="Client progress tracking, dispute uploads, payments, messages, and reminders." />}
                  />
                  <Route
                    path="/apps/affiliate"
                    element={<RoutePlaceholder
                      title="Affiliate App"
                      description="Referrals, payouts, tracked links, and co-branded content library." />}
                  />

                  {/* ---- System Map ---- */}
                  <Route path="/admin/system-map" element={<SystemMap />} />

                  {/* Fallback inside the protected area */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>

                {/* Catch-all (outside auth) */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
