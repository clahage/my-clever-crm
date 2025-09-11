import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import Fuse from "fuse.js";
import useSound from "use-sound";
import { FaUserTie, FaSearch, FaSyncAlt, FaRobot, FaStar, FaUsers } from "react-icons/fa";
import LeadUrgencyIndicator from "@/components/LeadUrgencyIndicator";
import LeadRevenueDetailWidget from "@/components/LeadRevenueDetailWidget";
import LeadMigrationTool from "@/components/LeadMigrationTool";

// Firestore collection name
const LEADS_COLLECTION = "leads";

const statusOptions = ["New", "Contacted", "Qualified", "Converted", "Unqualified"];
const filterOptions = ["All", ...statusOptions];

function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "New",
    score: 50,
    assignedTo: "",
    nextFollowUp: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [playClick] = useSound("/sounds/click.mp3", { volume: 0.3 });
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.3 });
  const [aiScoring, setAiScoring] = useState(false);
  const [collaborators, setCollaborators] = useState(["Chris", "Alex"]);
  const fuse = useRef(null);

  // Real-time Firestore sync
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, LEADS_COLLECTION), snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
      setLoading(false);
    }, _e => {
      setError("Failed to load leads.");
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
        setLeads(leads.map(l => l.id === editingId ? { ...safeForm, id: editingId } : l));
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, LEADS_COLLECTION), safeForm);
        setLeads([...leads, { ...safeForm, id: docRef.id }]);
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "New",
        score: 50,
        assignedTo: "",
        nextFollowUp: "",
      });
      setError("");
    } catch (err) {
      setError("Failed to save lead.");
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
      setLeads(leads.filter(l => l.id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete lead.");
    }
    setLoading(false);
    if (editingId === id) {
      setEditingId(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "New",
        score: 50,
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 w-full max-w-7xl mx-auto border border-gray-200`}
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #222 0%, #333 100%)'
          : 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.12) 100%)',
        boxShadow: darkMode
          ? '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)'
          : '0 8px 32px rgba(37,99,235,0.12), 0 1.5px 8px rgba(16,185,129,0.08)',
        overflow: 'hidden',
        transition: 'background 0.5s, color 0.5s',
      }}
      aria-label="Lead Management"
    >
      {/* Particle Animation */}
      <Particles options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          color: { value: darkMode ? '#6366f1' : '#2563eb' },
          links: { enable: true, color: darkMode ? '#6366f1' : '#2563eb', distance: 120 },
          move: { enable: true, speed: 1, direction: 'none', outModes: 'bounce' },
          number: { value: 18 },
          opacity: { value: 0.3 },
          shape: { type: 'circle' },
          size: { value: { min: 2, max: 6 } },
        },
        detectRetina: true,
      }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Dark Mode Toggle */}
      <button
        className="absolute top-4 left-4 z-30 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-blue-100 dark:hover:bg-gray-700 transition"
        onClick={() => setDarkMode(dm => !dm)}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? <FaStar className="h-5 w-5 text-yellow-400" /> : <FaStar className="h-5 w-5 text-blue-600" />}
      </button>

      {/* Collaborators (real-time presence) */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        {collaborators.map((c, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white shadow text-xs font-bold animate-pulse"><FaUsers /> {c}</span>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">Lead Management <FaUserTie className="text-blue-500" /></h1>

      {/* Metrics Cards - Glassmorphism */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl p-4 shadow-lg">
          <div className="text-lg font-bold dark:text-white">New</div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-2xl dark:text-gray-100">{metrics.new}</motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-gradient-to-r from-green-500 to-purple-500 text-white rounded-xl p-4 shadow-lg">
          <div className="text-lg font-bold dark:text-white">Contacted</div>
          <div className="text-2xl dark:text-gray-100">{metrics.contacted}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-4 shadow-lg">
          <div className="text-lg font-bold dark:text-white">Qualified</div>
          <div className="text-2xl dark:text-gray-100">{metrics.qualified}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 shadow-lg">
          <div className="text-lg font-bold dark:text-white">Converted</div>
          <div className="text-2xl dark:text-gray-100">{metrics.converted}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl p-4 shadow-lg">
          <div className="text-lg font-bold dark:text-white">Avg. Score</div>
          <div className="text-2xl dark:text-gray-100">{metrics.avgScore}</div>
        </motion.div>
      </div>

      {/* Lead Capture Form - Glassmorphism */}
      <motion.form className="bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-gray-200" onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">{editingId ? "Edit Lead" : "Add New Lead"} <FaRobot className="text-green-500" /></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="block mb-1 font-semibold" htmlFor="lead-name">Name *</label>
          <input id="lead-name" type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Full Name" className="border rounded-xl px-3 py-2 w-full shadow" required aria-label="Lead Name" />
          <label className="block mb-1 font-semibold" htmlFor="lead-email">Email *</label>
          <input id="lead-email" type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email Address" className="border rounded-xl px-3 py-2 w-full shadow" required aria-label="Lead Email" />
          <label className="block mb-1 font-semibold" htmlFor="lead-phone">Phone</label>
          <input id="lead-phone" type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone Number" className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Lead Phone" />
          <label className="block mb-1 font-semibold" htmlFor="lead-source">Source</label>
          <input id="lead-source" type="text" name="source" value={form.source} onChange={handleInputChange} placeholder="Lead Source (e.g. Website, Referral)" className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Lead Source" />
          <label className="block mb-1 font-semibold" htmlFor="lead-status">Status</label>
          <select id="lead-status" name="status" value={form.status} onChange={handleInputChange} className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Lead Status">
            {statusOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
          </select>
          <label className="block mb-1 font-semibold" htmlFor="lead-score">Score</label>
          <input id="lead-score" type="number" name="score" value={form.score} onChange={handleInputChange} placeholder="Lead Score (0-100)" className="border rounded-xl px-3 py-2 w-full shadow" min={0} max={100} aria-label="Lead Score" />
          <label className="block mb-1 font-semibold" htmlFor="lead-assigned">Assigned To</label>
          <input id="lead-assigned" type="text" name="assignedTo" value={form.assignedTo} onChange={handleInputChange} placeholder="Assigned To (user)" className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Assigned To" />
          <label className="block mb-1 font-semibold" htmlFor="lead-followup">Next Follow Up</label>
          <input id="lead-followup" type="date" name="nextFollowUp" value={form.nextFollowUp} onChange={handleInputChange} className="border rounded-xl px-3 py-2 w-full shadow" aria-label="Next Follow Up" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition-all duration-200" aria-label={editingId ? "Update Lead" : "Add Lead"}>
            {editingId ? "Update Lead" : "Add Lead"}
          </button>
          {editingId && (
            <button type="button" className="bg-gray-300 px-4 py-2 rounded-xl shadow" onClick={() => { setEditingId(null); setForm({ name: "", email: "", phone: "", source: "", status: "New", score: 50, assignedTo: "", nextFollowUp: "" }); }} aria-label="Cancel Edit">Cancel</button>
          )}
        </div>
        {error && <div className="text-red-600 mt-2 font-semibold">{error}</div>}
      </motion.form>

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
      </div>

      {/* Lead Card Grid - Glassmorphism, BI, Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="col-span-full text-center py-8 text-gray-500 bg-white bg-opacity-60 rounded-2xl shadow-xl">
            No leads found.
          </motion.div>
        ) : (
          filteredLeads.map(lead => (
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
                <span className="font-bold text-lg text-blue-700 dark:text-white">{lead.name}</span>
                <LeadUrgencyIndicator score={lead.score} status={lead.status} />
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mb-1"><FaUserTie className="inline mr-1" /> {lead.email}</div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">📞 {lead.phone}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Source: {lead.source}</div>
              <div className="flex gap-2 items-center mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.status === 'Converted' ? 'bg-green-500 text-white' : 'bg-blue-200 text-blue-800'}`}>{lead.status}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Score: {aiScoring ? Math.round(lead.score * 1.1 + 7) : lead.score}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Assigned: {lead.assignedTo}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">Next Follow-Up: {lead.nextFollowUp}</div>
              {/* BI Widget */}
              <LeadRevenueDetailWidget lead={lead} />
              {/* Migration Tool (wow factor) */}
              <LeadMigrationTool lead={lead} />
              <div className="flex gap-2 mt-2">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded-xl text-xs shadow hover:bg-yellow-600 transition-all duration-200" onClick={() => handleEdit(lead)} aria-label="Edit Lead">Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded-xl text-xs shadow hover:bg-red-600 transition-all duration-200" onClick={() => handleDelete(lead.id)} aria-label="Delete Lead">Delete</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  );
}

export default Leads;
