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
