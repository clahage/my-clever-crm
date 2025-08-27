
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Permissions() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile & Permissions</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {user ? (
          <>
            <div className="mb-4">
              <span className="font-semibold">Name:</span> {user.displayName || 'N/A'}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Email:</span> {user.email}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Role:</span> {user.role || 'User'}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Status:</span> <span className="text-green-600 font-bold">Logged In</span>
            </div>
          </>
        ) : (
          <div className="text-red-600 font-bold">Not logged in</div>
        )}
      </div>
    </div>
  );
}
