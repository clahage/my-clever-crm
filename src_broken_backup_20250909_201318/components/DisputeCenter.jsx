import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { demoDisputes } from "../data/demoData";
import jsPDF from "jspdf";

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState(demoDisputes);
  const [useDemo, setUseDemo] = useState(true);
  const [form, setForm] = useState({
    clientName: "",
    bureau: "Experian",
    type: "Credit Report Error",
    status: "Open",
    reason: "Incorrect info",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe = null;
    try {
      const q = query(collection(db, 'disputes'));
      unsubscribe = onSnapshot(q,
        (snapshot) => {
          const firebaseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDisputes(firebaseData.length ? firebaseData : demoDisputes);
          setUseDemo(firebaseData.length === 0);
        },
        (error) => {
          setDisputes(demoDisputes);
          setUseDemo(true);
        }
      );
    } catch (error) {
      setDisputes(demoDisputes);
      setUseDemo(true);
    }
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDispute = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newDispute = {
      ...form,
      dateCreated: new Date().toISOString().slice(0, 10),
      id: Math.random().toString(36).slice(2, 10),
    };
    try {
      if (!useDemo) {
        await addDoc(collection(db, 'disputes'), newDispute);
      }
      setDisputes([newDispute, ...disputes]);
      setForm({
        clientName: "",
        bureau: "Experian",
        type: "Credit Report Error",
        status: "Open",
        reason: "Incorrect info",
        notes: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Disputes Export", 10, 10);
    disputes.forEach((d, i) => {
      doc.text(
        `${i + 1}. ${d.clientName} | ${d.bureau} | ${d.type} | ${d.status} | ${d.dateCreated}`,
        10,
        20 + i * 10
      );
    });
    doc.save("disputes.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-2">Dispute Center</h1>
      {/* Dispute Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-blue-700">Open</div>
          <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "Open").length}</div>
        </div>
        <div className="bg-green-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-green-700">Resolved</div>
          <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "Resolved").length}</div>
        </div>
        <div className="bg-yellow-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-yellow-700">In Progress</div>
          <div className="text-2xl font-bold">{disputes.filter((d) => d.status === "In Progress").length}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-gray-700">Total</div>
          <div className="text-2xl font-bold">{disputes.length}</div>
        </div>
      </div>
      {/* Add Dispute Form */}
      <form onSubmit={handleAddDispute} className="bg-gray-50 rounded p-4 mb-6 space-y-2">
        <div className="flex flex-col md:flex-row gap-2">
          <input name="clientName" value={form.clientName} onChange={handleChange} required placeholder="Client Name" className="border p-2 rounded flex-1" />
          <select name="bureau" value={form.bureau} onChange={handleChange} className="border p-2 rounded">
            <option>Experian</option>
            <option>Equifax</option>
            <option>TransUnion</option>
          </select>
          <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
            <option>Credit Report Error</option>
            <option>Identity Theft</option>
            <option>Other</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded">
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <input name="reason" value={form.reason} onChange={handleChange} required placeholder="Reason Code/Description" className="border p-2 rounded flex-1" />
          <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="border p-2 rounded flex-1" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>
          {loading ? "Adding..." : "Add Dispute"}
        </button>
        <button type="button" className="ml-2 bg-gray-200 px-4 py-2 rounded" onClick={exportPDF}>
          Export PDF
        </button>
      </form>
      {/* Dispute List Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Client</th>
              <th className="py-2 px-4 text-left">Bureau</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Date Created</th>
              <th className="py-2 px-4 text-left">Reason</th>
              <th className="py-2 px-4 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr key={dispute.id} className="border-b">
                  <td className="py-2 px-4">{dispute.clientName}</td>
                  <td className="py-2 px-4">{dispute.bureau}</td>
                  <td className="py-2 px-4">{dispute.type}</td>
                  <td className="py-2 px-4">{dispute.status}</td>
                  <td className="py-2 px-4">{dispute.dateCreated}</td>
                  <td className="py-2 px-4">{dispute.reason}</td>
                  <td className="py-2 px-4">{dispute.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}