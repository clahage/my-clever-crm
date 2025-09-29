import {
  Home,
  Users,
  FileText,
  CreditCard,
  Mail,
  Calendar,
  Settings,
  Shield,
  Building,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Phone,
  MessageSquare,
  Bell,
  BarChart,
  DollarSign,
  Briefcase,
  HelpCircle,
  Award,
  Target,
  PieChart,
  Archive,
  Zap,
  Globe,
  Database,
  CheckSquare,
  Layers,
  Package,
  BookOpen,
  Key,
  GitBranch,
  List
} from 'lucide-react';

// Enhanced navigation with collapsible groups
export const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/',
    icon: Home,
    permission: 'user'
  },
  {
    id: 'contacts-group',
    title: 'Contacts & CRM',
    icon: Users,
    isGroup: true,
    defaultExpanded: true,
    items: [
      {
        id: 'contacts',
        title: 'All Contacts',
        path: '/contacts',
        icon: List,
        permission: 'user'
      },
      {
        id: 'pipeline',
        title: 'Pipeline',
        path: '/pipeline',
        icon: GitBranch,
        permission: 'user',
        badge: 'NEW'
      },
      {
        id: 'import',
        title: 'Import Contacts',
        path: '/import',
        icon: Upload,
        permission: 'user'
      },
      {
        id: 'export',
        title: 'Export Data',
        path: '/export',
        icon: Download,
        permission: 'user'
      },
      {
        id: 'contact-reports',
        title: 'Contact Reports',
        path: '/contact-reports',
        icon: BarChart,
        permission: 'user'
      },
      {
        id: 'segments',
        title: 'Segments',
        path: '/segments',
        icon: Layers,
        permission: 'user'
      }
    ]
  },
  {
    id: 'credit-group',
    title: 'Credit Management',
    icon: CreditCard,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'credit-scores',
        title: 'Credit Scores',
        path: '/credit-scores',
        icon: TrendingUp,
        permission: 'user'
      },
      {
        id: 'disputes',
        title: 'Dispute Letters',
        path: '/disputes',
        icon: AlertCircle,
        permission: 'user'
      },
      {
        id: 'credit-reports',
        title: 'Credit Reports',
        path: '/credit-reports',
        icon: FileText,
        permission: 'user'
      },
      {
        id: 'credit-monitoring',
        title: 'Credit Monitoring',
        path: '/credit-monitoring',
        icon: Shield,
        permission: 'user'
      },
      {
        id: 'score-simulator',
        title: 'Score Simulator',
        path: '/score-simulator',
        icon: Zap,
        permission: 'user'
      }
    ]
  },
  {
    id: 'communication-group',
    title: 'Communication',
    icon: MessageSquare,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'letters',
        title: 'Letters',
        path: '/letters',
        icon: Mail,
        permission: 'user'
      },
      {
        id: 'emails',
        title: 'Email Campaigns',
        path: '/emails',
        icon: Mail,
        permission: 'user'
      },
      {
        id: 'sms',
        title: 'SMS Campaigns',
        path: '/sms',
        icon: MessageSquare,
        permission: 'user'
      },
      {
        id: 'templates',
        title: 'Templates',
        path: '/templates',
        icon: FileText,
        permission: 'user'
      },
      {
        id: 'call-logs',
        title: 'Call Logs',
        path: '/call-logs',
        icon: Phone,
        permission: 'user'
      },
      {
        id: 'notifications',
        title: 'Notifications',
        path: '/notifications',
        icon: Bell,
        permission: 'user'
      }
    ]
  },
  {
    id: 'documents-group',
    title: 'Documents',
    icon: FileText,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'documents',
        title: 'All Documents',
        path: '/documents',
        icon: FileText,
        permission: 'user'
      },
      {
        id: 'econtracts',
        title: 'E-Contracts',
        path: '/econtracts',
        icon: FileSpreadsheet,
        permission: 'user'
      },
      {
        id: 'forms',
        title: 'Forms',
        path: '/forms',
        icon: CheckSquare,
        permission: 'user'
      },
      {
        id: 'document-storage',
        title: 'Document Storage',
        path: '/document-storage',
        icon: Archive,
        permission: 'user'
      }
    ]
  },
  {
    id: 'business-group',
    title: 'Business Tools',
    icon: Briefcase,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'companies',
        title: 'Companies',
        path: '/companies',
        icon: Building,
        permission: 'user'
      },
      {
        id: 'invoices',
        title: 'Invoices',
        path: '/invoices',
        icon: FileSpreadsheet,
        permission: 'user'
      },
      {
        id: 'affiliates',
        title: 'Affiliates',
        path: '/affiliates',
        icon: Globe,
        permission: 'admin'
      },
      {
        id: 'billing',
        title: 'Billing',
        path: '/billing',
        icon: DollarSign,
        permission: 'admin'
      },
      {
        id: 'products',
        title: 'Products',
        path: '/products',
        icon: Package,
        permission: 'admin'
      }
    ]
  },
  {
    id: 'schedule-group',
    title: 'Scheduling',
    icon: Calendar,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'calendar',
        title: 'Calendar',
        path: '/calendar',
        icon: Calendar,
        permission: 'user'
      },
      {
        id: 'appointments',
        title: 'Appointments',
        path: '/appointments',
        icon: Calendar,
        permission: 'user'
      },
      {
        id: 'tasks',
        title: 'Tasks',
        path: '/tasks',
        icon: CheckSquare,
        permission: 'user'
      },
      {
        id: 'reminders',
        title: 'Reminders',
        path: '/reminders',
        icon: Bell,
        permission: 'user'
      }
    ]
  },
  {
    id: 'analytics-group',
    title: 'Analytics & Reports',
    icon: PieChart,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'analytics',
        title: 'Analytics Dashboard',
        path: '/analytics',
        icon: BarChart,
        permission: 'user'
      },
      {
        id: 'reports',
        title: 'Reports',
        path: '/reports',
        icon: FileText,
        permission: 'user'
      },
      {
        id: 'goals',
        title: 'Goals',
        path: '/goals',
        icon: Target,
        permission: 'user'
      },
      {
        id: 'achievements',
        title: 'Achievements',
        path: '/achievements',
        icon: Award,
        permission: 'user'
      }
    ]
  },
  {
    id: 'admin-group',
    title: 'Administration',
    icon: Settings,
    isGroup: true,
    defaultExpanded: false,
    items: [
      {
        id: 'settings',
        title: 'Settings',
        path: '/settings',
        icon: Settings,
        permission: 'user'
      },
      {
        id: 'team',
        title: 'Team Management',
        path: '/team',
        icon: Users,
        permission: 'admin'
      },
      {
        id: 'roles',
        title: 'Roles & Permissions',
        path: '/roles',
        icon: Key,
        permission: 'admin'
      },
      {
        id: 'integrations',
        title: 'Integrations',
        path: '/integrations',
        icon: Database,
        permission: 'admin'
      },
      {
        id: 'training',
        title: 'Training',
        path: '/training',
        icon: BookOpen,
        permission: 'user'
      },
      {
        id: 'support',
        title: 'Support',
        path: '/support',
        icon: HelpCircle,
        permission: 'user'
      }
    ]
  }
];

// Helper function to get flat array (backward compatibility)
export const getFlatNavigation = () => {
  return navigationItems.reduce((acc, item) => {
    if (item.isGroup && item.items) {
      return [...acc, ...item.items];
    }
    return [...acc, item];
  }, []);
};

// Helper function to check if user has permission
export const hasPermission = (item, userRole) => {
  if (!item.permission) return true;
  if (userRole === 'admin') return true;
  return item.permission === 'user';
};

// Helper function to filter navigation by permissions
export const filterNavigationByRole = (items, userRole) => {
  return items.reduce((acc, item) => {
    if (item.isGroup && item.items) {
      const filteredItems = item.items.filter(subItem => hasPermission(subItem, userRole));
      if (filteredItems.length > 0) {
        return [...acc, { ...item, items: filteredItems }];
      }
    } else if (hasPermission(item, userRole)) {
      return [...acc, item];
    }
    return acc;
  }, []);
};