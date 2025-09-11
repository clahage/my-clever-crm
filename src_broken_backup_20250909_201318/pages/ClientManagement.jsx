import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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

  const navigate = useNavigate();
  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(contact => contact.category === 'client');
      setClients(clientsData);
    });
    return () => unsubscribe();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Client Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your clients and their information
          </p>
        </div>
        <button
          onClick={() => navigate('/add-client')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Client
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
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {client.name?.charAt(0) || 'C'}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {client.name || 'Unknown Client'}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {client.email || 'No email'}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {client.phone || 'No phone'}
              </div>
            </div>

            <ClientCreditCard client={client} />

            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => window.location.href = `/client/${client.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Details →
              </button>
            </div>
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
    </div>
  );
};

export default ClientManagement;
