import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserPlus, Search, ChevronRight, Phone, Mail, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [converting, setConverting] = useState(null);
  const navigate = useNavigate();

  // Lead score colors (matching your contact system)
  const scoreColors = {
    6: { bg: 'bg-red-100', text: 'text-red-800', label: 'Hot' },
    5: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Warm' },
    4: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Interested' },
    3: { bg: 'bg-green-100', text: 'text-green-800', label: 'Neutral' },
    2: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Cool' },
    1: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cold' }
  };

  useEffect(() => {
    // Query for leads (both 'lead' and 'Lead' for compatibility)
    const q = query(
      collection(db, 'contacts'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(contact => 
          contact.type?.toLowerCase() === 'lead' || 
          contact.category?.toLowerCase() === 'lead'
        );
      setLeads(leadsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConvertToClient = async (lead) => {
    if (!window.confirm(`Convert ${lead.firstName} ${lead.lastName} to a client?`)) {
      return;
    }

    setConverting(lead.id);
    try {
      await updateDoc(doc(db, 'contacts', lead.id), {
        type: 'Client',
        category: 'Client',
        conversionDate: new Date(),
        previousType: 'Lead',
        previousLeadScore: lead.leadScore,
        updatedAt: new Date(),
        notes: `${lead.notes || ''}\n\nConverted from Lead to Client on ${new Date().toLocaleDateString()}`
      });

      // Show success message
      alert(`Successfully converted ${lead.firstName} ${lead.lastName} to a client!`);
      
      // Optional: Navigate to clients page
      setTimeout(() => {
        navigate('/clients');
      }, 1000);
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to client');
    } finally {
      setConverting(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch = 
      (lead.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Score filter
    const matchesScore = 
      filterScore === 'all' ||
      (filterScore === 'hot' && lead.leadScore >= 5) ||
      (filterScore === 'warm' && lead.leadScore >= 3 && lead.leadScore < 5) ||
      (filterScore === 'cold' && lead.leadScore < 3);

    return matchesSearch && matchesScore;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {leads.length} total leads • Track and convert prospects
            </p>
          </div>
          <button 
            onClick={() => navigate('/contacts')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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

            {/* Score Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterScore('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterScore === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                All Leads
              </button>
              <button
                onClick={() => setFilterScore('hot')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterScore === 'hot' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Hot (5-6)
              </button>
              <button
                onClick={() => setFilterScore('warm')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterScore === 'warm' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Warm (3-4)
              </button>
              <button
                onClick={() => setFilterScore('cold')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterScore === 'cold' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Cold (1-2)
              </button>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterScore !== 'all' 
                ? 'No leads found matching your criteria' 
                : 'No leads yet. Add your first lead to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => {
              const score = lead.leadScore || 3;
              const scoreInfo = scoreColors[score] || scoreColors[3];
              
              return (
                <div key={lead.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Lead Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        {lead.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lead.company}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${scoreInfo.bg} ${scoreInfo.text}`}>
                        {scoreInfo.label}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          {lead.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        Added {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Source and Urgency */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lead.source && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {lead.source}
                        </span>
                      )}
                      {lead.urgencyLevel && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          lead.urgencyLevel === 'high' || lead.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                          lead.urgencyLevel === 'medium' || lead.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.urgencyLevel}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConvertToClient(lead)}
                        disabled={converting === lead.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {converting === lead.id ? (
                          <>Converting...</>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            Convert to Client
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/contacts?edit=${lead.id}`)}
                        className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id, `${lead.firstName} ${lead.lastName}`)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}