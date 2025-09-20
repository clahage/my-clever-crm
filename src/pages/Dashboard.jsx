import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { getDoc, doc, collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import BrandLogo from "../components/BrandLogo";
import { useTheme } from '../theme/ThemeProvider';
import { 
  BarChart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';

// --- ON-SCREEN BEACON ---
const Beacon = () => (
  <div style={{background:'#e0e7ff',color:'#3730a3',padding:'4px 0',textAlign:'center',fontWeight:'bold',letterSpacing:1,marginBottom:12,zIndex:9999}}>
    [BEACON: Dashboard.jsx]
  </div>
);

const quickActions = [
  { label: 'Credit Scores', href: '/client/reports', color: 'bg-blue-600' },
  { label: 'Dispute Letters', href: '/client/disputes', color: 'bg-yellow-500' },
  { label: 'Client Management', href: '/contacts', color: 'bg-green-600' },
  { label: 'Client Portal', href: '/client', color: 'bg-purple-600' },
];

function Dashboard() {
  console.log('🟢 Dashboard component rendering');
  const { user } = useAuth();
  console.log('🟢 User from auth:', user);
  const { theme, setTheme } = useTheme();
  const [clientData, setClientData] = useState(null);
  const [creditScores, setCreditScores] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!user) return;
    // ...existing useEffect code...
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome {user?.email}</p>
    </div>
  );
}

export default Dashboard;
