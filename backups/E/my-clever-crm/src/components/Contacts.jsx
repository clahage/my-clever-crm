
import React, { useState } from "react";

// Sample client data
const initialClients = [
  {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "555-1111",
    status: "Active",
    notes: "Top client."
  },
  {
    id: 2,
    name: "Beta LLC",
    email: "info@beta.com",
    phone: "555-2222",
    status: "Inactive",
    notes: "Follow up next quarter."
  },
];

const statusOptions = ["Active", "Inactive", "Prospect", "Lead"];

function Contacts() {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Statistics
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "Active").length,
    inactive: clients.filter(c => c.status === "Inactive").length,
    prospects: clients.filter(c => c.status === "Prospect").length,
    leads: clients.filter(c => c.status === "Lead").length,
  };

  // CRUD operations
  const handleInputChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (editingId) {
      setClients(clients.map(c => c.id === editingId ? { ...form, id: editingId } : c));
      setEditingId(null);
    } else {
      setClients([
        ...clients,
        { ...form, id: Date.now() },
      ]);
    }
    setForm({ name: "", email: "", phone: "", status: "Active", notes: "" });
    setShowModal(false);
  };

  const handleEdit = client => {
    setForm(client);
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = id => {
    setClients(clients.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", email: "", phone: "", status: "Active", notes: "" });
      setShowModal(false);
    }
  };

  // Filtering
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Management</h1>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-blue-700">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-green-700">Active</div>
          <div className="text-2xl font-bold">{stats.active}</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-gray-700">Inactive</div>
          <div className="text-2xl font-bold">{stats.inactive}</div>
        </div>
        <div className="bg-yellow-100 rounded p-4 text-center">
          <div className="text-lg font-semibold text-yellow-700">Prospects</div>
          <div className="text-2xl font-bold">{stats.prospects}</div>
        </div>
      </div>

      {/* Search & Add Client */}
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
          onClick={() => { setShowModal(true); setEditingId(null); setForm({ name: "", email: "", phone: "", status: "Active", notes: "" }); }}
        >
          Add Client
        </button>
      </div>

      {/* Client Table */}
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Notes</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No clients found.</td>
              </tr>
            ) : (
              paginatedClients.map(client => (
                <tr key={client.id} className="border-b">
                  <td className="py-2 px-4">{client.name}</td>
                  <td className="py-2 px-4">{client.email}</td>
                  <td className="py-2 px-4">{client.phone}</td>
                  <td className="py-2 px-4">
                    <select
                      value={client.status}
                      onChange={e => setClients(clients.map(c => c.id === client.id ? { ...c, status: e.target.value } : c))}
                      className="border rounded px-2 py-1"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-4">{client.notes}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-6">
          <button
            className="px-3 py-1 rounded bg-gray-200"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>
          <span className="font-semibold">Page {currentPage} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for Add/Edit Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Client" : "Add New Client"}</h2>
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
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="Notes"
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingId ? "Update Client" : "Add Client"}
                </button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => { setShowModal(false); setEditingId(null); setForm({ name: "", email: "", phone: "", status: "Active", notes: "" }); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;
