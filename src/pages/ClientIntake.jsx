import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UltimateContactForm from '../components/UltimateContactForm';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function ClientIntake() {
  const navigate = useNavigate();
  const location = useLocation();
  const { contactId, contactData } = location.state || {};
  const [saving, setSaving] = useState(false);
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      console.log(contactId ? 'Updating contact:' : 'Saving new contact:', formData);

      let docRef;
      if (contactId) {
        // Update existing contact
        await updateDoc(doc(db, 'contacts', contactId), {
          ...formData,
          updatedAt: new Date()
        });
        alert('Contact updated successfully!');
        navigate(`/contacts/${contactId}`);
      } else {
        // Create new contact
        docRef = await addDoc(collection(db, 'contacts'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // navigate to the newly created contact's page if route exists
        navigate(`/contacts/${docRef.id}`);
      }
    } catch (err) {
      console.error('Failed to create/update contact from intake:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // go back to contacts list
    navigate('/contacts');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Contact Intake</h1>
      <UltimateContactForm
        initialData={contactData || {}}
        onSave={handleSave}
        onCancel={handleCancel}
        contactId={contactId || null}
      />
    </div>
  );
}
