import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search, Filter, Phone, Mail, Calendar, DollarSign, Award, Star, Building, Briefcase } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    standard: 0,
    basic: 0,
    fromLeads: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Query for clients (contacts with category='client')
    const clientsQuery = query(
      collection(db, 'contacts'),
      where('category', '==', 'client'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setClients(clientsData);
      setFilteredClients(clientsData);
      
      // Calculate stats
      const newStats = {
        total: clientsData.length,
        premium: clientsData.filter(c => c.tier === 'premium').length,
        standard: clientsData.filter(c => c.tier === 'standard').length,
        basic: clientsData.filter(c => c.tier === 'basic' || !c.tier).length,
        fromLeads: clientsData.filter(c => c.convertedFromLead || c.source === 'AI Receptionist').length,
        totalRevenue: clientsData.reduce((sum, c) => sum + (c.revenue || 0), 0)
      };
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching clients:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...clients];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(client => 
        (client.tier || 'basic') === tierFilter
      );
    }
    
    // Source filter
    if (sourceFilter !== 'all') {
      if (sourceFilter === 'converted') {
        filtered = filtered.filter(client => 
          client.convertedFromLead || client.source === 'AI Receptionist'
        );
      } else if (sourceFilter === 'direct') {
        filtered = filtered.filter(client => 
          !client.convertedFromLead && client.source !== 'AI Receptionist'
        );
      }
    }
    
    setFilteredClients(filtered);
  }, [searchTerm, tierFilter, sourceFilter, clients]);

  const updateClientTier = async (clientId, newTier) => {
    try {
      await updateDoc(doc(db, 'contacts', clientId), {
        tier: newTier,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating client tier:', error);
    }
  };

  const deleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'contacts', clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'standard': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'basic': 
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'premium': return <Star className="w-4 h-4 text-purple-500" />;
      case 'standard': return <Award className="w-4 h-4 text-blue-500" />;
      case 'basic':
      default: return <Briefcase className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatRevenue = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Clients Management</h1>
        <p className="text-gray-600">Manage your active clients and track revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="text-2xl font-bold text-purple-600">{stats.premium}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Standard</p>
              <p className="text-2xl font-bold text-blue-600">{stats.standard}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Basic</p>
              <p className="text-2xl font-bold text-gray-600">{stats.basic}</p>
            </div>
            <Briefcase className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">From Leads</p>
              <p className="text-2xl font-bold text-green-600">{stats.fromLeads}</p>
            </div>
            <Phone className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">
                {formatRevenue(stats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
            <option value="basic">Basic</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="converted">Converted Leads</option>
            <option value="direct">Direct Clients</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Filter className="w-5 h-5 inline mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No clients found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or convert some leads</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.company || 'No company'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {client.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTierIcon(client.tier || 'basic')}
                        <select
                          value={client.tier || 'basic'}
                          onChange={(e) => updateClientTier(client.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(client.tier || 'basic')}`}
                        >
                          <option value="premium">Premium</option>
                          <option value="standard">Standard</option>
                          <option value="basic">Basic</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatRevenue(client.revenue)}
                      </div>
                      {client.monthlyRevenue && (
                        <div className="text-xs text-gray-500">
                          {formatRevenue(client.monthlyRevenue)}/mo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.source === 'AI Receptionist' || client.convertedFromLead
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.convertedFromLead ? 'Converted Lead' : 
                         client.source === 'AI Receptionist' ? 'AI Lead' :
                         'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {client.createdAt ? new Date(client.createdAt.toDate ? client.createdAt.toDate() : client.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Client"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;