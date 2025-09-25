import React from 'react';

const UserStatsWidget = ({ stats, darkMode }) => {
  if (!stats) return null;
  return (
    <div className={`rounded-xl p-4 shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} transition-colors duration-300`}>
      <h3 className="text-lg font-bold mb-2">User Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-3">
          <div className="text-xs font-semibold">Total Users</div>
          <div className="text-xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-purple-500 text-white rounded-lg p-3">
          <div className="text-xs font-semibold">Admins</div>
          <div className="text-xl font-bold">{stats.admins}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-3">
          <div className="text-xs font-semibold">Active Users</div>
          <div className="text-xl font-bold">{stats.activeUsers}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-3">
          <div className="text-xs font-semibold">Pending Invites</div>
          <div className="text-xl font-bold">{stats.pendingInvites}</div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsWidget;
