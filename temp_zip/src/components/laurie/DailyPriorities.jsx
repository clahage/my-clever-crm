// src/components/laurie/DailyPriorities.jsx
// Laurie's Daily Priorities Dashboard
// Shows erupting/hot/warm leads + pending Zelle payments

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { 
  Flame, Phone, Mail, CheckCircle, X, Clock,
  DollarSign, AlertCircle, TrendingUp, Eye
} from 'lucide-react';

const DailyPriorities = () => {
  const [eruptingLeads, setEruptingLeads] = useState([]);
  const [hotLeads, setHotLeads] = useState([]);
  const [warmLeads, setWarmLeads] = useState([]);
  const [pendingZelle, setPendingZelle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadPriorities();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPriorities();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshKey]);

  const loadPriorities = async () => {
    try {
      setLoading(true);
      const contactsRef = collection(db, 'contacts');

      // Erupting leads (95-100 score)
      const eruptingQuery = query(
        contactsRef,
        where('temperature', '==', 'erupting'),
        where('status', '==', 'new'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const eruptingSnap = await getDocs(eruptingQuery);
      setEruptingLeads(eruptingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Hot leads (80-94 score)
      const hotQuery = query(
        contactsRef,
        where('temperature', '==', 'hot'),
        where('status', '==', 'new'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const hotSnap = await getDocs(hotQuery);
      setHotLeads(hotSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Warm leads (60-79 score)
      const warmQuery = query(
        contactsRef,
        where('temperature', '==', 'warm'),
        where('status', '==', 'new'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const warmSnap = await getDocs(warmQuery);
      setWarmLeads(warmSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Pending Zelle payments
      const zelleQuery = query(
        collection(db, 'paymentTransactions'),
        where('type', '==', 'zelle'),
        where('status', '==', 'pending-confirmation'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const zelleSnap = await getDocs(zelleQuery);
      const zelleDocs = zelleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load client data for each Zelle payment
      for (let payment of zelleDocs) {
        if (payment.clientId) {
          const clientDoc = await getDocs(query(
            collection(db, 'contacts'),
            where('__name__', '==', payment.clientId),
            limit(1)
          ));
          if (!clientDoc.empty) {
            payment.clientData = clientDoc.docs[0].data();
          }
        }
      }
      
      setPendingZelle(zelleDocs);

      setLoading(false);
    } catch (error) {
      console.error('Error loading priorities:', error);
      setLoading(false);
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
    <div className="p-6 space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ☀️ Today's Priorities
        </h1>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ERUPTING LEADS - RED ALERT */}
      {eruptingLeads.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-4 border-red-500 rounded-lg p-6 animate-pulse shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-10 w-10 text-red-600 animate-bounce" />
            <h2 className="text-3xl font-bold text-red-900 dark:text-red-100">
              🔥🔥🔥 ERUPTING LEADS - CALL NOW! ({eruptingLeads.length})
            </h2>
          </div>
          <div className="space-y-3">
            {eruptingLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} priority="erupting" onUpdate={loadPriorities} />
            ))}
          </div>
        </div>
      )}

      {/* HOT LEADS */}
      {hotLeads.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              🔥 Hot Leads - Call Today ({hotLeads.length})
            </h2>
          </div>
          <div className="space-y-3">
            {hotLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} priority="hot" onUpdate={loadPriorities} />
            ))}
          </div>
        </div>
      )}

      {/* PENDING ZELLE PAYMENTS */}
      {pendingZelle.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              💜 Zelle Payments - Confirm Receipt ({pendingZelle.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingZelle.map(payment => (
              <ZellePaymentCard key={payment.id} payment={payment} onUpdate={loadPriorities} />
            ))}
          </div>
          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Check your Chase app/email for Zelle receipts and confirm each payment above
            </p>
          </div>
        </div>
      )}

      {/* WARM LEADS (Collapsed) */}
      {warmLeads.length > 0 && (
        <details className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 rounded-lg p-6">
          <summary className="cursor-pointer text-xl font-bold text-yellow-900 dark:text-yellow-100 hover:text-yellow-700">
            ⚡ Warm Leads - Follow Up This Week ({warmLeads.length}) [Click to Expand]
          </summary>
          <div className="mt-4 space-y-3">
            {warmLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} priority="warm" onUpdate={loadPriorities} />
            ))}
          </div>
        </details>
      )}

      {/* Empty State */}
      {eruptingLeads.length === 0 && hotLeads.length === 0 && warmLeads.length === 0 && pendingZelle.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            All Caught Up! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            No urgent tasks right now. Great job, Laurie!
          </p>
        </div>
      )}
    </div>
  );
};

