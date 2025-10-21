import React from 'react';
import { useNavigate } from 'react-router-dom';
import UltimateClientForm from '../components/UltimateClientForm';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientIntake() {
  const navigate = useNavigate();

  const handleSave = async (finalData) => {
    try {
      // augment with metadata
      const payload = {
        ...finalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const ref = await addDoc(collection(db, 'contacts'), payload);

      // navigate to the newly created contact's page if route exists
      navigate(`/contacts/${ref.id}`);
    } catch (err) {
      console.error('Failed to create contact from intake:', err);
      // keep user on page; in a fuller integration we'd show a toast
    }
  };

  const handleCancel = () => {
    // go back to contacts list
    navigate('/contacts');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Client Intake</h1>
      <UltimateClientForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
