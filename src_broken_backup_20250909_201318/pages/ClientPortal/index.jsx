import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ClientDashboard from '@/pages/ClientPortal/ClientDashboard';
import ClientScores from '@/pages/ClientPortal/ClientScores';
import ClientDisputes from '@/pages/ClientPortal/ClientDisputes';
import ClientDocuments from '@/pages/ClientPortal/ClientDocuments';
import ClientMessages from '@/pages/ClientPortal/ClientMessages';
import ClientLayout from '@/pages/ClientPortal/ClientLayout';

const ClientPortal = () => {
  const { user } = useAuth();
  // For testing, allow any authenticated user
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ClientLayout>
      <Routes>
        <Route index element={<ClientDashboard />} />
        <Route path="scores" element={<ClientScores />} />
        <Route path="disputes" element={<ClientDisputes />} />
        <Route path="documents" element={<ClientDocuments />} />
        <Route path="messages" element={<ClientMessages />} />
      </Routes>
    </ClientLayout>
  );
};

export default ClientPortal;
