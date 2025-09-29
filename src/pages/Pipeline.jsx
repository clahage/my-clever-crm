import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  DollarSign, 
  Users, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  X,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Pipeline = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [editingDeal, setEditingDeal] = useState(null);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalDeals: 0,
    avgDealSize: 0,
    conversionRate: 0,
    avgCycleTime: 0
  });

  // Pipeline stages configuration
  const stages = [
    { 
      id: 'new', 
      title: 'New Lead', 
      color: 'bg-gray-500',
      description: 'Unqualified leads'
    },
    { 
      id: 'contacted', 
      title: 'Contacted', 
      color: 'bg-blue-500',
      description: 'Initial contact made'
    },
    { 
      id: 'qualified', 
      title: 'Qualified', 
      color: 'bg-indigo-500',
      description: 'Lead qualified and interested'
    },
    { 
      id: 'proposal', 
      title: 'Proposal', 
      color: 'bg-purple-500',
      description: 'Proposal sent'
    },
    { 
      id: 'negotiation', 
      title: 'Negotiation', 
      color: 'bg-orange-500',
      description: 'In negotiation'
    },
    { 
      id: 'won', 
      title: 'Won', 
      color: 'bg-green-500',
      description: 'Deal closed successfully'
    },
    { 
      id: 'lost', 
      title: 'Lost', 
      color: 'bg-red-500',
      description: 'Deal lost'
    }
  ];

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    stage: 'new',
    priority: 'medium',
    notes: '',
    source: 'website',
    product: '',
    expectedCloseDate: ''
  });

  // Load deals from Firebase
  useEffect(() => {
    if (!user) return;

    const loadDeals = async () => {
      try {
        const dealsRef = collection(db, 'deals');
        const q = query(dealsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            // Create sample deals for demo
            createSampleDeals();
          } else {
            const dealsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setDeals(dealsList);
            calculateStats(dealsList);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading deals:', error);
        createSampleDeals();
        setLoading(false);
      }
    };

    loadDeals();
  }, [user]);

  // Create sample deals for demo
  const createSampleDeals = () => {
    const sampleDeals = [
      {
        id: '1',
        name: 'John Smith',
        company: 'ABC Corp',
        email: 'john@abc.com',
        phone: '555-0101',
        value: 5000,
        stage: 'new',
        priority: 'high',
        source: 'website',
        product: 'Credit Repair Service',
        createdAt: new Date(Date.now() - 86400000 * 7),
        expectedCloseDate: new Date(Date.now() + 86400000 * 14)
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        company: 'XYZ Inc',
        email: 'sarah@xyz.com',
        phone: '555-0102',
        value: 3500,
        stage: 'contacted',
        priority: 'medium',
        source: 'referral',
        product: 'Business Credit Building',
        createdAt: new Date(Date.now() - 86400000 * 5),
        expectedCloseDate: new Date(Date.now() + 86400000 * 21)
      },
      {
        id: '3',
        name: 'Mike Wilson',
        company: 'Tech Solutions',
        email: 'mike@tech.com',
        phone: '555-0103',
        value: 8000,
        stage: 'qualified',
        priority: 'high',
        source: 'email',
        product: 'Complete Credit Solution',
        createdAt: new Date(Date.now() - 86400000 * 10),
        expectedCloseDate: new Date(Date.now() + 86400000 * 7)
      },
      {
        id: '4',
        name: 'Emily Brown',
        company: 'Brown Enterprises',
        email: 'emily@brown.com',
        phone: '555-0104',
        value: 12000,
        stage: 'proposal',
        priority: 'high',
        source: 'phone',
        product: 'Enterprise Package',
        createdAt: new Date(Date.now() - 86400000 * 14),
        expectedCloseDate: new Date(Date.now() + 86400000 * 3)
      },
      {
        id: '5',
        name: 'David Lee',
        company: 'Lee Marketing',
        email: 'david@lee.com',
        phone: '555-0105',
        value: 6500,
        stage: 'negotiation',
        priority: 'medium',
        source: 'social',
        product: 'Credit Monitoring Service',
        createdAt: new Date(Date.now() - 86400000 * 20),
        expectedCloseDate: new Date(Date.now() + 86400000 * 5)
      },
      {
        id: '6',
        name: 'Lisa Martinez',
        company: 'Martinez LLC',
        email: 'lisa@martinez.com',
        phone: '555-0106',
        value: 4500,
        stage: 'won',
        priority: 'low',
        source: 'website',
        product: 'Basic Credit Repair',
        createdAt: new Date(Date.now() - 86400000 * 30),
        closedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: '7',
        name: 'Robert Taylor',
        company: 'Taylor Group',
        email: 'robert@taylor.com',
        phone: '555-0107',
        value: 2500,
        stage: 'lost',
        priority: 'low',
        source: 'referral',
        product: 'Credit Consultation',
        createdAt: new Date(Date.now() - 86400000 * 25),
        lostReason: 'Budget constraints'
      }
    ];

    setDeals(sampleDeals);
    calculateStats(sampleDeals);
  };

  // Calculate pipeline stats
  const calculateStats = (dealsList) => {
    const totalDeals = dealsList.length;
    const totalValue = dealsList.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDeals = dealsList.filter(d => d.stage === 'won');
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
    
    // Calculate average cycle time for won deals
    let totalCycleTime = 0;
    let cycleCount = 0;
    wonDeals.forEach(deal => {
      if (deal.createdAt && deal.closedAt) {
        const created = deal.createdAt.seconds ? new Date(deal.createdAt.seconds * 1000) : new Date(deal.createdAt);
        const closed = deal.closedAt.seconds ? new Date(deal.closedAt.seconds * 1000) : new Date(deal.closedAt);
        const cycleTime = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
        totalCycleTime += cycleTime;
        cycleCount++;
      }
    });
    const avgCycleTime = cycleCount > 0 ? Math.round(totalCycleTime / cycleCount) : 0;

    setStats({
      totalValue,
      totalDeals,
      avgDealSize,
      conversionRate,
      avgCycleTime
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (draggedDeal && draggedDeal.stage !== newStage) {
      try {
        // Update local state
        const updatedDeals = deals.map(deal => 
          deal.id === draggedDeal.id 
            ? { ...deal, stage: newStage, updatedAt: new Date() }
            : deal
        );
        setDeals(updatedDeals);
        calculateStats(updatedDeals);

        // Update in Firebase if not a sample
        if (!draggedDeal.id.match(/^[1-7]$/)) {
          const dealRef = doc(db, 'deals', draggedDeal.id);
          const updateData = {
            stage: newStage,
            updatedAt: serverTimestamp()
          };
          
          // Add additional fields for won/lost stages
          if (newStage === 'won') {
            updateData.closedAt = serverTimestamp();
            updateData.status = 'closed-won';
          } else if (newStage === 'lost') {
            updateData.closedAt = serverTimestamp();
            updateData.status = 'closed-lost';
          }
          
          await updateDoc(dealRef, updateData);
        }

        // Log stage change
        console.log(`Deal "${draggedDeal.name}" moved to ${newStage}`);
      } catch (error) {
        console.error('Error updating deal stage:', error);
      }
    }
    
    setDraggedDeal(null);
  };

  // Add new deal
  const handleAddDeal = async (e) => {
    e.preventDefault();
    
    try {
      const dealData = {
        ...newDeal,
        value: parseFloat(newDeal.value) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user?.uid
      };

      // For demo, just add to local state
      const newId = `demo-${Date.now()}`;
      const newDealWithId = { ...dealData, id: newId, createdAt: new Date() };
      setDeals(prev => [newDealWithId, ...prev]);
      
      // Reset form
      setNewDeal({
        name: '',
        company: '',
        email: '',
        phone: '',
        value: '',
        stage: 'new',
        priority: 'medium',
        notes: '',
        source: 'website',
        product: '',
        expectedCloseDate: ''
      });
      setShowAddDeal(false);
      setSelectedStage('');
      
      // In production, save to Firebase
      // await addDoc(collection(db, 'deals'), dealData);
      
    } catch (error) {
      console.error('Error adding deal:', error);
    }
  };

  // Delete deal
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      // Update local state
      const updatedDeals = deals.filter(d => d.id !== dealId);
      setDeals(updatedDeals);
      calculateStats(updatedDeals);
      
      // Delete from Firebase if not a sample
      if (!dealId.match(/^[1-7]$/)) {
        await deleteDoc(doc(db, 'deals', dealId));
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  // Get deals for a specific stage
  const getDealsForStage = (stageId) => {
    return deals
      .filter(deal => deal.stage === stageId)
      .filter(deal => 
        searchTerm === '' ||
        deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  // Get stage value
  const getStageValue = (stageId) => {
    return getDealsForStage(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString();
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sales Pipeline
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your deals through the sales process
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddDeal(true);
              setSelectedStage('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(stats.totalValue)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Deals</span>
              <GitBranch className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.totalDeals}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Deal</span>
              <Target className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(stats.avgDealSize)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-green-600 mt-1">
              {stats.conversionRate.toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Cycle</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.avgCycleTime} days
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="flex-1 overflow-x-auto bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-4 p-6 min-w-max h-full">
          {stages.map(stage => (
            <div
              key={stage.id}
              className="w-80 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className={`${stage.color} text-white rounded-t-lg p-3`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{stage.title}</h3>
                    <p className="text-xs opacity-90 mt-1">{stage.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">
                      {getDealsForStage(stage.id).length} deals
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(getStageValue(stage.id))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Cards */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-b-lg p-3 space-y-3 overflow-y-auto">
                {/* Add Deal Button */}
                <button
                  onClick={() => {
                    setSelectedStage(stage.id);
                    setNewDeal(prev => ({ ...prev, stage: stage.id }));
                    setShowAddDeal(true);
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Deal
                </button>

                {/* Deal Cards */}
                {getDealsForStage(stage.id).map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {deal.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(deal.priority)}`}>
                          {deal.priority}
                        </span>
                        <button
                          onClick={() => setEditingDeal(deal)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {deal.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {deal.company}
                      </p>
                    )}

                    <div className="text-lg font-semibold text-blue-600 mb-2">
                      {formatCurrency(deal.value)}
                    </div>

                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {deal.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {deal.email}
                        </div>
                      )}
                      {deal.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {deal.phone}
                        </div>
                      )}
                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Close: {formatDate(deal.expectedCloseDate)}
                        </div>
                      )}
                    </div>

                    {deal.product && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {deal.product}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Deal Modal */}
      {(showAddDeal || editingDeal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button
                onClick={() => {
                  setShowAddDeal(false);
                  setEditingDeal(null);
                  setSelectedStage('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDeal ? editingDeal.name : newDeal.name}
                    onChange={(e) => editingDeal 
                      ? setEditingDeal({ ...editingDeal, name: e.target.value })
                      : setNewDeal({ ...newDeal, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editingDeal ? editingDeal.company : newDeal.company}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, company: e.target.value })
                      : setNewDeal({ ...newDeal, company: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingDeal ? editingDeal.email : newDeal.email}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, email: e.target.value })
                      : setNewDeal({ ...newDeal, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingDeal ? editingDeal.phone : newDeal.phone}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, phone: e.target.value })
                      : setNewDeal({ ...newDeal, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deal Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingDeal ? editingDeal.value : newDeal.value}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, value: e.target.value })
                      : setNewDeal({ ...newDeal, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stage
                  </label>
                  <select
                    value={editingDeal ? editingDeal.stage : newDeal.stage}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, stage: e.target.value })
                      : setNewDeal({ ...newDeal, stage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingDeal ? editingDeal.priority : newDeal.priority}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, priority: e.target.value })
                      : setNewDeal({ ...newDeal, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <select
                    value={editingDeal ? editingDeal.source : newDeal.source}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, source: e.target.value })
                      : setNewDeal({ ...newDeal, source: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="social">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product/Service
                  </label>
                  <select
                    value={editingDeal ? editingDeal.product : newDeal.product}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, product: e.target.value })
                      : setNewDeal({ ...newDeal, product: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select product...</option>
                    <option value="Credit Repair Service">Credit Repair Service</option>
                    <option value="Business Credit Building">Business Credit Building</option>
                    <option value="Credit Monitoring Service">Credit Monitoring Service</option>
                    <option value="Complete Credit Solution">Complete Credit Solution</option>
                    <option value="Enterprise Package">Enterprise Package</option>
                    <option value="Credit Consultation">Credit Consultation</option>
                    <option value="Basic Credit Repair">Basic Credit Repair</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={editingDeal ? editingDeal.expectedCloseDate : newDeal.expectedCloseDate}
                    onChange={(e) => editingDeal
                      ? setEditingDeal({ ...editingDeal, expectedCloseDate: e.target.value })
                      : setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={editingDeal ? editingDeal.notes : newDeal.notes}
                  onChange={(e) => editingDeal
                    ? setEditingDeal({ ...editingDeal, notes: e.target.value })
                    : setNewDeal({ ...newDeal, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDeal ? 'Update Deal' : 'Add Deal'}
                </button>
                {editingDeal && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDeal(editingDeal.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeal(false);
                    setEditingDeal(null);
                    setSelectedStage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
 );
};

export default Pipeline;  // ← Make sure to export the component