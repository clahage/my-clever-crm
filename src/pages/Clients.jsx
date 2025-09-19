import React from 'react';

export default function Clients() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Client Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold">Active Clients</h3>
          <p className="text-2xl font-bold">18</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold">Pending</h3>
          <p className="text-2xl font-bold">6</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold">Archived</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Recent Clients</h3>
        <div className="space-y-2">
          <div className="p-3 border rounded">John Smith - Active</div>
          <div className="p-3 border rounded">Jane Doe - Pending</div>
          <div className="p-3 border rounded">Bob Johnson - Active</div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <p className="mb-4">This page is now managed via the Contacts page. Please use the Contacts tab for all client management.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/contacts?category=client')}>Go to Clients</button>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust the import based on your file structure

export default function Clients() {
  const navigate = useNavigate();

  // Query to get all clients with category exactly equal to 'client'
  console.log('Clients query: filtering for category = client');
  const q = query(
    collection(db, 'contacts'),
    where('category', '==', 'client')
  );

  const handleDelete = async (clientId) => {
    await deleteDoc(doc(db, 'contacts', clientId));
    // Optionally, you can navigate or update the UI after deletion
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <p className="mb-4">This page is now managed via the Contacts page. Please use the Contacts tab for all client management.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/contacts?category=client')}>Go to Clients</button>
    </div>
  );
}
