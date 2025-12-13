import React from 'react';
import AdminToolsPage from '../../pages/AdminTools';

// Wrapper for embedding AdminTools in dashboard
export default function AdminTools(props) {
  return <AdminToolsPage {...props} embedded />;
}
