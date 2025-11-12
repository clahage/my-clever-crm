import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import {
  Shield,
  Key,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Lock,
  Unlock,
  Crown,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  EyeOff,
  Award,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  UserPlus,
  Zap,
  Target,
  Layers,
  GitBranch
} from 'lucide-react';

const Roles = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 1,
    color: '#3b82f6',
    permissions: [],
    limits: {
      maxContacts: 1000,
      maxLeads: 500,
      maxClients: 100,
      storageGB: 10
    }
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active'
  });

  // Comprehensive permission categories
  const permissionCategories = {
    'Contacts & Leads': [
      { id: 'contacts_view', label: 'View Contacts', description: 'View contact information' },
      { id: 'contacts_create', label: 'Create Contacts', description: 'Add new contacts' },
      { id: 'contacts_edit', label: 'Edit Contacts', description: 'Modify contact details' },
      { id: 'contacts_delete', label: 'Delete Contacts', description: 'Remove contacts' },
      { id: 'contacts_export', label: 'Export Contacts', description: 'Export contact data' },
      { id: 'leads_view', label: 'View Leads', description: 'Access lead information' },
      { id: 'leads_assign', label: 'Assign Leads', description: 'Distribute leads to team' },
      { id: 'leads_convert', label: 'Convert Leads', description: 'Convert leads to clients' }
    ],
    'Client Management': [
      { id: 'clients_view', label: 'View Clients', description: 'Access client profiles' },
      { id: 'clients_edit', label: 'Edit Clients', description: 'Update client information' },
      { id: 'clients_status', label: 'Change Status', description: 'Update client status' },
      { id: 'clients_notes', label: 'Add Notes', description: 'Add client notes' },
      { id: 'clients_tasks', label: 'Manage Tasks', description: 'Create and assign tasks' },
      { id: 'clients_documents', label: 'Access Documents', description: 'View/upload documents' }
    ],
    'Credit Repair': [
      { id: 'credit_view', label: 'View Reports', description: 'Access credit reports' },
      { id: 'credit_disputes', label: 'File Disputes', description: 'Create dispute letters' },
      { id: 'credit_analysis', label: 'Run Analysis', description: 'Perform credit analysis' },
      { id: 'credit_idiq', label: 'IDIQ Integration', description: 'Use IDIQ API features' },
      { id: 'credit_score', label: 'Score Tracking', description: 'Monitor credit scores' }
    ],
    'Business & Finance': [
      { id: 'billing_view', label: 'View Billing', description: 'Access billing information' },
      { id: 'billing_create', label: 'Create Invoices', description: 'Generate invoices' },
      { id: 'billing_payments', label: 'Process Payments', description: 'Handle payments' },
      { id: 'reports_financial', label: 'Financial Reports', description: 'View revenue reports' },
      { id: 'products_manage', label: 'Manage Products', description: 'Add/edit products' }
    ],
    'AI & Automation': [
      { id: 'ai_receptionist', label: 'AI Receptionist', description: 'Configure AI assistant' },
      { id: 'campaigns_create', label: 'Email Campaigns', description: 'Create campaigns' },
      { id: 'campaigns_drip', label: 'Drip Campaigns', description: 'Set up automation' },
      { id: 'workflows_manage', label: 'Workflows', description: 'Configure workflows' }
    ],
    'Analytics & Reports': [
      { id: 'analytics_view', label: 'View Analytics', description: 'Access dashboards' },
      { id: 'analytics_export', label: 'Export Reports', description: 'Download reports' },
      { id: 'analytics_custom', label: 'Custom Reports', description: 'Create custom reports' },
      { id: 'analytics_realtime', label: 'Real-time Data', description: 'Live analytics' }
    ],
    'Administration': [
      { id: 'admin_users', label: 'Manage Users', description: 'Add/edit users' },
      { id: 'admin_roles', label: 'Manage Roles', description: 'Configure roles' },
      { id: 'admin_settings', label: 'System Settings', description: 'Modify settings' },
      { id: 'admin_integrations', label: 'Integrations', description: 'Configure APIs' },
      { id: 'admin_audit', label: 'Audit Logs', description: 'View activity logs' },
      { id: 'admin_security', label: 'Security Settings', description: 'Manage security' }
    ]
  };

  // Default role templates
  const roleTemplates = [
    {
      name: 'Master Admin',
      description: 'Full system access with all permissions',
      level: 10,
      color: '#dc2626',
      icon: Crown,
      permissions: Object.values(permissionCategories).flat().map(p => p.id),
      limits: { maxContacts: -1, maxLeads: -1, maxClients: -1, storageGB: -1 }
    },
    {
      name: 'Admin',
      description: 'Administrative access with most permissions',
      level: 8,
      color: '#ea580c',
      icon: Shield,
      permissions: Object.values(permissionCategories).flat().filter(p => 
        !p.id.includes('admin_security') && !p.id.includes('admin_roles')
      ).map(p => p.id),
      limits: { maxContacts: 10000, maxLeads: 5000, maxClients: 1000, storageGB: 100 }
    },
    {
      name: 'Manager',
      description: 'Team management and client oversight',
      level: 6,
      color: '#2563eb',
      icon: Users,
      permissions: [
        'contacts_view', 'contacts_create', 'contacts_edit', 'contacts_export',
        'leads_view', 'leads_assign', 'leads_convert',
        'clients_view', 'clients_edit', 'clients_status', 'clients_notes', 'clients_tasks',
        'credit_view', 'credit_disputes', 'credit_analysis',
        'reports_financial', 'analytics_view', 'analytics_export'
      ],
      limits: { maxContacts: 5000, maxLeads: 2000, maxClients: 500, storageGB: 50 }
    },
    {
      name: 'Credit Specialist',
      description: 'Credit repair and dispute management',
      level: 5,
      color: '#059669',
      icon: Target,
      permissions: [
        'contacts_view', 'leads_view', 
        'clients_view', 'clients_notes', 'clients_documents',
        'credit_view', 'credit_disputes', 'credit_analysis', 'credit_idiq', 'credit_score',
        'analytics_view'
      ],
      limits: { maxContacts: 2000, maxLeads: 500, maxClients: 200, storageGB: 25 }
    },
    {
      name: 'Sales Agent',
      description: 'Lead conversion and client acquisition',
      level: 4,
      color: '#7c3aed',
      icon: TrendingUp,
      permissions: [
        'contacts_view', 'contacts_create', 'contacts_edit',
        'leads_view', 'leads_convert',
        'clients_view', 'clients_notes',
        'campaigns_create', 'analytics_view'
      ],
      limits: { maxContacts: 1000, maxLeads: 500, maxClients: 100, storageGB: 10 }
    },
    {
      name: 'Support Staff',
      description: 'Customer support and basic operations',
      level: 3,
      color: '#0891b2',
      icon: UserCheck,
      permissions: [
        'contacts_view', 'leads_view',
        'clients_view', 'clients_notes', 'clients_tasks',
        'credit_view', 'analytics_view'
      ],
      limits: { maxContacts: 500, maxLeads: 200, maxClients: 50, storageGB: 5 }
    },
    {
      name: 'View Only',
      description: 'Read-only access to reports and data',
      level: 1,
      color: '#64748b',
      icon: Eye,
      permissions: [
        'contacts_view', 'leads_view', 'clients_view',
        'credit_view', 'analytics_view'
      ],
      limits: { maxContacts: 100, maxLeads: 50, maxClients: 25, storageGB: 1 }
    }
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load roles
      const rolesSnapshot = await getDocs(query(collection(db, 'roles'), orderBy('level', 'desc')));
      const rolesData = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If no roles, create templates
      if (rolesData.length === 0) {
        const createdRoles = [];
        for (const template of roleTemplates) {
          // Remove icon before saving to Firestore
          const { icon, ...templateData } = template;
          const docRef = await addDoc(collection(db, 'roles'), {
            ...templateData,
            createdAt: serverTimestamp(),
            createdBy: user?.uid
          });
          createdRoles.push({ id: docRef.id, ...template });
        }
        setRoles(createdRoles);
      } else {
        setRoles(rolesData);
      }

      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalRoles = roles.length;
    const customRoles = roles.filter(r => !roleTemplates.some(t => t.name === r.name)).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRoles,
      customRoles,
      avgPermissions: roles.length > 0 
        ? Math.round(roles.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) / roles.length)
        : 0
    };
  }, [users, roles]);

  // Filtered and sorted data
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'role') return (a.role || '').localeCompare(b.role || '');
      return 0;
    });
  }, [users, searchTerm, filterRole, sortBy]);

  // Handle role creation
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;

    try {
      // Don't save icon if it exists in newRole
      const { icon, ...roleData } = newRole;
      const docRef = await addDoc(collection(db, 'roles'), {
        ...roleData,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      
      setRoles([...roles, { id: docRef.id, ...newRole }]);
      setShowAddRole(false);
      setNewRole({
        name: '',
        description: '',
        level: 1,
        color: '#3b82f6',
        permissions: [],
        limits: { maxContacts: 1000, maxLeads: 500, maxClients: 100, storageGB: 10 }
      });
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  // Handle role update
  const handleUpdateRole = async (roleId, updates) => {
    try {
      await updateDoc(doc(db, 'roles', roleId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      setRoles(roles.map(r => r.id === roleId ? { ...r, ...updates } : r));
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await deleteDoc(doc(db, 'roles', roleId));
      setRoles(roles.filter(r => r.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.role) return;

    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...newUser,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      
      setUsers([...users, { id: docRef.id, ...newUser }]);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', role: '', department: '', status: 'active' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle user role update
  const handleUpdateUserRole = async (userId, newRoleId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRoleId,
        updatedAt: serverTimestamp()
      });
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRoleId } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Get role color
  const getRoleColor = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role?.color || '#64748b';
  };

  // Get role icon
  const getRoleIcon = (roleName) => {
    const template = roleTemplates.find(t => t.name === roleName);
    return template?.icon || Shield;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                <p className="text-blue-100 mt-1">Manage user access and security</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => setShowAddRole(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-white/90 text-blue-600 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active</p>
                  <p className="text-3xl font-bold mt-1">{stats.activeUsers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Roles</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalRoles}</p>
                </div>
                <Key className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Custom Roles</p>
                  <p className="text-3xl font-bold mt-1">{stats.customRoles}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Avg Permissions</p>
                  <p className="text-3xl font-bold mt-1">{stats.avgPermissions}</p>
                </div>
                <Layers className="w-8 h-8 text-orange-300" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Security Score</p>
                  <p className="text-3xl font-bold mt-1">98%</p>
                </div>
                <Shield className="w-8 h-8 text-green-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'roles'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'permissions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Permissions</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Log</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Role Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-blue-600" />
                Role Distribution
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {roles.slice(0, 8).map((role) => {
                  const RoleIcon = getRoleIcon(role.name);
                  const userCount = users.filter(u => u.role === role.id).length;
                  return (
                    <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${role.color}20` }}>
                          <RoleIcon className="w-5 h-5" style={{ color: role.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{role.name}</h4>
                          <p className="text-xs text-gray-500">Level {role.level}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{userCount}</span>
                        <span className="text-xs text-gray-500">users</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Key className="w-3 h-3 mr-1" />
                          {role.permissions?.length || 0} permissions
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { action: 'Role Created', user: 'Admin', role: 'Sales Agent', time: '2 hours ago', type: 'success' },
                  { action: 'User Added', user: 'Manager', role: 'Support Staff', time: '5 hours ago', type: 'info' },
                  { action: 'Permissions Updated', user: 'Admin', role: 'Credit Specialist', time: '1 day ago', type: 'warning' },
                  { action: 'User Deactivated', user: 'Admin', role: 'View Only', time: '2 days ago', type: 'error' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {activity.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                        {activity.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {activity.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Roles</h3>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {roles.map((role) => {
                  const RoleIcon = getRoleIcon(role.name);
                  const userCount = users.filter(u => u.role === role.id).length;
                  const isExpanded = expandedRole === role.id;

                  return (
                    <div key={role.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="p-3 rounded-xl" style={{ backgroundColor: `${role.color}20` }}>
                            <RoleIcon className="w-6 h-6" style={{ color: role.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{role.name}</h4>
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                Level {role.level}
                              </span>
                              {role.level === 10 && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{role.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>{userCount} users</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <Key className="w-4 h-4" />
                                <span>{role.permissions?.length || 0} permissions</span>
                              </div>
                              {role.limits && (
                                <>
                                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                    <Target className="w-4 h-4" />
                                    <span>{role.limits.maxContacts === -1 ? '∞' : role.limits.maxContacts} contacts</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Permissions</h5>
                                <div className="grid grid-cols-3 gap-3">
                                  {Object.entries(permissionCategories).map(([category, perms]) => {
                                    const categoryPerms = perms.filter(p => role.permissions?.includes(p.id));
                                    if (categoryPerms.length === 0) return null;

                                    return (
                                      <div key={category} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{category}</h6>
                                        <div className="space-y-1">
                                          {categoryPerms.map(perm => (
                                            <div key={perm.id} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                              <CheckCircle className="w-3 h-3 text-green-500" />
                                              <span>{perm.label}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setEditingRole(role)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          {!roleTemplates.some(t => t.name === role.name) && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="role">Sort by Role</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => {
                      const userRole = roles.find(r => r.id === user.role);
                      const RoleIcon = userRole ? getRoleIcon(userRole.name) : Shield;

                      return (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {userRole && (
                              <div className="flex items-center space-x-2">
                                <div className="p-1.5 rounded" style={{ backgroundColor: `${userRole.color}20` }}>
                                  <RoleIcon className="w-4 h-4" style={{ color: userRole.color }} />
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{userRole.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{user.department || '-'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions Matrix</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View all permissions across roles</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700/50">
                        Permission
                      </th>
                      {roles.slice(0, 6).map(role => (
                        <th key={role.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="p-1.5 rounded" style={{ backgroundColor: `${role.color}20` }}>
                              {React.createElement(getRoleIcon(role.name), {
                                className: "w-4 h-4",
                                style: { color: role.color }
                              })}
                            </div>
                            <span className="text-xs">{role.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(permissionCategories).map(([category, perms]) => (
                      <React.Fragment key={category}>
                        <tr className="bg-gray-100 dark:bg-gray-700/30">
                          <td colSpan={roles.slice(0, 6).length + 1} className="px-6 py-2">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{category}</span>
                          </td>
                        </tr>
                        {perms.map(perm => (
                          <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                            <td className="px-6 py-3 text-sm text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                              <div>
                                <p className="font-medium">{perm.label}</p>
                                <p className="text-xs text-gray-500">{perm.description}</p>
                              </div>
                            </td>
                            {roles.slice(0, 6).map(role => (
                              <td key={role.id} className="px-4 py-3 text-center">
                                {role.permissions?.includes(perm.id) ? (
                                  <CheckCircle className="w-5 h-5 mx-auto text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 mx-auto text-gray-300 dark:text-gray-600" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Audit Log</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                    Last 30 Days
                  </button>
                  <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { type: 'role_created', user: 'John Admin', detail: 'Created role "Sales Agent"', timestamp: '2024-01-15 14:30', ip: '192.168.1.1' },
                  { type: 'user_added', user: 'Sarah Manager', detail: 'Added user "Mike Johnson" with Support Staff role', timestamp: '2024-01-15 12:15', ip: '192.168.1.5' },
                  { type: 'permission_updated', user: 'John Admin', detail: 'Updated permissions for Credit Specialist role', timestamp: '2024-01-14 16:45', ip: '192.168.1.1' },
                  { type: 'user_status_changed', user: 'Sarah Manager', detail: 'Deactivated user "Bob Smith"', timestamp: '2024-01-14 11:20', ip: '192.168.1.5' },
                  { type: 'role_deleted', user: 'John Admin', detail: 'Deleted role "Temporary Agent"', timestamp: '2024-01-13 09:30', ip: '192.168.1.1' },
                  { type: 'bulk_update', user: 'System', detail: 'Bulk permission update applied to 5 roles', timestamp: '2024-01-12 22:00', ip: 'System' }
                ].map((log, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        log.type === 'role_created' ? 'bg-green-100 dark:bg-green-900/30' :
                        log.type === 'user_added' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        log.type === 'permission_updated' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        log.type === 'user_status_changed' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        log.type === 'role_deleted' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {log.type === 'role_created' && <Plus className="w-5 h-5 text-green-600" />}
                        {log.type === 'user_added' && <UserPlus className="w-5 h-5 text-blue-600" />}
                        {log.type === 'permission_updated' && <Key className="w-5 h-5 text-yellow-600" />}
                        {log.type === 'user_status_changed' && <UserX className="w-5 h-5 text-orange-600" />}
                        {log.type === 'role_deleted' && <Trash2 className="w-5 h-5 text-red-600" />}
                        {log.type === 'bulk_update' && <Zap className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.detail}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">by {log.user}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{log.timestamp}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">IP: {log.ip}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Role</h3>
                <button
                  onClick={() => setShowAddRole(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRole.level}
                    onChange={(e) => setNewRole({ ...newRole, level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this role's responsibilities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role Color
                </label>
                <input
                  type="color"
                  value={newRole.color}
                  onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                  className="w-20 h-10 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-4 max-h-96 overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {Object.entries(permissionCategories).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map(perm => (
                          <label key={perm.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(perm.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRole({ ...newRole, permissions: [...newRole.permissions, perm.id] });
                                } else {
                                  setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== perm.id) });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddRole(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRole.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Create Role</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h3>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Sales"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;