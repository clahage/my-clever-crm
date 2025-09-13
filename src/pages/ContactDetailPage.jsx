import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
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

  useEffect(() => {
    console.log('Contact data received:', contact);
  }, [contact]);

  if (loading) return <div>Loading...</div>;
  if (!contact) return <div>Contact not found</div>;

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <FaArrowLeft className="text-xl" />
        </button>
        <button 
          onClick={() => navigate(`/add-client?edit=${id}`)} 
          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold ml-2"
        >
          Edit Contact
        </button>
        <h1 className="text-2xl font-semibold ml-4">Contact Detail</h1>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <div className="text-gray-700">{[contact.prefix, contact.firstName, contact.middleName, contact.lastName, contact.suffix].filter(Boolean).join(' ')}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="text-gray-700">{contact.email || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="text-gray-700">
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  ) : 'Not provided'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <div className="text-gray-700">{contact.company || 'Not provided'}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={contact.responseStatus || 'Active'} 
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await updateDoc(doc(db, 'contacts', id), { responseStatus: newStatus });
                    setContact({...contact, responseStatus: newStatus});
                  }}
                  className="px-3 py-1 border rounded"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-4 md:mt-0">
            <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <FaRobot className="text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Categorization</h3>
              </div>
              <div className="text-gray-700">{contact.category}</div>
              <div className="flex items-center mb-2 mt-4">
                <FaStar className="text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Heat</h3>
              </div>
              <div className="text-gray-700">{contact.heat}</div>
              <div className="flex items-center mb-2 mt-4">
                <FaTag className="text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Urgency</h3>
              </div>
              <div className="text-gray-700">{contact.urgency}</div>
              <div className="flex items-center mb-2 mt-4">
                <FaChartLine className="text-2xl mr-2" />
                <h3 className="text-lg font-semibold">Next Move</h3>
              </div>
              <div className="text-gray-700">{contact.nextMove}</div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            {activity.length === 0 ? (
              <div className="text-gray-500">No activity found.</div>
            ) : (
              <ul className="space-y-2">
                {activity.map((item) => (
                  <li key={item.id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <FaComments className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.type}</div>
                          <div className="text-gray-500 text-xs">{new Date(item.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <button className="text-blue-500 text-sm font-medium hover:underline">
                          View
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-gray-700 text-sm">
                      {item.description}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            {documents.length === 0 ? (
              <div className="text-gray-500">No documents found.</div>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <FaFileUpload className="text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{doc.name}</div>
                          <div className="text-gray-500 text-xs">{new Date(doc.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <button className="text-blue-500 text-sm font-medium hover:underline">
                          Download
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Collaborators</h2>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex flex-wrap -m-2">
              {collaborators.map((collab, index) => (
                <div key={index} className="m-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      <FaUserTie className="text-gray-500" />
                    </div>
                    <div className="text-sm font-medium">{collab}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Details Tab Content Replacement */}
        {tab === 'Details' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold">Full Name:</label>
                <p>{contact.firstName} {contact.middleName} {contact.lastName}</p>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <p>{contact.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="font-semibold">Phone:</label>
                <p>{contact.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <p>{contact.status || contact.category || 'Lead'}</p>
              </div>
            </div>
            {contact.address && (
              <div>
                <label className="font-semibold">Address:</label>
                <p>{contact.address}</p>
              </div>
            )}
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(contact, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
