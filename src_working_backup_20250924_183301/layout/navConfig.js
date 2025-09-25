import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  MessageSquare,
  CreditCard,
  BarChart,
  Phone,
  Share2,
  Brain,
  Shield,
  Briefcase,
  HelpCircle,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Download,
  Layers,
  Mail,
  Building2,
  UserCheck,
  FileCheck,
  ScrollText,
  Activity
} from 'lucide-react';

export const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users,
    current: false
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: UserPlus,
    current: false
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: UserCheck,
    current: false
  },
  {
    name: 'Dispute Center',
    href: '/disputes',
    icon: FileText,
    current: false
  },
  {
    name: 'Progress Portal',
    href: '/progress-portal',
    icon: TrendingUp,
    current: false
  },
  {
    name: 'Credit Reports',
    href: '/credit-reports',
    icon: FileCheck,
    current: false
  },
  {
    name: 'Credit Scores',
    href: '/credit-scores',
    icon: Activity,
    current: false
  },
  {
    name: 'Dispute Letters',
    href: '/dispute-letters',
    icon: ScrollText,
    current: false
  },
  {
    name: 'Letters',
    href: '/letters',
    icon: Mail,
    current: false
  },
  {
    name: 'Communications',
    href: '/communications',
    icon: MessageSquare,
    current: false
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    current: false
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    current: false
  },
  {
    name: 'Export',
    href: '/export',
    icon: Download,
    current: false
  },
  {
    name: 'Bulk Actions',
    href: '/bulk',
    icon: Layers,
    current: false
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart,
    current: false
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Target,
    current: false
  },
  {
    name: 'Contact Reports',
    href: '/contact-reports',
    icon: FileText,
    current: false
  },
  {
    name: 'AI Receptionist',
    href: '/ai-receptionist',
    icon: Phone,
    current: false
  },
  {
    name: 'OpenAI',
    href: '/openai',
    icon: Brain,
    current: false
  },
  {
    name: 'Automation',
    href: '/automation',
    icon: Zap,
    current: false
  },
  {
    name: 'Social Media',
    href: '/social-media',
    icon: Share2,
    current: false
  },
  {
    name: 'Business Credit',
    href: '/business-credit',
    icon: Building2,
    current: false
  },
  {
    name: 'Referrals',
    href: '/referrals',
    icon: Award,
    current: false
  },
  {
    name: 'Admin Tools',
    href: '/admin',
    icon: Shield,
    current: false
  },
  {
    name: 'Client Portal',
    href: '/portal',
    icon: Briefcase,
    current: false
  },
  {
    name: 'Client View (Demo)',
    href: '/client',
    icon: UserCheck,
    current: false
  },
  {
    name: 'Learn',
    href: '/learn',
    icon: BookOpen,
    current: false
  },
  {
    name: 'Support',
    href: '/support',
    icon: HelpCircle,
    current: false
  }
];

export const userNavigation = [
  { name: 'Your Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
  { name: 'Sign out', href: '#', action: 'logout' }
];