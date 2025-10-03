// navConfig.js - Complete and Error-Free Navigation Configuration
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Mail,
  Calendar,
  Settings,
  Shield,
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
  List,
  MapPin,
  Upload,
  Download,
  MessageSquare,
  Phone,
  FileSpreadsheet,
  AlertCircle,
  Building,
  TrendingUp,
  Calculator
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
        id: 'credit-simulator',
        title: 'Credit Simulator',
        path: '/credit-simulator',
        icon: Calculator,
        description: 'Multi-Model Score Simulator',
        permission: 'user',
        badge: 'NEW'
      },
      {
        id: 'business-credit',
        title: 'Business Credit',
        path: '/business-credit',
        icon: Building,
        permission: 'user',
        badge: 'PRO'
      },
      {
        id: 'credit-scores',
        title: 'Credit Scores',
        path: '/credit-scores',
        icon: TrendingUp,
        permission: 'user'
      },
      {
        id: 'dispute-letters',
        title: 'Dispute Command Center',
        path: '/dispute-letters',
        icon: FileText,
        description: 'AI-Powered Disputes with Telnyx Fax',
        permission: 'user',
        badge: 'FAX'
      },
      {
        id: 'dispute-status',
        title: 'Dispute Status',
        path: '/dispute-status',
        icon: AlertCircle,
        permission: 'user'
      },
      {
        id: 'dispute-admin-panel',
        title: 'Dispute Admin Panel',
        path: '/admin/dispute-admin-panel',
        icon: Shield,
        permission: 'admin'
      },

      {
        id: 'dispute-admin-panel',
        title: 'Dispute Admin Panel',
        path: '/admin/dispute-admin-panel',
        icon: Shield,
        permission: 'admin'
      },
      {
        id: 'credit-reports',
        title: 'Credit Reports',
        path: '/credit-reports',
        icon: FileSpreadsheet,
        permission: 'user'
      },
      
      {
        id: 'credit-monitoring',
        title: 'Monitoring',
        path: '/credit-monitoring',
        icon: AlertCircle,
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
        title: 'Emails',
        path: '/emails',
        icon: Mail,
        permission: 'user'
      },
      {
        id: 'sms',
        title: 'SMS',
        path: '/sms',
        icon: MessageSquare,
        permission: 'user'
      },
      {
        id: 'drip-campaigns',
        title: 'Drip Campaigns',
        path: '/drip-campaigns',
        icon: Zap,
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
        id: 'location',
        title: 'Locations',
        path: '/location',
        icon: MapPin,
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
        icon: Shield,
        permission: 'admin'
      },
      {
        id: 'integrations',
        title: 'Integrations',
        path: '/integrations',
        icon: Zap,
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
        id: 'learn',
        title: 'Learning Center',
        path: '/learn',
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

// Helper function to filter navigation by user role
export const filterNavigationByRole = (items, userRole) => {
  return items.filter(item => {
    if (item.isGroup) {
      // Filter group items
      const filteredItems = item.items.filter(subItem => {
        if (subItem.permission === 'admin') {
          return userRole === 'admin' || userRole === 'masterAdmin';
        }
        return true;
      });
      
      // Only include group if it has visible items
      if (filteredItems.length > 0) {
        return { ...item, items: filteredItems };
      }
      return false;
    } else {
      // Filter single items
      if (item.permission === 'admin') {
        return userRole === 'admin' || userRole === 'masterAdmin';
      }
      return true;
    }
  }).map(item => {
    if (item.isGroup && item.items) {
      return {
        ...item,
        items: item.items.filter(subItem => {
          if (subItem.permission === 'admin') {
            return userRole === 'admin' || userRole === 'masterAdmin';
          }
          return true;
        })
      };
    }
    return item;
  });
};

export default navigationItems;