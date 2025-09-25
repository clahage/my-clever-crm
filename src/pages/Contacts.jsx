import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Download,
  Upload,
  UserCheck,
  UserPlus,
  Star,
  Building2,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowUpCircle,
  Hash,
  Shield,
  Clock,
  FileText,
  Paperclip,
  X
} from 'lucide-react';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const Contacts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRoles, setFilterRoles] = useState([]);
  const [filterLifecycle, setFilterLifecycle] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [editingRoles, setEditingRoles] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byRole: {},
    byLifecycle: {}
  });

  // Role definitions with colors and icons
  const ROLES = {
    contact: { label: 'Contact', color: 'bg-gray-100 text-gray-700', icon: Users },
    lead: { label: 'Lead', color: 'bg-yellow-100 text-yellow-700', icon: UserPlus },
    client: { label: 'Client', color: 'bg-green-100 text-green-700', icon: UserCheck },
    affiliate: { label: 'Affiliate', color: 'bg-purple-100 text-purple-700', icon: Star },
    vendor: { label: 'Vendor', color: 'bg-blue-100 text-blue-700', icon: Building2 },
    partner: { label: 'Partner', color: 'bg-indigo-100 text-indigo-700', icon: Shield }
  };

  // Lifecycle statuses
  const LIFECYCLE_STATUSES = {
    intake: { label: 'Intake', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700' }
  };

  // New contact form state with enhanced fields
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    roles: ['contact'],
    primaryRole: 'contact',
    lifecycleStatus: 'intake',
    tags: [],
    source: 'manual',
    notes: '',
    piiLevel: 'med' // low, med, high
  });

  useEffect(() => {
    const showNew = searchParams.get('status') === 'new';
    if (showNew) {
      setShowNewContactForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    filterAndSortContacts();
  }, [contacts, searchTerm, sortBy, filterRoles, filterLifecycle]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'contacts'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = [];
      const roleStats = {};
      const lifecycleStats = {};
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        
        // Ensure roles array exists
        if (!data.roles || !Array.isArray(data.roles)) {
          data.roles = [data.status || 'contact'];
        }
        if (!data.primaryRole) {
          data.primaryRole = data.roles[0];
        }
        if (!data.lifecycleStatus) {
          data.lifecycleStatus = 'active';
        }
        
        // Count stats
        data.roles.forEach(role => {
          roleStats[role] = (roleStats[role] || 0) + 1;
        });
        lifecycleStats[data.lifecycleStatus] = (lifecycleStats[data.lifecycleStatus] || 0) + 1;
        
        contactsData.push(data);
      });
      
      setStats({
        total: contactsData.length,
        byRole: roleStats,
        byLifecycle: lifecycleStats
      });
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContacts = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => {
        const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase();
        const company = (contact.company || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const phone = (contact.phone || '').toLowerCase();
        const tags = (contact.tags || []).join(' ').toLowerCase();
        
        return fullName.includes(term) || 
               company.includes(term) || 
               email.includes(term) || 
               phone.includes(term) ||
               tags.includes(term);
      });
    }

    // Role filter (contacts that have ANY of the selected roles)
    if (filterRoles.length > 0) {
      filtered = filtered.filter(contact => {
        const contactRoles = contact.roles || [];
        return filterRoles.some(role => contactRoles.includes(role));
      });
    }

    // Lifecycle filter
    if (filterLifecycle !== 'all') {
      filtered = filtered.filter(contact => contact.lifecycleStatus === filterLifecycle);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        case 'oldest':
          return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        case 'primaryRole':
          return (a.primaryRole || 'contact').localeCompare(b.primaryRole || 'contact');
        default:
          return 0;
      }
    });

    setFilteredContacts(filtered);
  };

  const handleUpdateRoles = async (contactId, newRoles, primaryRole) => {
    try {
      const docRef = doc(db, 'contacts', contactId);
      const updateData = {
        roles: newRoles,
        primaryRole: primaryRole || newRoles[0],
        updatedAt: serverTimestamp()
      };
      
      // Add to role history
      const roleHistoryEntry = {
        roles: newRoles,
        primaryRole: primaryRole || newRoles[0],
        changedAt: new Date().toISOString(),
        changedBy: 'current_user' // Get from auth context
      };
      
      await updateDoc(docRef, {
        ...updateData,
        roleHistory: arrayUnion(roleHistoryEntry)
      });
      
      setEditingRoles(null);
      await fetchContacts();
    } catch (error) {
      console.error('Error updating roles:', error);
    }
  };

  const handleUpdateLifecycle = async (contactId, newStatus) => {
    try {
      const docRef = doc(db, 'contacts', contactId);
      await updateDoc(docRef, {
        lifecycleStatus: newStatus,
        lifecycleUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await fetchContacts();
    } catch (error) {
      console.error('Error updating lifecycle status:', error);
    }
  };

  const handleBulkRoleUpdate = async (action) => {
    if (selectedContacts.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      const role = action.replace('add-role-', '').replace('remove-role-', '');
      const isAdding = action.startsWith('add-role-');
      
      selectedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;
        
        const currentRoles = contact.roles || [];
        let newRoles;
        
        if (isAdding) {
          newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
        } else {
          newRoles = currentRoles.filter(r => r !== role);
          if (newRoles.length === 0) newRoles = ['contact']; // Always have at least one role
        }
        
        const docRef = doc(db, 'contacts', contactId);
        batch.update(docRef, {
          roles: newRoles,
          primaryRole: newRoles.includes(contact.primaryRole) ? contact.primaryRole : newRoles[0],
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      setSelectedContacts([]);
      setBulkAction('');
      await fetchContacts();
    } catch (error) {
      console.error('Error bulk updating roles:', error);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      // Initialize role history
      const roleHistory = [{
        roles: newContact.roles,
        primaryRole: newContact.primaryRole,
        startDate: new Date().toISOString(),
        endDate: null,
        notes: 'Initial contact creation'
      }];
      
      await addDoc(collection(db, 'contacts'), {
        ...newContact,
        roleHistory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        documentCount: 0,
        lastActivityDate: serverTimestamp()
      });
      
      setShowNewContactForm(false);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        roles: ['contact'],
        primaryRole: 'contact',
        lifecycleStatus: 'intake',
        tags: [],
        source: 'manual',
        notes: '',
        piiLevel: 'med'
      });
      
      await fetchContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleDelete = async (contactId) => {
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      setDeleteConfirm(null);
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSelectContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  // Role editor component
  const RoleEditor = ({ contact, onSave, onCancel }) => {
    const [selectedRoles, setSelectedRoles] = useState(contact.roles || []);
    const [selectedPrimary, setSelectedPrimary] = useState(contact.primaryRole || 'contact');
    
    const toggleRole = (role) => {
      if (selectedRoles.includes(role)) {
        if (selectedRoles.length > 1) {
          const newRoles = selectedRoles.filter(r => r !== role);
          setSelectedRoles(newRoles);
          if (selectedPrimary === role) {
            setSelectedPrimary(newRoles[0]);
          }
        }
      } else {
        setSelectedRoles([...selectedRoles, role]);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Roles for {contact.firstName} {contact.lastName}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleRole(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      selectedRoles.includes(key)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <role.icon className="h-4 w-4" />
                    {role.label}
                    {selectedRoles.includes(key) && <CheckCircle className="h-4 w-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedRoles.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
                <select
                  value={selectedPrimary}
                  onChange={(e) => setSelectedPrimary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {selectedRoles.map(role => (
                    <option key={role} value={role}>{ROLES[role]?.label || role}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onSave(contact.id, selectedRoles, selectedPrimary)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Master Contact List</h1>
          <p className="mt-1 text-sm text-gray-500">
            Unified contact management with multiple roles and lifecycle tracking
          </p>
        </div>
        <button
          onClick={() => setShowNewContactForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add New Contact
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {Object.entries(ROLES).map(([key, role]) => (
          <div key={key} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{role.label}s</p>
                <p className="text-xl font-bold text-gray-900">{stats.byRole[key] || 0}</p>
              </div>
              <role.icon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedContacts([])}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bulk Actions</option>
                <optgroup label="Add Role">
                  {Object.entries(ROLES).map(([key, role]) => (
                    <option key={`add-${key}`} value={`add-role-${key}`}>Add {role.label} Role</option>
                  ))}
                </optgroup>
                <optgroup label="Remove Role">
                  {Object.entries(ROLES).map(([key, role]) => (
                    <option key={`remove-${key}`} value={`remove-role-${key}`}>Remove {role.label} Role</option>
                  ))}
                </optgroup>
                <option value="delete">Delete Selected</option>
              </select>
              {bulkAction && (
                <button
                  onClick={() => handleBulkRoleUpdate(bulkAction)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, company, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="primaryRole">Primary Role</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Roles</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ROLES).map(([key, role]) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (filterRoles.includes(key)) {
                        setFilterRoles(filterRoles.filter(r => r !== key));
                      } else {
                        setFilterRoles([...filterRoles, key]);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                      filterRoles.includes(key)
                        ? role.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <role.icon className="h-3 w-3" />
                    {role.label} ({stats.byRole[key] || 0})
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lifecycle Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterLifecycle('all')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterLifecycle === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => (
                  <button
                    key={key}
                    onClick={() => setFilterLifecycle(key)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      filterLifecycle === key
                        ? status.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.label} ({stats.byLifecycle[key] || 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifecycle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm">
                            {getInitials(contact.firstName, contact.lastName)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.company && (
                            <div className="text-xs text-gray-500">{contact.company}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(contact.roles || []).map(role => {
                          const roleConfig = ROLES[role];
                          if (!roleConfig) return null;
                          const Icon = roleConfig.icon;
                          return (
                            <span
                              key={role}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleConfig.color}`}
                              title={contact.primaryRole === role ? 'Primary Role' : ''}
                            >
                              <Icon className="h-3 w-3" />
                              {roleConfig.label}
                              {contact.primaryRole === role && <Star className="h-3 w-3" />}
                            </span>
                          );
                        })}
                        <button
                          onClick={() => setEditingRoles(contact)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={contact.lifecycleStatus || 'active'}
                        onChange={(e) => handleUpdateLifecycle(contact.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${
                          LIFECYCLE_STATUSES[contact.lifecycleStatus || 'active']?.color || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => (
                          <option key={key} value={key}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="h-4 w-4" />
                        {contact.documentCount || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/contacts/${contact.id}`)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/contacts/${contact.id}/documents`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Documents"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(contact.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterRoles.length > 0 || filterLifecycle !== 'all' ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterRoles.length > 0 || filterLifecycle !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'}
          </p>
          <button
            onClick={() => setShowNewContactForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add First Contact
          </button>
        </div>
      )}

      {/* Role Editor Modal */}
      {editingRoles && (
        <RoleEditor
          contact={editingRoles}
          onSave={handleUpdateRoles}
          onCancel={() => setEditingRoles(null)}
        />
      )}

      {/* New Contact Form Modal */}
      {showNewContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Contact</h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.firstName}
                    onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.lastName}
                    onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    value={newContact.source}
                    onChange={(e) => setNewContact({...newContact, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="ai-receptionist">AI Receptionist</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newContact.address}
                  onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles (select multiple)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLES).map(([key, role]) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const currentRoles = newContact.roles || [];
                          if (currentRoles.includes(key)) {
                            if (currentRoles.length > 1) {
                              setNewContact({
                                ...newContact,
                                roles: currentRoles.filter(r => r !== key),
                                primaryRole: newContact.primaryRole === key ? currentRoles.filter(r => r !== key)[0] : newContact.primaryRole
                              });
                            }
                          } else {
                            setNewContact({
                              ...newContact,
                              roles: [...currentRoles, key],
                              primaryRole: currentRoles.length === 0 ? key : newContact.primaryRole
                            });
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          newContact.roles.includes(key)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {newContact.roles.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Role
                  </label>
                  <select
                    value={newContact.primaryRole}
                    onChange={(e) => setNewContact({...newContact, primaryRole: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {newContact.roles.map(role => (
                      <option key={role} value={role}>{ROLES[role]?.label || role}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={newContact.lifecycleStatus}
                    onChange={(e) => setNewContact({...newContact, lifecycleStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(LIFECYCLE_STATUSES).map(([key, status]) => (
                      <option key={key} value={key}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PII Level
                  </label>
                  <select
                    value={newContact.piiLevel}
                    onChange={(e) => setNewContact({...newContact, piiLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low - Public Info</option>
                    <option value="med">Medium - Contact Info</option>
                    <option value="high">High - Sensitive Data</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newContact.tags.join(', ')}
                  onChange={(e) => setNewContact({
                    ...newContact,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  placeholder="vip, referral-source, high-value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewContactForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this contact? This will also delete all associated documents and history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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

export default Contacts;