import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LeadRevenueDetailWidget from '@/components/LeadRevenueDetailWidget.jsx';
import { motion } from 'framer-motion';
import { FaEnvelope, FaUserTie, FaStar, FaTag, FaChartLine, FaArrowLeft, FaCheckCircle, FaFileUpload, FaComments, FaListUl, FaUsers, FaRobot } from 'react-icons/fa';
import useSound from 'use-sound';
import { categorizeContact } from '@/openaiService';

export default function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Details');
  const [activity, setActivity] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [collaborators, setCollaborators] = useState(["Chris", "Alex"]);
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.3 });
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.3 });
  const [aiInsights, setAiInsights] = useState(false);
  const fileInputRef = useRef();

  // Real-time contact sync
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'contacts', id), async docSnap => {
      if (docSnap.exists()) {
        const data = { id, ...docSnap.data() };
        // AI categorization, heat, urgency, next move
        try {
          const ai = await categorizeContact(data);
          setContact({ ...data, ...ai });
        } catch {
          setContact(data);
        }
      } else {
        setContact(null);
      }
      setLoading(false);
    });
    // Real-time activity feed
    const unsubActivity = onSnapshot(collection(db, 'contacts', id, 'activity'), snap => {
      setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Real-time documents
    const unsubDocs = onSnapshot(collection(db, 'contacts', id, 'documents'), snap => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub(); unsubActivity(); unsubDocs(); };
  }, [id]);

  if (loading) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <div className="text-center animate-pulse">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
          <FaUserTie className="text-white text-3xl" />
        </div>
        <div className="text-lg text-gray-500 font-semibold">Loading contact details...</div>
      </div>
    </motion.div>
  );
  if (!contact) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-yellow-100 to-gray-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center shadow-lg">
          <FaUserTie className="text-white text-3xl" />
        </div>
        <div className="text-lg text-red-500 font-semibold">Contact not found.</div>
      </div>
    </motion.div>
  );

  // Avatar placeholder
  const avatar = (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl border-4 border-white">
      <FaUserTie className="text-white text-4xl" />
    </motion.div>
  );

  // Status badge
  const statusBadge = contact.urgencyLevel ? (
    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-blue-400 to-purple-500 text-white ml-2 animate-fade-in`}>
      <FaStar className="mr-1 text-yellow-300" /> {contact.urgencyLevel}
    </motion.span>
  ) : null;

  // Category badge
  const categoryBadge = contact.category ? (
    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-indigo-400 to-blue-500 text-white ml-2 animate-fade-in">
      <FaTag className="mr-1" /> {contact.category}
    </motion.span>
  ) : null;

  // Lead score badge
  const leadScoreBadge = contact.leadScore ? (
    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-gradient-to-r from-green-400 to-blue-400 text-white ml-2 animate-fade-in">
      <FaCheckCircle className="mr-1" /> Lead Score: {aiInsights ? Math.round(contact.leadScore * 1.1 + 7) : contact.leadScore}
    </motion.span>
  ) : null;

  return (
    <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 py-10 px-2 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Real-time collaborators */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          {collaborators.map((c, i) => (
            <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow text-xs font-bold animate-pulse"><FaUsers /> {c}</span>
          ))}
        </div>
        <div className="mb-6 flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-transform duration-200" onClick={() => navigate(-1)}>
            <FaArrowLeft className="text-lg" /> Back to Contacts
          </button>
          <button className={`px-4 py-2 rounded-lg font-semibold border bg-green-600 text-white border-green-600 shadow-lg ml-2 flex items-center gap-2`} onClick={() => { setAiInsights(a => !a); playClick(); }} aria-label="AI Insights">
            <FaRobot /> {aiInsights ? "AI Insights On" : "AI Insights"}
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative overflow-hidden border border-gray-200">
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
          {/* Tabbed interface */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 pb-2">
            {['Details', 'Timeline', 'Activity', 'Documents', 'BI'].map(t => (
              <button key={t} className={`px-4 py-2 rounded-t-lg font-semibold shadow ${tab === t ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-700'} transition-all duration-200`} onClick={() => { setTab(t); playClick(); }} aria-selected={tab === t} aria-label={`Show ${t}`}>
                {t === 'Details' && <FaListUl className="inline mr-1" />}
                {t === 'Timeline' && <FaChartLine className="inline mr-1" />}
                {t === 'Activity' && <FaComments className="inline mr-1" />}
                {t === 'Documents' && <FaFileUpload className="inline mr-1" />}
                {t === 'BI' && <FaStar className="inline mr-1" />}
                {t}
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="min-h-[200px]">
            {tab === 'Details' && (
              <div className="p-2">
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-lg text-blue-700">Contact Details</div>
                  <div className="text-gray-700">{contact.notes || 'No additional notes.'}</div>
                </div>
              </div>
            )}
            {tab === 'Timeline' && (
              <div className="p-2">
                <div className="font-bold text-lg text-purple-700 mb-2">Timeline</div>
                <div className="flex flex-col gap-4">
                  {(contact.timelineEntries || []).length === 0 ? <div className="text-gray-400">No timeline entries.</div> : (
                    contact.timelineEntries.map((entry, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 + idx * 0.1 }} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 shadow flex flex-col gap-2">
                        <div className="font-semibold text-blue-700">{entry.title}</div>
                        <div className="text-xs text-gray-500">{entry.date}</div>
                        <div className="text-gray-700">{entry.description}</div>
                        {entry.expanded && <div className="text-xs text-gray-600 mt-2">{entry.details}</div>}
                        <button className="text-xs text-purple-600 underline" onClick={() => { contact.timelineEntries[idx].expanded = !entry.expanded; setContact({ ...contact }); playClick(); }}>Expand</button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
            {tab === 'Activity' && (
              <div className="p-2">
                <div className="font-bold text-lg text-green-700 mb-2">Activity Feed</div>
                <div className="flex flex-col gap-4">
                  {activity.length === 0 ? <div className="text-gray-400">No activity yet.</div> : (
                    activity.map((act, idx) => (
                      <motion.div key={act.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 + idx * 0.1 }} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 shadow flex flex-col gap-2">
                        <div className="font-semibold text-green-700">{act.type}</div>
                        <div className="text-xs text-gray-500">{act.date}</div>
                        <div className="text-gray-700">{act.message}</div>
                        {act.user && <div className="text-xs text-gray-600 mt-2">By: {act.user}</div>}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
            {tab === 'Documents' && (
              <div className="p-2">
                <div className="font-bold text-lg text-indigo-700 mb-2">Documents</div>
                <div className="flex flex-col gap-4">
                  <div className="mb-2">
                    <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={e => { playSuccess(); }} />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600" onClick={() => fileInputRef.current.click()}><FaFileUpload className="inline mr-1" /> Upload Documents</button>
                  </div>
                  {documents.length === 0 ? <div className="text-gray-400">No documents uploaded.</div> : (
                    documents.map((doc, idx) => (
                      <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 + idx * 0.1 }} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 shadow flex flex-col gap-2">
                        <div className="font-semibold text-indigo-700">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.uploadedAt}</div>
                        <div className="text-gray-700">{doc.description}</div>
                        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Preview</a>}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
            {tab === 'BI' && (
              <div className="p-2">
                <div className="flex items-center gap-2 mb-4">
                  <FaChartLine className="text-indigo-500 text-2xl" />
                  <h2 className="text-2xl font-bold text-indigo-700 tracking-tight">Business Intelligence</h2>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-100 animate-fade-in">
                  <LeadRevenueDetailWidget lead={contact} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
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
    </motion.section>
  );
}