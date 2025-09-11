import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import AddContactModal from '../components/AddContactModal';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState([]);

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle category from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) setActiveCategory(category);
  }, [location]);

  // Firestore listener for contacts
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let q = collection(db, 'contacts');
    if (activeCategory !== 'all') {
      // Case-insensitive category filtering
      q = query(q, where('category', 'in', [activeCategory, activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).toLowerCase()]));
    }
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Only show contacts with valid name and email
      const filtered = data.filter(contact => contact.firstName && contact.firstName !== 'N/A' && contact.email && contact.email !== 'N/A');
      setContacts(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [user, activeCategory]);

  // Category tab click handler
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    navigate(`/contacts?${params.toString()}`);
  };

  // Add Contact button handler
  const handleAddContact = () => {
    setIsModalOpen(true);
    setEditingContact(null);
  };

  // Edit Contact button handler
  const handleEditContact = (contact) => {
    alert(`Edit clicked for: ${contact.firstName} ${contact.lastName}`);
    console.log('handleEditContact called with:', contact);
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <div className="mb-4 flex gap-2">
        {['all', 'lead', 'client', 'vendor', 'affiliate', 'professional'].map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 rounded ${activeCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button className="ml-auto bg-green-500 text-white px-4 py-2 rounded" onClick={handleAddContact}>Add Contact</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Lead Score</th>
                <th className="border px-2 py-1">Urgency</th>
                <th className="border px-2 py-1">Source</th>
                <th className="border px-2 py-1">Timeline</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => {
                // Color coding for lead score
                let scoreColor = 'bg-gray-200 text-gray-800';
                const score = Number(contact.leadScore);
                if (score >= 8) scoreColor = 'bg-green-100 text-green-800';
                else if (score >= 5) scoreColor = 'bg-yellow-100 text-yellow-800';
                else if (score >= 1) scoreColor = 'bg-red-100 text-red-800';
                // Color coding for urgency
                let urgencyColor = 'bg-gray-100 text-gray-800';
                if (contact.urgencyLevel === 'High' || contact.urgencyLevel === 'Critical') urgencyColor = 'bg-red-100 text-red-800';
                else if (contact.urgencyLevel === 'Medium') urgencyColor = 'bg-yellow-100 text-yellow-800';
                else if (contact.urgencyLevel === 'Low') urgencyColor = 'bg-green-100 text-green-800';
                return (
                  <tr key={contact.id}>
                    <td className="border px-2 py-1">{(contact.firstName || '') + ' ' + (contact.lastName || '')}</td>
                    <td className="border px-2 py-1">{contact.email || contact.phone}</td>
                    <td className="border px-2 py-1">{contact.category ? contact.category.charAt(0).toUpperCase() + contact.category.slice(1).toLowerCase() : ''}</td>
                    <td className={`border px-2 py-1 text-center rounded ${scoreColor}`}>{contact.leadScore ? contact.leadScore : ''}</td>
                    <td className={`border px-2 py-1 text-center rounded ${urgencyColor}`}>{contact.urgencyLevel ? contact.urgencyLevel : ''}</td>
                    <td className="border px-2 py-1">{contact.source || ''}</td>
                    <td className="border px-2 py-1">{contact.timeline || ''}</td>
                    <td className="border px-2 py-1">{contact.responseStatus || ''}</td>
                    <td className="border px-2 py-1 flex gap-2">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        View Details
                      </button>
                      <button className="text-gray-600 underline" onClick={() => {
                        handleEditContact(contact);
                      }}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        contact={editingContact}
      />
    </div>
  );
};

export default Contacts;