import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import disputeService from '../services/disputeService';
import DisputeLetterGenerator from '../components/DisputeLetterGenerator';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Edit3, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Eye,
  Copy,
  X
} from 'lucide-react';

const DisputeLetters = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    loadLetters();
  }, [user]);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getLetters(user.uid);
      setLetters(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading dispute letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (letterData) => {
    const newStats = {
      total: letterData.length,
      draft: letterData.filter(l => l.status === 'draft').length,
      sent: letterData.filter(l => l.status === 'sent').length,
      pending: letterData.filter(l => l.status === 'pending').length,
      resolved: letterData.filter(l => l.status === 'resolved').length
    };
    setStats(newStats);
  };

  const handleDeleteLetter = async (letterId) => {
    if (!window.confirm('Are you sure you want to delete this letter?')) return;
    
    try {
      await disputeService.deleteLetter(letterId);
      setLetters(letters.filter(l => l.id !== letterId));
      calculateStats(letters.filter(l => l.id !== letterId));
    } catch (error) {
      console.error('Error deleting letter:', error);
    }
  };

  const handleDuplicateLetter = async (letter) => {
    try {
      const newLetter = {
        ...letter,
        title: `${letter.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        sentAt: null
      };
      delete newLetter.id;
      
      const createdLetter = await disputeService.createLetter(user.uid, newLetter);
      setLetters([createdLetter, ...letters]);
      calculateStats([createdLetter, ...letters]);
    } catch (error) {
      console.error('Error duplicating letter:', error);
    }
  };

  const handleStatusChange = async (letterId, newStatus) => {
    try {
      await disputeService.updateLetter(letterId, { 
        status: newStatus,
        sentAt: newStatus === 'sent' ? new Date().toISOString() : null
      });
      
      const updatedLetters = letters.map(l => 
        l.id === letterId 
          ? { ...l, status: newStatus, sentAt: newStatus === 'sent' ? new Date().toISOString() : l.sentAt }
          : l
      );
      setLetters(updatedLetters);
      calculateStats(updatedLetters);
    } catch (error) {
      console.error('Error updating letter status:', error);
    }
  };

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.bureau?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || letter.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispute Letters</h1>
        <p className="text-gray-600">Manage and track your credit dispute correspondence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Letters" 
          value={stats.total} 
          color="border-gray-500"
          icon={<FileText className="w-8 h-8" />}
        />
        <StatCard 
          title="Drafts" 
          value={stats.draft} 
          color="border-gray-400"
          icon={<Edit3 className="w-8 h-8" />}
        />
        <StatCard 
          title="Sent" 
          value={stats.sent} 
          color="border-blue-500"
          icon={<Send className="w-8 h-8" />}
        />
        <StatCard 
          title="Pending" 
          value={stats.pending} 
          color="border-yellow-500"
          icon={<Clock className="w-8 h-8" />}
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved} 
          color="border-green-500"
          icon={<CheckCircle className="w-8 h-8" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Dispute Letter
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search letters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredLetters.map((letter) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {letter.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(letter.status)}`}>
                  {getStatusIcon(letter.status)}
                  {letter.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Bureau:</span>
                  <span className="font-medium">{letter.bureau}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="font-medium">{letter.accountNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {letter.sentAt && (
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span className="font-medium">
                      {new Date(letter.sentAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedLetter(letter);
                      setShowPreview(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicateLetter(letter)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLetter(letter.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {letter.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange(letter.id, 'sent')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Mark Sent
                  </button>
                )}
                {letter.status === 'sent' && (
                  <button
                    onClick={() => handleStatusChange(letter.id, 'pending')}
                    className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                  >
                    Pending
                  </button>
                )}
                {letter.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(letter.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Resolved
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredLetters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No dispute letters found</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Letter
          </button>
        </div>
      )}

      <AnimatePresence>
        {showGenerator && (
          <DisputeLetterGenerator
            isOpen={showGenerator}
            onClose={() => setShowGenerator(false)}
            onLetterCreated={(newLetter) => {
              setLetters([newLetter, ...letters]);
              calculateStats([newLetter, ...letters]);
              setShowGenerator(false);
            }}
            userId={user.uid}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedLetter.title}</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="prose max-w-none">
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <p className="font-medium">Bureau: {selectedLetter.bureau}</p>
                  <p className="text-sm text-gray-600">Account: {selectedLetter.accountNumber}</p>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(selectedLetter.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="whitespace-pre-wrap">
                  {selectedLetter.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisputeLetters;