import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from '@/pages/ClientPortal/ClientLayout.jsx';
import ClientLogin from '../auth/ClientLogin';
import InviteAccept from '../auth/InviteAccept';
const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'));
const Reports   = lazy(() => import('@/pages/Reports.jsx'));
const Disputes  = lazy(() => import('@/pages/Disputes.jsx'));
const Documents = lazy(() => import('@/pages/Documents.jsx'));
import Messages from '../pages/Messages';
import Profile from '../pages/Profile';
import ClientProtectedRoute from './ClientProtectedRoute';

// Client Portal Routes Shell
// Implementation will follow after rules and structure review

const ClientRoutes = () => (
  <Routes>
    <Route path="/client/login" element={<ClientLogin />} />
    <Route path="/client/invite" element={<InviteAccept />} />
    <Route
      path="/client/*"
      element={
        <ClientProtectedRoute>
          <ClientLayout>
            <Routes>
              <Route path="" element={<Suspense fallback={<div />}><Dashboard /></Suspense>} />
              <Route path="dashboard" element={<Suspense fallback={<div />}><Dashboard /></Suspense>} />
              <Route path="reports" element={<Suspense fallback={<div />}><Reports /></Suspense>} />
              <Route path="disputes" element={<Suspense fallback={<div />}><Disputes /></Suspense>} />
              <Route path="documents" element={<Suspense fallback={<div />}><Documents /></Suspense>} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/client" replace />} />
            </Routes>
          </ClientLayout>
        </ClientProtectedRoute>
      }
    />
  </Routes>
);

export default ClientRoutes;
