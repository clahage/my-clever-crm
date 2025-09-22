import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AddContactModal from '../components/AddContactModal';
import { UserPlus, Search, Filter, Users, UserCheck, Building, Briefcase, Phone } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Contact type colors for visual distinction
  const typeColors = {
    Lead: 'bg-blue-100 text-blue-800',
    Client: 'bg-green-100 text-green-800',
    Affiliate: 'bg-purple-100 text-purple-800',
    Vendor: 'bg-yellow-100 text-yellow-800',
    Employee: 'bg-gray-100 text-gray-800',
    Other: 'bg-pink-100 text-pink-800'
  };

  // Lead score colors (1-6 scale)
  const scoreColors = {
    6: 'bg-red-500',     // Hot
    5: 'bg-orange-500',  // Warm
    4: 'bg-yellow-500',  // Interested
    3: 'bg-green-500',   // Neutral
    2: 'bg-blue-500',    // Cool
    1: 'bg-gray-500'     // Cold
  };

  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    }, (error) => {
      console.error('Error loading contacts:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(contact => 
        (contact.type || contact.category || 'Other').toLowerCase() === filterType.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contact => {
        const searchLower = searchTerm.toLowerCase();
        return (
          contact.firstName?.toLowerCase().includes(searchLower) ||
          contact.lastName?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredContacts(filtered);
  }, [contacts, filterType, searchTerm]);

  const handleAddContact = () => {
    setEditingContact(null);
    setShowAddModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingContact(null);
  };

  const handleModalSave = () => {
    setShowAddModal(false);
    setEditingContact(null);
    // The modal handles the actual save to Firebase
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Master Contact List</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              All contacts across categories • Total: {contacts.length} contacts
            </p>
          </div>
          <button
            onClick={handleAddContact}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New Contact
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                All ({contacts.length})
              </button>
              <button
                onClick={() => setFilterType('lead')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'lead' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setFilterType('client')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'client' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setFilterType('affiliate')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'affiliate' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Affiliates
              </button>
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.company && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {contact.company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        typeColors[contact.type || contact.category || 'Other']
                      }`}>
                        {contact.type || contact.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {contact.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {contact.source || 'Manual'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.leadScore && (
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${scoreColors[contact.leadScore]}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.leadScore}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' 
                    ? 'No contacts found matching your criteria' 
                    : 'No contacts yet. Add your first contact!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showAddModal && (
        <AddContactModal
          isOpen={showAddModal}
          onClose={handleModalClose}
          onSave={handleModalSave}
          contact={editingContact}
          existingContacts={contacts}
        />
      )}
    </div>
  );
};

export default Contacts;