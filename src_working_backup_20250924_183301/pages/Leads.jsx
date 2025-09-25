import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Search, Filter, Phone, Mail, Calendar, TrendingUp, Users, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    aiGenerated: 0,
    converted: 0
  });

  useEffect(() => {
    // Query for leads (contacts with category='lead')
    const leadsQuery = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLeads(leadsData);
      setFilteredLeads(leadsData);
      
      // Calculate stats
      const newStats = {
        total: leadsData.length,
        hot: leadsData.filter(l => l.status === 'hot').length,
        warm: leadsData.filter(l => l.status === 'warm').length,
        cold: leadsData.filter(l => l.status === 'cold').length,
        aiGenerated: leadsData.filter(l => l.source === 'AI Receptionist').length,
        converted: leadsData.filter(l => l.convertedToClient).length
      };
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leads:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...leads];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    // Source filter
    if (sourceFilter !== 'all') {
      if (sourceFilter === 'ai') {
        filtered = filtered.filter(lead => lead.source === 'AI Receptionist');
      } else if (sourceFilter === 'manual') {
        filtered = filtered.filter(lead => lead.source !== 'AI Receptionist');
      }
    }
    
    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, sourceFilter, leads]);

  const convertToClient = async (leadId) => {
    try {
      await updateDoc(doc(db, 'contacts', leadId), {
        category: 'client',
        convertedToClient: true,
        convertedDate: new Date(),
        updatedAt: new Date()
      });
      console.log('Lead converted to client successfully');
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await updateDoc(doc(db, 'contacts', leadId), {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const deleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteDoc(doc(db, 'contacts', leadId));
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leads Management</h1>
        <p className="text-gray-600">Track and convert your potential customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warm Leads</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warm}</p>
            </div>
            <Target className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cold Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.cold}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Generated</p>
              <p className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</p>
            </div>
            <Phone className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
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
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="hot">Hot Leads</option>
            <option value="warm">Warm Leads</option>
            <option value="cold">Cold Leads</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="ai">AI Receptionist</option>
            <option value="manual">Manual Entry</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Filter className="w-5 h-5 inline mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No leads found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add new leads</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.company || 'No company'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {lead.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}
                      >
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.leadScore || 0}/10
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${(lead.leadScore || 0) * 10}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.source === 'AI Receptionist' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.source || 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(lead.urgencyLevel)}
                        <span className="text-sm text-gray-600">
                          {lead.urgencyLevel || 'Low'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => convertToClient(lead.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Convert to Client"
                      >
                        Convert
                      </button>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Lead"
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

export default Leads;