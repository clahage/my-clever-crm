import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import useSound from "use-sound";
import { FaUserTie, FaSearch, FaSyncAlt, FaRobot, FaStar, FaUsers, FaEnvelope } from "react-icons/fa";
import LeadUrgencyIndicator from "@/components/LeadUrgencyIndicator";
import LeadRevenueDetailWidget from "@/components/LeadRevenueDetailWidget";
import LeadMigrationTool from "@/components/LeadMigrationTool";
import ImportContactsModal from "@/components/leads/ImportContactsModal";
import { useRealtimeLeads } from "@/hooks/useRealtimeLeads";
import { useNavigate } from 'react-router-dom';

// Firestore collection name
const LEADS_COLLECTION = "leads";

const statusOptions = ["New", "Contacted", "Qualified", "Converted", "Unqualified"];
const filterOptions = ["All", ...statusOptions];

function Leads() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    name: "",
    email: "",
    phone: "",
    company: "",
    tags: "",
    notes: "",
    urgencyLevel: "",
    category: "",
    status: "New",
    score: 50,
    leadScore: 5,
    assignedTo: "",
    nextFollowUp: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.3 });
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.3 });
  const [aiScoring, setAiScoring] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const fuse = useRef(null);
  const navigate = useNavigate();

  // Use paginated realtime leads
  const { leads, loading: leadsLoading, error: leadsError, loadMore, hasMore, refreshLeads, manualReadLeads, liveMode, liveError, tryLiveMode } = useRealtimeLeads({ search, filter });

  // Metrics
  const metrics = {
    new: leads.filter(l => l.status === "New").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    converted: leads.filter(l => l.status === "Converted").length,
    total: leads.length,
    avgScore: leads.length ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) : 0,
  };

  // CRUD operations
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value !== undefined && value !== null ? String(value) : "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    if (!form.name || !form.email) {
      setError("Name and Email are required.");
      setLoading(false);
      return;
    }
    try {
      const safeForm = {
        name: form.name || "",
        email: form.email || "",
        phone: form.phone || "",
        source: form.source || "",
        status: form.status || "New",
        score: typeof form.score === "number" ? form.score : 50,
        assignedTo: form.assignedTo || "",
        nextFollowUp: form.nextFollowUp || "",
      };
      if (editingId) {
        const leadRef = doc(db, LEADS_COLLECTION, editingId);
        await updateDoc(leadRef, safeForm);
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, LEADS_COLLECTION), safeForm);
        if (!(docRef && docRef.id)) {
          setError("Failed to add new lead.");
        }
      }
      setForm({
        firstName: '',
        lastName: '',
        name: "",
        email: "",
        phone: "",
        company: "",
        tags: "",
        notes: "",
        urgencyLevel: "",
        category: "",
        status: "New",
        score: 50,
        leadScore: 5,
        assignedTo: "",
        nextFollowUp: "",
      });
      setError("");
    } catch (err) {
      setError("Failed to save lead: " + (err && err.message ? err.message : String(err)));
      console.error('[Leads] handleSubmit: Error saving lead:', err);
    }
    setLoading(false);
  };

  const handleEdit = lead => {
    setForm(lead);
    setEditingId(lead.id);
  };

  const handleDelete = async id => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, LEADS_COLLECTION, id));
      setError("");
    } catch (err) {
      setError("Failed to delete lead.");
    }
    setLoading(false);
    if (editingId === id) {
      setEditingId(null);
      setForm({
        firstName: '',
        lastName: '',
        name: "",
        email: "",
        phone: "",
        company: "",
        tags: "",
        notes: "",
        urgencyLevel: "",
        category: "",
        status: "New",
        score: 50,
        leadScore: 5,
        assignedTo: "",
        nextFollowUp: "",
      });
    }
  };

  // Smart fuzzy search & filter
  useEffect(() => {
    fuse.current = new Fuse(leads, {
      keys: ["name", "email", "phone", "source", "assignedTo"],
      threshold: 0.3,
    });
  }, [leads]);

  let filteredLeads = leads;
  if (search.trim() && fuse.current) {
    filteredLeads = fuse.current.search(search).map(r => r.item);
  }
  if (filter !== "All") {
    filteredLeads = filteredLeads.filter(l => l.status === filter);
  }

  // Export CSV
  function exportCsv() {
    const headers = ["name","email","phone","status","source","notes","createdAt","updatedAt"];
    const rows = [headers.join(",")].concat(
      leads.map(l => headers.map(h => l[h] || "").join(","))
    );
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const q = query(collection(db, 'contacts'));
    console.log('Querying contacts collection...');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('All contacts:', allDocs);
      console.log('Lead contacts:', allDocs.filter(d => d.category === 'lead' || d.category === 'Lead'));

      // Filter for leads
      const leadsData = allDocs.filter(doc => 
        doc.category === 'lead' || 
        doc.category === 'Lead' || 
        doc.category === 'leads'
      );
      setLeads(leadsData);
    });

    return () => unsubscribe();
  }, []);

  // Add debugging before rendering
  console.log('Rendering leads:', leads);
  console.log('Leads length:', leads.length);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative bg-white text-gray-900 bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200`}
      style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.12) 100%)',
        boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)',
        overflow: 'hidden',
        transition: 'background 0.5s, color 0.5s',
      }}
      aria-label="Lead Management"
    >
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Lead Management</h1>

        {/* Add New Lead Button */}
        <div className="mb-4 flex justify-end">
          <button 
            onClick={() => navigate('/add-client')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add New Contact
          </button>
        </div>

        {/* Smart Search & Filter - Glassmorphism */}
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
          <div className="flex gap-2 w-full md:w-1/2">
            <div className="relative w-full">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Smart Search..." className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Smart Search" />
              <FaSearch className="absolute right-3 top-3 text-blue-500" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-xl px-3 py-2 shadow" aria-label="Status Filter">
              {filterOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
          <button className="px-3 py-2 rounded-xl font-semibold border bg-green-600 text-white border-green-600 shadow-lg ml-2 flex items-center gap-2" onClick={() => { setRefreshing(true); playClick(); setTimeout(() => setRefreshing(false), 1000); }} aria-label="Refresh Data">
            <FaSyncAlt /> {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="px-3 py-2 rounded-xl font-semibold border bg-purple-600 text-white border-purple-600 shadow-lg ml-2 flex items-center gap-2" onClick={() => { setAiScoring(a => !a); playClick(); }} aria-label="AI Scoring">
            <FaRobot /> {aiScoring ? "AI Scoring On" : "AI Scoring"}
          </button>
          <button className="px-3 py-2 rounded-xl font-semibold border bg-blue-700 text-white border-blue-700 shadow-lg ml-2 flex items-center gap-2" onClick={() => setImportOpen(true)} aria-label="Import CSV">Import CSV</button>
          <button className="px-3 py-2 rounded-xl font-semibold border bg-gray-700 text-white border-gray-700 shadow-lg ml-2 flex items-center gap-2" onClick={exportCsv} aria-label="Export CSV">Export CSV</button>
          <button className="px-3 py-2 rounded-xl font-semibold border bg-gray-300 text-gray-800 border-gray-300 shadow-lg ml-2 flex items-center gap-2" onClick={() => { setSearch(""); setFilter("All"); }} aria-label="Clear">Clear</button>
        </div>

        {/* Lead Card Grid - Glassmorphism, BI, Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.length === 0 ? (
            <div>No leads found</div>
          ) : (
            leads.map(lead => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 32px #6366f1' }}
                transition={{ duration: 0.7 }}
                className={`relative bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl p-6 shadow-xl glassmorphism border border-gray-200 flex flex-col gap-2`}
                tabIndex={0}
                aria-label={`Lead card for ${lead.name}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-blue-700">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'}</span>
                  <LeadUrgencyIndicator score={lead.score} status={lead.status} />
                </div>
                <div className="text-sm text-gray-700 mb-1"><FaUserTie className="inline mr-1" /> {lead.email}</div>
                <div className="text-sm text-gray-700 mb-1">📞 {lead.phone}</div>
                <div className="text-xs text-gray-500 mb-1">Source: {lead.source}</div>
                <div className="flex gap-2 items-center mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.status === 'Converted' ? 'bg-green-500 text-white' : 'bg-blue-200 text-blue-800'}`}>{lead.status}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Score: {aiScoring ? Math.round(lead.score * 1.1 + 7) : lead.score}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Assigned: {lead.assignedTo}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Next Follow-Up: {lead.nextFollowUp}</div>
                {/* BI Widget */}
                <LeadRevenueDetailWidget lead={lead} />
                {/* Migration Tool (wow factor) */}
                <LeadMigrationTool lead={lead} />
                <div className="flex gap-2 mt-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded-xl text-xs shadow hover:bg-yellow-600 transition-all duration-200" onClick={() => handleEdit(lead)} aria-label="Edit Lead">Edit</button>
                  <button 
                    onClick={async () => {
                      console.log('Deleting lead:', lead.id, lead);
                      if (window.confirm(`Delete ${lead.name || lead.firstName + ' ' + lead.lastName || 'this lead'}?`)) {
                        try {
                          await deleteDoc(doc(db, 'contacts', lead.id));
                          console.log('Delete successful');
                          setLeads(leads.filter(l => l.id !== lead.id));
                        } catch (error) {
                          console.error('Delete failed:', error);
                        }
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-xl text-xs shadow hover:bg-red-600 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination: Load More */}
        {hasMore && (
          <div className="flex justify-center my-4">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-xl shadow" onClick={loadMore} disabled={!hasMore || loading}>Load More</button>
          </div>
        )}
        {/* Loading skeleton */}
        {loading && <div className="text-center text-gray-400 my-4">Loading...</div>}
        {/* Error alert */}
        {error && <div className="text-center text-red-600 my-4">{error}</div>}

        <ImportContactsModal open={importOpen} onClose={() => setImportOpen(false)} onSuccess={() => setImportOpen(false)} />
      </div>
    </motion.section>
  );
}

export default Leads;

