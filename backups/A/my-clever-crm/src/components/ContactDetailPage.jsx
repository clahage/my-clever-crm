import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import LeadRevenueDetailWidget from './LeadRevenueDetailWidget.jsx';
import { FaEnvelope, FaUserTie, FaStar, FaTag, FaChartLine, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContact() {
      const docRef = doc(db, 'contacts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContact({ id, ...docSnap.data() });
      }
      setLoading(false);
    }
    fetchContact();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <div className="text-center animate-pulse">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
          <FaUserTie className="text-white text-3xl" />
        </div>
        <div className="text-lg text-gray-500 font-semibold">Loading contact details...</div>
      </div>
    </div>
  );
  if (!contact) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-yellow-100 to-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center shadow-lg">
          <FaUserTie className="text-white text-3xl" />
        </div>
        <div className="text-lg text-red-500 font-semibold">Contact not found.</div>
      </div>
    </div>
  );

  // Avatar placeholder
  const avatar = (
    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl border-4 border-white">
      <FaUserTie className="text-white text-4xl" />
    </div>
  );

  // Status badge
  const statusBadge = contact.urgencyLevel ? (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-blue-400 to-purple-500 text-white ml-2 animate-fade-in`}>
      <FaStar className="mr-1 text-yellow-300" /> {contact.urgencyLevel}
    </span>
  ) : null;

  // Category badge
  const categoryBadge = contact.category ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-indigo-400 to-blue-500 text-white ml-2 animate-fade-in">
      <FaTag className="mr-1" /> {contact.category}
    </span>
  ) : null;

  // Lead score badge
  const leadScoreBadge = contact.leadScore ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-green-400 to-blue-400 text-white ml-2 animate-fade-in">
      <FaCheckCircle className="mr-1" /> Lead Score: {contact.leadScore}
    </span>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-10 px-2 md:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-transform duration-200"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="text-lg" /> Back to Contacts
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 animate-gradient-x" />
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            {avatar}
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight flex items-center">
                {contact.firstName} {contact.lastName}
                {statusBadge}
                {categoryBadge}
                {leadScoreBadge}
              </h1>
              <div className="flex flex-wrap gap-4 items-center mb-2">
                <div className="flex items-center gap-2 text-gray-700 text-lg">
                  <FaEnvelope className="text-blue-400" />
                  <span className="font-semibold">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-700 text-lg">
                    <FaUserTie className="text-purple-400" />
                    <span className="font-semibold">{contact.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-2">
                {contact.source && (
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold shadow">Source: {contact.source}</span>
                )}
                {contact.timeline && (
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold shadow">Timeline: {contact.timeline}</span>
                )}
                {contact.responseStatus && (
                  <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold shadow">Status: {contact.responseStatus}</span>
                )}
              </div>
            </div>
          </div>
          <div className="my-8">
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine className="text-indigo-500 text-2xl" />
              <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">Revenue Prediction & Forecast</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100 animate-fade-in">
              <LeadRevenueDetailWidget lead={contact} />
            </div>
          </div>
          {/* Future: Add notes, activity, etc. */}
        </div>
      </div>
      <style>{`
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s linear infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-fade-in {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}