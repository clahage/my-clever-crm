import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsersCog } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard bg-gray-50 dark:bg-gray-900 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Other admin cards/widgets can go here */}
        <Link to="/admin/users" className="group block rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6 transition-transform hover:scale-105 hover:shadow-2xl border border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-4">
            <FaUsersCog className="text-blue-600 dark:text-blue-400 text-4xl transition-colors group-hover:text-blue-800 group-hover:dark:text-blue-300" />
            <div>
              <div className="text-lg font-bold dark:text-white text-gray-900">User Management</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Manage users, roles, and permissions</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
