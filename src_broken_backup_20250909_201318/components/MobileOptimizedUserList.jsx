import React from 'react';

// MobileOptimizedUserList.jsx - Touch-friendly user management for mobile
const MobileOptimizedUserList = ({ users, onEdit, darkMode }) => (
  <div className={`mobile-user-list p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg`}>  
    <h3 className="text-lg font-bold mb-4">Users</h3>
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {users.map(user => (
        <li key={user.uid} className="py-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">{user.displayName || user.email}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.role} • {user.status}</div>
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700" onClick={() => onEdit(user)}>Edit</button>
        </li>
      ))}
    </ul>
  </div>
);

export default MobileOptimizedUserList;
