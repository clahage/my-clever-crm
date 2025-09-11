import React, { useState } from 'react';

const demoUsers = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'Manager' },
  { id: 3, name: 'Carol', role: 'Agent' },
];
const roles = ['Admin', 'Manager', 'Agent', 'Viewer'];

export default function AdminPermissions() {
  const [users, setUsers] = useState(demoUsers);

  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Role Management</h1>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="p-2">{user.name}</td>
              <td className="p-2">
                <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className="border rounded p-1">
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