// Lead Card Component
const LeadCard = ({ lead, priority, onUpdate }) => {
  const [calling, setCalling] = useState(false);
  
  const getTimeSinceCall = () => {
    if (!lead.createdAt?.seconds) return 'Just now';
    const minutes = Math.floor((Date.now() - lead.createdAt.seconds * 1000) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const handleCall = () => {
    setCalling(true);
    window.location.href = `tel:${lead.phone}`;
    setTimeout(() => setCalling(false), 3000);
  };

  const handleEmail = () => {
    window.location.href = `mailto:${lead.email}?subject=Following up on your credit repair inquiry`;
  };

  const getBorderColor = () => {
    if (priority === 'erupting') return 'border-red-500';
    if (priority === 'hot') return 'border-orange-400';
    return 'border-yellow-300';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-2 ${getBorderColor()}`}>
      <div className="flex justify-between items-start gap-4">
        {/* Lead Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {lead.firstName} {lead.lastName}
            </h3>
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Score: {lead.leadScore}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="font-mono font-medium">{lead.phone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{getTimeSinceCall()}</span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              💬 "{lead.aiObservations || lead.notes}"
            </p>
          </div>

          {/* Sentiment */}
          {lead.sentiment && (
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                😊 {lead.sentiment.positive}%
              </span>
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">
                😐 {lead.sentiment.neutral}%
              </span>
              <span className="px-2 py-1 rounded bg-red-100 text-red-800">
                😞 {lead.sentiment.negative}%
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCall}
            disabled={calling}
            className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium shadow-lg transition-all"
          >
            <Phone className="h-5 w-5" />
            {calling ? 'Calling...' : 'Call Now'}
          </button>
          
          {lead.email && (
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg"
            >
              <Mail className="h-5 w-5" />
              Email
            </button>
          )}
          
          <button
            className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg"
          >
            <Eye className="h-5 w-5" />
            View Full
          </button>
        </div>
      </div>
    </div>
  );
};

// Zelle Payment Card Component
const ZellePaymentCard = ({ payment, onUpdate }) => {
  const [confirming, setConfirming] = useState(false);
  const [chaseId, setChaseId] = useState('');

  const handleConfirm = async () => {
    if (!chaseId.trim()) {
      alert('Please enter the Chase transaction ID from your Zelle receipt');
      return;
    }

    setConfirming(true);
    try {
      const confirmZellePayment = httpsCallable(functions, 'confirmZellePayment');
      await confirmZellePayment({
        transactionId: payment.id,
        chaseTransactionId: chaseId
      });

      alert('✅ Payment confirmed! Receipt sent to client.');
      onUpdate();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error confirming payment: ' + error.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleNotReceived = async () => {
    if (!confirm('Are you sure this payment was NOT received in Chase?')) return;

    try {
      const markZelleNotReceived = httpsCallable(functions, 'markZelleNotReceived');
      await markZelleNotReceived({
        transactionId: payment.id,
        reason: 'Not found in Chase account'
      });

      alert('Marked as not received. Client will be contacted.');
      onUpdate();
    } catch (error) {
      console.error('Error marking not received:', error);
      alert('Error: ' + error.message);
    }
  };

  const getTimeSince = () => {
    if (!payment.createdAt?.seconds) return 'Just now';
    const minutes = Math.floor((Date.now() - payment.createdAt.seconds * 1000) / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.floor(minutes / 60)} hrs ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border-2 border-purple-400">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {payment.clientData?.firstName} {payment.clientData?.lastName}
            </h3>
            <span className="px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-800">
              Client #{payment.clientData?.clientNumber || payment.clientId.slice(0, 8)}
            </span>
          </div>

          <div className="space-y-1 text-sm mb-3">
            <p className="text-2xl font-bold text-purple-600">${payment.amount}</p>
            <p className="text-gray-600 dark:text-gray-400">Reported: {getTimeSince()}</p>
            <p className="text-xs text-gray-500">Reference: {payment.zelle?.reference}</p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Chase Transaction ID (optional)"
              value={chaseId}
              onChange={(e) => setChaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            <CheckCircle className="h-4 w-4" />
            {confirming ? 'Confirming...' : 'Confirm'}
          </button>
          <button
            onClick={handleNotReceived}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <X className="h-4 w-4" />
            Not Received
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyPriorities;