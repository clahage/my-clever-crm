import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { subscribeToDisputes, updateDispute, getStatusOptions, exportDisputeReports } from '../../services/disputeService';
import { disputeStatusColors } from '../../utils/disputeUtils';

const PAGE_SIZE = 10;

export default function ActiveDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDisputes(
      data => {
        setDisputes(data.filter(d => d.status !== 'Resolved'));
        setLoading(false);
      },
      err => {
        setError(err.message || 'Failed to load disputes');
        setLoading(false);
      }
    );
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    let result = disputes.filter(d =>
      d.clientName.toLowerCase().includes(search.toLowerCase()) ||
      d.bureau.toLowerCase().includes(search.toLowerCase()) ||
      d.status.toLowerCase().includes(search.toLowerCase())
    );
    result = result.sort((a, b) => {
      if (sortDir === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    setFiltered(result);
    setPage(1);
  }, [disputes, search, sortBy, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleStatusChange = async (id, status) => {
    try {
      await updateDispute(id, { status });
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleBulkStatusUpdate = async () => {
    for (const id of selected) {
      await handleStatusChange(id, bulkStatus);
    }
    setBulkStatus('');
    setSelected([]);
  };

  const handleExport = async () => {
    try {
      await exportDisputeReports(disputes.filter(d => selected.includes(d.id)));
      alert('Exported selected disputes!');
    } catch (err) {
      setError('Failed to export disputes');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Active Disputes</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by client, bureau, or status..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold" onClick={handleExport} disabled={selected.length === 0}>
            Export Selected
          </button>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="border px-2 py-1 rounded">
            <option value="">Bulk Status Update</option>
            {getStatusOptions().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 font-semibold" onClick={handleBulkStatusUpdate} disabled={!bulkStatus || selected.length === 0}>
            Update Selected
          </button>
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse bg-gray-100 rounded h-32 w-full mb-4" />
      ) : error ? (
        <div className="text-red-500 font-semibold mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left"><input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={e => setSelected(e.target.checked ? paginated.map(d => d.id) : [])} /></th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('clientName')}>Client Name</th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('bureau')}>Bureau</th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('disputeType')}>Dispute Type</th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('status')}>Status</th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('dateCreated')}>Date Created</th>
                <th className="py-2 px-4 text-left cursor-pointer" onClick={() => setSortBy('priority')}>Priority</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(dispute => (
                <tr key={dispute.id} className="border-b">
                  <td className="py-2 px-4"><input type="checkbox" checked={selected.includes(dispute.id)} onChange={e => setSelected(e.target.checked ? [...selected, dispute.id] : selected.filter(id => id !== dispute.id))} /></td>
                  <td className="py-2 px-4 font-semibold">{dispute.clientName}</td>
                  <td className="py-2 px-4">{dispute.bureau}</td>
                  <td className="py-2 px-4">{dispute.disputeType}</td>
                  <td className={`py-2 px-4`}><span className={`px-2 py-1 rounded text-xs font-bold ${disputeStatusColors[dispute.status] || 'bg-gray-100 text-gray-700'}`}>{dispute.status}</span></td>
                  <td className="py-2 px-4">{new Date(dispute.dateCreated).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${dispute.priority === 'High' ? 'bg-red-100 text-red-700' : dispute.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{dispute.priority}</span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600" onClick={() => alert('View Details')}>View</button>
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" onClick={() => alert('Edit')}>Edit</button>
                    <button className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600" onClick={() => alert('Send Letter')}>Send Letter</button>
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600" onClick={() => handleStatusChange(dispute.id, 'Resolved')}>Mark Complete</button>
                    <select value={dispute.status} onChange={e => handleStatusChange(dispute.id, e.target.value)} className="border px-2 py-1 rounded text-xs">
                      {getStatusOptions().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button className="px-3 py-1 rounded bg-gray-200" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span className="font-semibold">Page {page} of {totalPages}</span>
          <button className="px-3 py-1 rounded bg-gray-200" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

ActiveDisputes.propTypes = {
  // No props for now, but ready for future extension
};
