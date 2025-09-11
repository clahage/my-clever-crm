
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Firestore collection name
const LEADS_COLLECTION = "leads";

const statusOptions = ["New", "Contacted", "Qualified", "Converted", "Unqualified"];

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

  // Fetch leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, LEADS_COLLECTION));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(data);
      } catch (err) {
        setError("Failed to load leads.");
      }
      setLoading(false);
    };
    fetchLeads();
  }, []);

  // Metrics
  const metrics = {
    new: leads.filter(l => l.status === "New").length,
    contacted: leads.filter(l => l.status === "Contacted").length,
    qualified: leads.filter(l => l.status === "Qualified").length,
    converted: leads.filter(l => l.status === "Converted").length,
    total: leads.length,
  };

  // CRUD operations
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const leadRef = doc(db, LEADS_COLLECTION, editingId);
        await updateDoc(leadRef, form);
        setLeads(leads.map(l => l.id === editingId ? { ...form, id: editingId } : l));
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, LEADS_COLLECTION), form);
        setLeads([...leads, { ...form, id: docRef.id }]);
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

  // Filtering
  const filteredLeads = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  return (
    <div className="p-6">
      {loading && <div className="text-blue-600 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <h1 className="text-2xl font-bold mb-4">Lead Management</h1>
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-blue-700">New</div>
          <div className="text-2xl font-bold">{metrics.new}</div>
        </div>
        <div className="bg-yellow-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-yellow-700">Contacted</div>
          <div className="text-2xl font-bold">{metrics.contacted}</div>
        </div>
        <div className="bg-green-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-green-700">Qualified</div>
          <div className="text-2xl font-bold">{metrics.qualified}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-gray-700">Converted</div>
          <div className="text-2xl font-bold">{metrics.converted}</div>
        </div>
      </div>

      {/* Lead Capture Form */}
      <form className="bg-white rounded shadow p-6 mb-8" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Lead" : "Add New Lead"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="border rounded px-3 py-2 w-full"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="border rounded px-3 py-2 w-full"
            required
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="text"
            name="source"
            value={form.source}
            onChange={handleInputChange}
            placeholder="Lead Source"
            className="border rounded px-3 py-2 w-full"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="number"
            name="score"
            value={form.score}
            onChange={handleInputChange}
            placeholder="Lead Score"
            className="border rounded px-3 py-2 w-full"
            min={0}
            max={100}
          />
          <input
            type="text"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleInputChange}
            placeholder="Assigned To"
            className="border rounded px-3 py-2 w-full"
          />
          <input
            type="date"
            name="nextFollowUp"
            value={form.nextFollowUp}
            onChange={handleInputChange}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? "Update Lead" : "Add Lead"}
          </button>
          {editingId && (
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setEditingId(null); setForm({ name: "", email: "", phone: "", source: "", status: "New", score: 50, assignedTo: "", nextFollowUp: "" }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="border rounded px-3 py-2 w-full md:w-1/3"
        />
      </div>

      {/* Lead Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Source</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Score</th>
              <th className="py-2 px-4 text-left">Assigned To</th>
              <th className="py-2 px-4 text-left">Next Follow-Up</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">No leads found.</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id} className="border-b">
                  <td className="py-2 px-4">{lead.name}</td>
                  <td className="py-2 px-4">{lead.email}</td>
                  <td className="py-2 px-4">{lead.phone}</td>
                  <td className="py-2 px-4">{lead.source}</td>
                  <td className="py-2 px-4">
                    <select
                      value={lead.status}
                      onChange={e => setLeads(leads.map(l => l.id === lead.id ? { ...l, status: e.target.value } : l))}
                      className="border rounded px-2 py-1"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4">{lead.score}</td>
                  <td className="py-2 px-4">{lead.assignedTo}</td>
                  <td className="py-2 px-4">{lead.nextFollowUp}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" onClick={() => handleEdit(lead)}>Edit</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onClick={() => handleDelete(lead.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leads;
