import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { UserService } from '../services/userService.js';
import CreateUserModal from './CreateUserModal.jsx';
import EditUserModal from './EditUserModal.jsx';
import UserStatsWidget from './UserStatsWidget.jsx';
import UserAnalyticsChart from './UserAnalyticsChart.jsx';
import AdminNotificationCenter from './AdminNotificationCenter.jsx';
import UserActivityTimeline from './UserActivityTimeline.jsx';

const UserManagementPanel = ({ db, auth, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const userService = new UserService(db, auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const allUsers = await userService.getUsers();
    setUsers(allUsers);
    setStats({
      totalUsers: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin' || u.role === 'master').length,
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      pendingInvites: allUsers.filter(u => u.status === 'pending').length,
    });
  };

  const handleCreate = async (form) => {
    await userService.createUser(form, 'admin');
    setShowCreate(false);
    fetchUsers();
  };

  const handleEdit = async (form) => {
    await userService.updateUserProfile(form.uid, form);
    setShowEdit(false);
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`p-8 rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full max-w-5xl mx-auto`}>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <UserStatsWidget stats={stats} darkMode={darkMode} />
        <AdminNotificationCenter darkMode={darkMode} />
      </div>
      <div className="mb-8">
        <UserAnalyticsChart data={users.map(u => ({
          date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
          totalUsers: stats?.totalUsers || 0,
          activeUsers: stats?.activeUsers || 0,
          admins: stats?.admins || 0,
        }))} darkMode={darkMode} />
      </div>
      <div className="mb-8">
        <UserActivityTimeline darkMode={darkMode} />
      </div>
      <div className="flex justify-between items-center mt-8 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded border w-64"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => setShowCreate(true)}
        >
          + Add User
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="min-w-full bg-transparent">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Display Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.uid} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.displayName}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'master' ? 'bg-purple-600 text-white' : user.role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>{user.role}</span>
                </td>
                <td className="px-4 py-2">{user.status}</td>
                <td className="px-4 py-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 mr-2" onClick={() => { setSelectedUser(user); setShowEdit(true); }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} darkMode={darkMode} />
      <EditUserModal isOpen={showEdit} onClose={() => setShowEdit(false)} user={selectedUser} onUpdate={handleEdit} darkMode={darkMode} />
    </div>
  );
};

export default UserManagementPanel;
