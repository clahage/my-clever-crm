import React, { useState , useEffect, useRef } from "react";

import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { demoClients } from "../data/demoData";

export default function Clients() {
  const [clients, setClients] = useState(demoClients);
  const [useDemo, setUseDemo] = useState(true);
  // Firebase listener with fallback to demo data
  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'clients'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setClients(firebaseData);
          setUseDemo(false);
        },
        (error) => {
          console.warn('Firebase failed, using demo data:', error);
          setClients(demoClients);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setClients(demoClients);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "Active", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Real CRUD functions
  const handleSubmit = async e => {
    e.preventDefault();
    if (useDemo) {
      if (editingId) {
        setClients(clients.map(c => c.id === editingId ? { ...form, id: editingId } : c));
        setEditingId(null);
      } else {
        setClients([...clients, { ...form, id: Date.now() }]);
      }
    } else {
      try {
        if (editingId) {
          await updateDoc(doc(db, 'clients', editingId), { ...form });
          setEditingId(null);
        } else {
          await addDoc(collection(db, 'clients'), { ...form });
        }
      } catch (error) {
        console.error('Firebase CRUD error:', error);
      }
    }
    setForm({ name: "", email: "", phone: "", status: "Active", notes: "" });
    setShowModal(false);
  };

  const handleEdit = client => {
    setForm(client);
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (useDemo) {
      setClients(clients.filter(c => c.id !== id));
    } else {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (error) {
        console.error('Firebase delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Clients</h1>
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone..." className="border rounded px-3 py-2 w-full md:w-1/3" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: "", email: "", phone: "", status: "Active", notes: "" }); }}>Add Client</button>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No clients found.</td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="border-b">
                    <td className="py-2 px-4">{client.name}</td>
                    <td className="py-2 px-4">{client.email}</td>
                    <td className="py-2 px-4">{client.phone}</td>
                    <td className="py-2 px-4">{client.status}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" onClick={() => handleEdit(client)}>Edit</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600" onClick={() => handleDelete(client.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-8 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Client" : "Add New Client"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Name" className="border rounded px-3 py-2 w-full" required />
                  <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email" className="border rounded px-3 py-2 w-full" required />
                  <input type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone" className="border rounded px-3 py-2 w-full" required />
                  <select name="status" value={form.status} onChange={handleInputChange} className="border rounded px-3 py-2 w-full">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <textarea name="notes" value={form.notes} onChange={handleInputChange} placeholder="Notes" className="border rounded px-3 py-2 w-full" rows={3} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{editingId ? "Update Client" : "Add Client"}</button>
                  <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: "", email: "", phone: "", status: "Active", notes: "" }); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
