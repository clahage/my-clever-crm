import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Phone, Mail, Calendar, TrendingUp, Star, Clock, Filter, Search, ChevronDown, MoreVertical } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedLeads, setSelectedLeads] = useState(new Set());

  useEffect(() => {
    // Query for contacts with category = 'lead'
    console.log('Setting up leads query...');
    const q = query(
      collection(db, 'contacts'),
      where('category', '==', 'lead')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Leads loaded:', leadsData.length);
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading leads:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...leads];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(lead => lead.status === filter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.phone?.includes(search) ||
        lead.company?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'score':
          return (b.leadScore || 0) - (a.leadScore || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
        default:
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, filter, searchTerm, sortBy]);

  // Convert lead to client
  const convertToClient = async (leadId) => {
    try {
      await updateDoc(doc(db, 'contacts', leadId), {
        category: 'client',
        status: 'active',
        convertedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Lead converted to client:', leadId);
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  // Update lead status
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await updateDoc(doc(db, 'contacts', leadId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log('Lead status updated:', leadId, newStatus);
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  // Delete lead
  const deleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteDoc(doc(db, 'contacts', leadId));
        console.log('Lead deleted:', leadId);
      } catch (error) {
        console.error('Error deleting lead:', error);
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

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Toggle lead selection
  const toggleLeadSelection = (leadId) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  // Select all visible leads
  const selectAllLeads = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  // Bulk actions
  const performBulkAction = async (action) => {
    const leadIds = Array.from(selectedLeads);
    
    switch(action) {
      case 'convert':
        for (const leadId of leadIds) {
          await convertToClient(leadId);
        }
        break;
      case 'hot':
      case 'warm':
      case 'cold':
        for (const leadId of leadIds) {
          await updateLeadStatus(leadId, action);
        }
        break;
      case 'delete':
        if (window.confirm(`Delete ${leadIds.length} leads?`)) {
          for (const leadId of leadIds) {
            await deleteDoc(doc(db, 'contacts', leadId));
          }
        }
        break;
    }
    
    setSelectedLeads(new Set());
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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
        
        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => performBulkAction('convert')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Convert to Client ({selectedLeads.size})
            </button>
            <button
              onClick={() => performBulkAction('delete')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete ({selectedLeads.size})
            </button>
          </div>
        )}
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
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="hot">Hot Leads</option>
            <option value="warm">Warm Leads</option>
            <option value="cold">Cold Leads</option>
            <option value="new">New Leads</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Newest First</option>
            <option value="score">Highest Score</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">
                {leads.filter(l => l.status === 'hot').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warm Leads</p>
              <p className="text-2xl font-bold text-yellow-600">
                {leads.filter(l => l.status === 'warm').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cold Leads</p>
              <p className="text-2xl font-bold text-blue-600">
                {leads.filter(l => l.status === 'cold').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={selectAllLeads}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No leads found. Adjust your filters or wait for new leads from the AI Receptionist.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name || 'Unknown'}
                      </div>
                      {lead.company && (
                        <div className="text-sm text-gray-500">{lead.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a 
                          href={`mailto:${lead.email}`}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${getScoreColor(lead.leadScore || 0)}`}>
                        {lead.leadScore || 0}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/10</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status || 'new')}`}>
                      {lead.status || 'new'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {lead.source || 'Direct'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(lead.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => convertToClient(lead.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Convert
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;