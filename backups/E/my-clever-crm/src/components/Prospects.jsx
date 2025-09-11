
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const statusOptions = ["Qualified", "Contacted", "Converted", "Nurturing", "Unqualified"];

function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Firestore real-time fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, "prospects"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProspects(data);
        setLoading(false);
      },
      (err) => {
        setError("Failed to fetch prospects.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    score: 50,
    status: "Qualified",
    probability: 50,
    nextFollowUp: "",
    timeline: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Metrics
  const metrics = {
    qualified: prospects.filter(p => p.status === "Qualified").length,
    contacted: prospects.filter(p => p.status === "Contacted").length,
    converted: prospects.filter(p => p.status === "Converted").length,
    nurturing: prospects.filter(p => p.status === "Nurturing").length,
    total: prospects.length,
  };

  // CRUD operations
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        const prospectRef = doc(db, "prospects", editingId);
        await updateDoc(prospectRef, { ...form });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "prospects"), {
          ...form,
          timeline: [{ date: new Date().toISOString().slice(0, 10), action: "Added as Prospect" }],
        });
      }
      setForm({ name: "", email: "", phone: "", score: 50, status: "Qualified", probability: 50, nextFollowUp: "", timeline: [] });
      setShowModal(false);
    } catch (err) {
      setError("Failed to save prospect.");
    }
  };

  const handleEdit = prospect => {
    setForm(prospect);
    setEditingId(prospect.id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    setError(null);
    try {
      await deleteDoc(doc(db, "prospects", id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ name: "", email: "", phone: "", score: 50, status: "Qualified", probability: 50, nextFollowUp: "", timeline: [] });
        setShowModal(false);
      }
    } catch (err) {
      setError("Failed to delete prospect.");
    }
  };

  // Filtering
  const filteredProspects = prospects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prospect Management</h1>
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading prospects...</div>
      )}
      {error && (
        <div className="text-center py-4 text-red-600">{error}</div>
      )}
      {/* Metrics Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-blue-700">Qualified</div>
            <div className="text-2xl font-bold">{metrics.qualified}</div>
          </div>
          <div className="bg-yellow-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-yellow-700">Contacted</div>
            <div className="text-2xl font-bold">{metrics.contacted}</div>
          </div>
          <div className="bg-green-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-green-700">Converted</div>
            <div className="text-2xl font-bold">{metrics.converted}</div>
          </div>
          <div className="bg-gray-100 rounded p-4 text-center">
            <div className="text-lg font-semibold text-gray-700">Nurturing</div>
            <div className="text-2xl font-bold">{metrics.nurturing}</div>
          </div>
        </div>
      )}

      {/* Search & Add Prospect */}
      <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="border rounded px-3 py-2 w-full md:w-1/3"
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: "", email: "", phone: "", score: 50, status: "Qualified", probability: 50, nextFollowUp: "", timeline: [] }); }}
        >
          Add Prospect
        </button>
      </div>

      {/* Prospect Table */}
      {!loading && !error && (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Score</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Probability</th>
                <th className="py-2 px-4 text-left">Next Follow-Up</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">No prospects found.</td>
                </tr>
              ) : (
                filteredProspects.map(prospect => (
                  <tr key={prospect.id} className="border-b">
                    <td className="py-2 px-4">{prospect.name}</td>
                    <td className="py-2 px-4">{prospect.email}</td>
                    <td className="py-2 px-4">{prospect.phone}</td>
                    <td className="py-2 px-4">{prospect.score}</td>
                    <td className="py-2 px-4">
                      <select
                        value={prospect.status}
                        onChange={async e => {
                          try {
                            await updateDoc(doc(db, "prospects", prospect.id), { ...prospect, status: e.target.value });
                          } catch {
                            setError("Failed to update status.");
                          }
                        }}
                        className="border rounded px-2 py-1"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4">{prospect.probability}%</td>
                    <td className="py-2 px-4">{prospect.nextFollowUp}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" onClick={() => handleEdit(prospect)}>Edit</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onClick={() => handleDelete(prospect.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Prospect */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Prospect" : "Add New Prospect"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-4">
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
                  type="number"
                  name="score"
                  value={form.score}
                  onChange={handleInputChange}
                  placeholder="Lead Score"
                  className="border rounded px-3 py-2 w-full"
                  min={0}
                  max={100}
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
                  name="probability"
                  value={form.probability}
                  onChange={handleInputChange}
                  placeholder="Conversion Probability (%)"
                  className="border rounded px-3 py-2 w-full"
                  min={0}
                  max={100}
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
                  {editingId ? "Update Prospect" : "Add Prospect"}
                </button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: "", email: "", phone: "", score: 50, status: "Qualified", probability: 50, nextFollowUp: "", timeline: [] }); }}>
                  Cancel
                </button>
              </div>
            </form>
            {/* Nurturing Timeline */}
            {form.timeline && form.timeline.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Nurturing Timeline</h3>
                <ul className="text-sm space-y-1">
                  {form.timeline.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item.date}: {item.action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Prospects;
