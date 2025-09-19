import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, MessageSquare, CheckCircle } from 'lucide-react';

export default function SocialMediaAlert() {
  const [urgentCount, setUrgentCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [alertLevel, setAlertLevel] = useState('none'); // 'urgent', 'pending', 'none'
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for pending responses
    const q = query(
      collection(db, 'social_responses'),
      where('status', '==', 'pending_approval')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let urgent = 0;
      let pending = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if urgent (e.g., low rating reviews, complaint keywords)
        const isUrgent = 
          (data.rating && data.rating <= 2) ||
          (data.originalMessage && (
            data.originalMessage.toLowerCase().includes('urgent') ||
            data.originalMessage.toLowerCase().includes('complaint') ||
            data.originalMessage.toLowerCase().includes('terrible') ||
            data.originalMessage.toLowerCase().includes('worst')
          ));

        if (isUrgent) {
          urgent++;
        } else {
          pending++;
        }
      });

      setUrgentCount(urgent);
      setPendingCount(pending);
      
      // Set alert level
      if (urgent > 0) {
        setAlertLevel('urgent');
      } else if (pending > 0) {
        setAlertLevel('pending');
      } else {
        setAlertLevel('none');
      }
    });

    return () => unsubscribe();
  }, []);

  const getAlertStyles = () => {
    switch (alertLevel) {
      case 'urgent':
        return 'bg-red-700 animate-pulse shadow-lg shadow-red-500/50'; // Even darker red
      case 'pending':
        return 'bg-amber-700 animate-pulse shadow-lg shadow-amber-500/30'; // Even darker amber
      case 'none':
        return 'bg-gray-700'; // Dark gray instead of green
      default:
        return 'bg-gray-700';
    }
  };

  const getAlertIcon = () => {
    switch (alertLevel) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5" />;
      case 'pending':
        return <MessageSquare className="h-5 w-5" />;
      case 'none':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getAlertMessage = () => {
    if (urgentCount > 0) {
      return `${urgentCount} URGENT response${urgentCount > 1 ? 's' : ''} need attention!`;
    } else if (pendingCount > 0) {
      return `${pendingCount} response${pendingCount > 1 ? 's' : ''} awaiting approval`;
    } else {
      return 'All responses handled';
    }
  };

  return (
    <div 
      onClick={() => navigate('/social-admin')}
      className={`
        cursor-pointer rounded-lg p-4 text-white transition-all duration-300
        ${getAlertStyles()}
        hover:scale-105 hover:shadow-xl
      `}
      // Diagnosis alert section border colors for contrast
      style={{
        border: alertLevel === 'urgent' ? '2px solid #b91c1c' : // red-600
                alertLevel === 'pending' ? '2px solid #d97706' : // amber-600
                alertLevel === 'none' ? '2px solid #15803d' : // green-600
                '2px solid #4b5563', // gray-600
        backgroundColor: alertLevel === 'urgent' ? '#fee2e2' : // red-100
                        alertLevel === 'pending' ? '#fef3c7' : // amber-100
                        alertLevel === 'none' ? '#d1fae5' : // green-100
                        '#f3f4f6' // gray-100
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getAlertIcon()}
          <div>
            <h3 className="font-semibold">Social Media Alerts</h3>
            <p className="text-sm font-medium opacity-100">{getAlertMessage()}</p>
          </div>
        </div>
        {(urgentCount + pendingCount) > 0 && (
          <div className="text-2xl font-bold">
            {urgentCount + pendingCount}
          </div>
        )}
      </div>
    </div>
  );
}
