import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Phone, Mail, Calendar, DollarSign, FileText, TrendingUp, Search, Filter, MoreVertical, Star, Activity } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Query for contacts with category = 'client'
    console.log('Setting up clients query...');
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'client')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Clients loaded:', clientsData.length);
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading clients:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...clients];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(client => 
        client.name?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search) ||
        client.phone?.includes(search) ||
        client.company?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'value':
          return (b.totalValue || 0) - (a.totalValue || 0);
        case 'recent':
        default:
          const dateA = a.lastContactDate?.toDate?.() || a.updatedAt?.toDate?.() || new Date(0);
          const dateB = b.lastContactDate?.toDate?.() || b.updatedAt?.toDate?.() || new Date(0);
          return dateB - dateA;
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, sortBy]);

  // Update client status
  const updateClientStatus = async (clientId, newStatus) => {
    try {
      await updateDoc(doc(db, 'contacts', clientId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log('Client status updated:', clientId, newStatus);
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  // Delete client
  const deleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteDoc(doc(db, 'contacts', clientId));
        console.log('Client deleted:', clientId);
        setShowDetails(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  // Convert client back to lead
  const convertToLead = async (clientId) => {
    if (window.confirm('Convert this client back to a lead?')) {
      try {
        await updateDoc(doc(db, 'contacts', clientId), {
          category: 'lead',
          status: 'warm',
          updatedAt: serverTimestamp()
        });
        console.log('Client converted back to lead:', clientId);
      } catch (error) {
        console.error('Error converting client to lead:', error);
      }
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'churned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Calculate client metrics
  const calculateMetrics = () => {
    const totalRevenue = clients.reduce((sum, client) => sum + (client.totalValue || 0), 0);
    const activeClients = clients.filter(c => c.status === 'active').length;
    const avgValue = clients.length > 0 ? totalRevenue / clients.length : 0;
    const retentionRate = clients.length > 0 ? (activeClients / clients.length) * 100 : 0;

    return { totalRevenue, activeClients, avgValue, retentionRate };
  };

  const metrics = calculateMetrics();

  // View client details
  const viewClientDetails = (client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your {filteredClients.length} active clients
          </p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Add New Client
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeClients}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retention Rate</p>
              <p className="text-2xl font-bold">{metrics.retentionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="churned">Churned</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="value">Highest Value</option>
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">
              No clients found. Convert some leads to build your client base!
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewClientDetails(client)}>
              <div className="p-5">
                {/* Client Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {(client.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">
                        {client.name || 'Unknown Client'}
                      </h3>
                      {client.company && (
                        <p className="text-sm text-gray-500">{client.company}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(client.status || 'active')}`}>
                    {client.status || 'active'}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                  {client.phone && (
                    <a 
                      href={`tel:${client.phone}`}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3 mr-2" />
                      {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a 
                      href={`mailto:${client.email}`}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="w-3 h-3 mr-2" />
                      {client.email}
                    </a>
                  )}
                </div>

                {/* Client Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(client.totalValue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Contact</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(client.lastContactDate || client.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {client.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {client.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{client.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateClientStatus(client.id, client.status === 'active' ? 'inactive' : 'active');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {client.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      convertToLead(client.id);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    To Lead
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteClient(client.id);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Client Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                  {selectedClient.company && (
                    <p className="text-gray-600">{selectedClient.company}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status || 'active'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="font-semibold">{formatCurrency(selectedClient.totalValue || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lead Score</p>
                    <p className="font-semibold">{selectedClient.leadScore || 0}/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p className="font-semibold">{selectedClient.source || 'Direct'}</p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedClient.notes}</p>
                  </div>
                )}

                {selectedClient.tags && selectedClient.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedClient.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    convertToLead(selectedClient.id);
                    setShowDetails(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Convert to Lead
                </button>
                <button
                  onClick={() => deleteClient(selectedClient.id)}
                  className="px-4 py-2 text-red-600 hover:text-red-800"
                >
                  Delete Client
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;