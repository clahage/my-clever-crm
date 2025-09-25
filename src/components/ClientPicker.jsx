import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Mail, Phone, X, Check } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

const ClientPicker = ({ 
  selectedClient, 
  onSelectClient, 
  required = false,
  className = "",
  placeholder = "Select a client..."
}) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch clients from Firebase
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // FIXED: Query contacts collection where roles contains 'client'
        const q = query(
          collection(db, 'contacts'),
          where('roles', 'array-contains', 'client'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        const querySnapshot = await getDocs(q);
        const clientsData = [];
        querySnapshot.forEach((doc) => {
          clientsData.push({ id: doc.id, ...doc.data() });
        });
        console.log('Found clients:', clientsData.length);
        setClients(clientsData);
        setFilteredClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = clients.filter(client => {
        const name = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
        const email = (client.email || '').toLowerCase();
        const phone = (client.phone || '').toLowerCase();
        return name.includes(term) || email.includes(term) || phone.includes(term);
      });
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (client) => {
    onSelectClient({
      clientId: client.id,
      clientName: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
      clientAddress: client.address || ''
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onSelectClient(null);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const getInitials = (client) => {
    const first = client.firstName?.[0] || '';
    const last = client.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Client {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {selectedClient ? (
          // Selected Client Display
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {getInitials({ 
                  firstName: selectedClient.clientName.split(' ')[0], 
                  lastName: selectedClient.clientName.split(' ')[1] 
                })}
              </div>
              <div>
                <div className="font-medium text-gray-900">{selectedClient.clientName}</div>
                <div className="text-sm text-gray-500">{selectedClient.clientEmail}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        ) : (
          // Search Input
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={required && !selectedClient}
            />
          </div>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && !selectedClient && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No clients found' : 'No clients available'}
            </div>
          ) : (
            <ul className="py-2">
              {filteredClients.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {getInitials(client)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!selectedClient && (
        <p className="mt-1 text-sm text-gray-500">
          Start typing to search by name, email, or phone number
        </p>
      )}
    </div>
  );
};

export default ClientPicker;