import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    console.log('Contacts: getting all documents');
    const q = query(collection(db, 'contacts'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Found contacts:', contactsData.length);
      setContacts(contactsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Contacts</h1>
          <div className="text-sm text-gray-500">
            Total: {contacts.length} contacts
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contact.name || `${contact.firstName} ${contact.lastName}`}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.category === 'lead' ? 'bg-blue-100 text-blue-800' :
                  contact.category === 'client' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contact.category}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="font-medium mr-2">📧</span>
                  {contact.email}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">📱</span>
                  {contact.phone}
                </div>
                {contact.company && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🏢</span>
                    {contact.company}
                  </div>
                )}
                {contact.status && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">📊</span>
                    Status: {contact.status}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition">
                  View Details
                </button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contacts;