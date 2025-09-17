import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, deleteDoc, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import ClientCreditCard from '../components/IDIQIntegration/ClientCreditCard';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [expandedCards, setExpandedCards] = useState({});
  const [expandLevel, setExpandLevel] = useState({}); // 0=collapsed, 1=basic, 2=full
  const [deleteModal, setDeleteModal] = useState({ open: false, contactId: null, contactName: '' });
  const location = useLocation();
  const showingClients = location.pathname.includes('client-management') || location.pathname.includes('clients');

  const navigate = useNavigate();
  useEffect(() => {
    console.log('ClientManagement: querying for category = client');
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'client')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Found clients:', clientsData.length);
      setClients(clientsData);
    });
    return () => unsubscribe();
  }, []);

  // Filter contacts based on route and status filter
  const filteredContacts = showingClients 
    ? clients.filter(c => (c.category || '').toLowerCase() === 'client')
    : clients.filter(c => (c.category || '').toLowerCase() === 'lead' || !c.category);

  const filteredClients = filteredContacts.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {showingClients ? 'Client Management' : 'Leads & Contacts'}
        </h1>
        <select 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
          value={statusFilter}
        >
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
          <option value="all">All (except Archived)</option>
          <option value="archived">Archived Only</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your clients and their information
          </p>
        </div>
        <button
          onClick={() => navigate('/add-client')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Contact
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 mb-4"
          >
            {/* LEVEL 0: Minimal - Always visible */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">
                  {[contact.prefix, contact.firstName, contact.lastName, contact.suffix].filter(Boolean).join(' ') || 'Unknown'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium
                  ${contact.category === 'lead' ? 'bg-yellow-100 text-yellow-800' : 
                    contact.category === 'client' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {contact.category || 'Contact'}
                </span>
                <span className={`px-2 py-1 rounded text-xs
                  ${contact.status === 'Active' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {contact.status || 'Active'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const level = (expandLevel[contact.id] || 0) + 1;
                    setExpandLevel({...expandLevel, [contact.id]: level > 2 ? 0 : level});
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {expandLevel[contact.id] === 2 ? '▼ Less' : 
                   expandLevel[contact.id] === 1 ? '▼ More' : '▶ Show'}
                </button>
                <button
                  onClick={() => navigate(`/add-client?edit=${contact.id}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
            {/* LEVEL 1: Basic info */}
            {expandLevel[contact.id] >= 1 && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {contact.email || 'No email'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {contact.phone || 'No phone'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Company:</span> {contact.company || 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Occupation:</span> {contact.occupation || 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Address:</span> {contact.address || 'N/A'}
                </div>
              </div>
            )}
            {/* LEVEL 2: Full info and actions */}
            {expandLevel[contact.id] === 2 && (
              <div className="mt-4 space-y-2 text-sm border-t pt-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">DOB:</span> {contact.dob || 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Status:</span> {contact.status || 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Category:</span> {contact.category || 'N/A'}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Notes:</span> {contact.consultationNotes || 'N/A'}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => setDeleteModal({ 
                      open: true, 
                      contactId: contact.id, 
                      contactName: `${contact.firstName} ${contact.lastName}` 
                    })}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
          </p>
          <button
            onClick={() => navigate('/add-client')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Add your first client
          </button>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete Contact?</h3>
            <p className="mb-4">Are you sure you want to delete {deleteModal.contactName}?</p>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  // Archive instead of delete
                  await updateDoc(doc(db, 'contacts', deleteModal.contactId), { 
                    status: 'Archived',
                    archivedAt: new Date().toISOString()
                  });
                  setDeleteModal({ open: false, contactId: null, contactName: '' });
                  alert('Contact archived successfully');
                  setClients(clients => clients.filter(c => c.id !== deleteModal.contactId));
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Archive Instead
              </button>
              <button
                onClick={async () => {
                  // Permanent delete
                  await deleteDoc(doc(db, 'contacts', deleteModal.contactId));
                  setDeleteModal({ open: false, contactId: null, contactName: '' });
                  alert('Contact deleted permanently');
                  setClients(clients => clients.filter(c => c.id !== deleteModal.contactId));
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, contactId: null, contactName: '' })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
