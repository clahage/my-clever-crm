// Platform-specific requirements
const platformRequirements = {
  Yelp: {
    required: ['businessName', 'reviewUrl'],
    helperText: 'Yelp requires business name and review URL for response tracking.'
  },
  'Google My Business': {
    required: ['businessName', 'reviewUrl'],
    helperText: 'Google My Business requires business name and review URL.'
  },
  Facebook: {
    required: ['pageUrl', 'profileUrl'],
    helperText: 'Facebook requires page or profile URL.'
  },
  LinkedIn: {
    required: ['profileUrl', 'companyUrl'],
    helperText: 'LinkedIn requires profile or company URL.'
  },
  'AI Receptionist': {
    required: ['callDuration', 'callRecordingUrl'],
    helperText: 'AI Receptionist requires call duration and recording URL.'
  },
  Website: {
    required: ['formName', 'pageUrl'],
    helperText: 'Website requires form name and page URL.'
  },
  Affiliate: {
    required: ['affiliateName', 'referralCode'],
    helperText: 'Affiliate requires affiliate name and referral code.'
  }
};
// Platform-specific validation
function validatePlatformFields(formData) {
  const req = platformRequirements[formData.source];
  if (!req) return {};
  const errors = {};
  req.required.forEach(field => {
    if (!formData[field]) errors[field] = true;
  });
  return errors;
}
import React, { useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const AddLeadModal = ({ isOpen, onClose, onSave }) => {
  const LEAD_SOURCES = [
    'AI Receptionist', 'Website Form', 'Affiliate Link', 'Yelp', 'Google My Business', 'Facebook', 'LinkedIn', 'Live Call', 'Walk-in', 'Referral', 'Email Inquiry'
  ];
  const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
  const TIMELINE_OPTIONS = ['Immediate', '1-2 weeks', '1 month', '3+ months', 'Undecided'];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: LEAD_SOURCES[0],
    status: 'New',
    notes: '',
    platformResponseTime: '',
    conversationNotes: '',
    leadScore: '',
    urgencyLevel: URGENCY_LEVELS[0],
    budgetMentioned: '',
    timeline: TIMELINE_OPTIONS[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [platformFieldErrors, setPlatformFieldErrors] = useState({});
  const [activeTab, setActiveTab] = useState('single');
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [duplicateModal, setDuplicateModal] = useState(null);
  const [potentialDuplicate, setPotentialDuplicate] = useState(null);
  const fileInputRef = useRef();

  // Duplicate detection (Prompt #10)
  const checkDuplicate = async (contact) => {
    // Query Firestore for similar name, email, or phone
    // For demo: simulate with empty result (replace with Firestore query in production)
    // TODO: Replace with actual Firestore query for contacts
    return null;
  };

  // Bulk Import CSV parsing (Prompt #9)
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const rows = text.split(/\r?\n/).filter(r => r.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      const dataRows = rows.slice(1).map(row => {
        const cols = row.split(',');
        let obj = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i] || '';
        });
        return obj;
      });
      setCsvPreview(dataRows.slice(0, 5));
      setCsvRows(dataRows);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    setLoading(true);
    setImportProgress(0);
    let imported = 0;
    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      // Map CSV columns to Firestore contact fields
      const contactData = {
        firstName: row.name?.split(' ')[0] || '',
        lastName: row.name?.split(' ').slice(1).join(' ') || '',
        email: row.email || '',
        phone: row.phone || '',
        source: row.leadSource || '',
        businessListing: row.businessListing || '',
        profileUrl: row.profileUrl || '',
        notes: row.notes || '',
        createdAt: new Date().toISOString(),
        status: 'New',
      };
      // TODO: Add duplicate detection here if needed
      await addDoc(collection(db, 'contacts'), contactData);
      imported++;
      setImportProgress(Math.round((imported / csvRows.length) * 100));
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1500);
  };
    if (!formData.firstName || !formData.lastName || !formData.email) return 'Name and Email are required.';
    if (!formData.source) return 'Lead Source is required.';
    if (!formData.urgencyLevel) return 'Urgency Level is required.';
    if (!formData.leadScore) return 'Lead Score is required.';
    if (!formData.timeline) return 'Timeline is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    const platformErrs = validatePlatformFields(formData);
    setPlatformFieldErrors(platformErrs);
    if (err) { setError(err); return; }
    if (Object.keys(platformErrs).length > 0) {
      setError('Missing required platform-specific fields.');
      return;
    }
    setLoading(true);
    // Duplicate detection
    const duplicate = await checkDuplicate(formData);
    if (duplicate) {
      setPotentialDuplicate(duplicate);
      setDuplicateModal(true);
      setLoading(false);
      return;
    }
    try {
      const contactData = { ...formData, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'contacts'), contactData);
      // ...removed for production...
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: LEAD_SOURCES[0],
        status: 'New',
        notes: '',
        platformResponseTime: '',
        conversationNotes: '',
        leadScore: '',
        urgencyLevel: URGENCY_LEVELS[0],
        budgetMentioned: '',
        timeline: TIMELINE_OPTIONS[0]
      });
      if (onSave) onSave({ id: docRef.id, ...contactData });
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
        <div className="flex space-x-4 mb-4">
          <button className={`px-3 py-1 rounded ${activeTab === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('single')}>Single Add</button>
          <button className={`px-3 py-1 rounded ${activeTab === 'bulk' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setActiveTab('bulk')}>Bulk Import</button>
        </div>
        {activeTab === 'single' && (
          <form onSubmit={handleSubmit}>
            {loading && <div className="text-blue-600 font-semibold mb-2">Saving contact...</div>}
            {error && <div className="text-red-600 font-semibold mb-2">{error}</div>}
            <div className="space-y-4">
              {/* ...existing code... (all single add fields) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={`mt-1 block w-full border rounded-md px-3 py-2 ${platformFieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={`mt-1 block w-full border rounded-md px-3 py-2 ${platformFieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`mt-1 block w-full border rounded-md px-3 py-2 ${platformFieldErrors.email ? 'border-red-500' : 'border-gray-300'}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={`mt-1 block w-full border rounded-md px-3 py-2 ${platformFieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                  {LEAD_SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
                {platformRequirements[formData.source] && (
                  <div className="text-xs text-gray-500 mt-1">{platformRequirements[formData.source].helperText}</div>
                )}
              </div>
              {/* Platform-specific fields */}
              {platformRequirements[formData.source]?.required?.map(field => (
                <div key={field} className="relative">
                  <label className="block text-sm font-medium text-gray-700">{field}
                    <span className="ml-1 text-xs text-gray-400" title={platformRequirements[formData.source].helperText}>?</span>
                  </label>
                  <input type="text" value={formData[field] || ''} onChange={e => setFormData({ ...formData, [field]: e.target.value })} className={`mt-1 block w-full border rounded-md px-3 py-2 ${platformFieldErrors[field] ? 'border-red-500' : 'border-gray-300'}`} />
                  {platformFieldErrors[field] && <div className="text-xs text-red-500">Required for {formData.source}</div>}
                </div>
              ))}
              {/* ...rest of fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Platform Response Time (min)</label>
                <input type="number" value={formData.platformResponseTime} onChange={e => setFormData({ ...formData, platformResponseTime: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" min="0" placeholder="Auto-calculated if possible" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conversation Notes</label>
                <textarea value={formData.conversationNotes} onChange={e => setFormData({ ...formData, conversationNotes: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" rows={3} placeholder="Detailed conversation context" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lead Score (1-10)</label>
                <input type="number" value={formData.leadScore} onChange={e => setFormData({ ...formData, leadScore: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" min="1" max="10" placeholder="AI suggestion supported" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                <select value={formData.urgencyLevel} onChange={e => setFormData({ ...formData, urgencyLevel: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                  {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Mentioned</label>
                <input type="text" value={formData.budgetMentioned} onChange={e => setFormData({ ...formData, budgetMentioned: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Budget discussions" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timeline</label>
                <select value={formData.timeline} onChange={e => setFormData({ ...formData, timeline: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                  {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">General Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" rows={2} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading || Object.keys(platformFieldErrors).length > 0}>{loading ? 'Saving...' : 'Add Lead'}</button>
            </div>
            {success && <div className="text-green-600 font-semibold mt-4">Contact saved!</div>}
          </form>
        )}
        {activeTab === 'bulk' && (
          <div>
            <div className="mb-4">
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvUpload} className="block" />
            </div>
            {csvPreview.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold mb-2">Preview (first 5 rows):</div>
                <table className="w-full text-sm border">
                  <thead>
                    <tr>
                      {Object.keys(csvPreview[0]).map(h => <th key={h} className="border px-2 py-1">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => <td key={j} className="border px-2 py-1">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {csvRows.length > 0 && (
              <div className="mb-4">
                <button onClick={handleBulkImport} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" disabled={loading}>Import {csvRows.length} Contacts</button>
                {loading && <div className="mt-2 text-blue-600">Importing... {importProgress}%</div>}
                {success && <div className="text-green-600 font-semibold mt-2">Bulk import complete!</div>}
              </div>
            )}
          </div>
        )}
        {/* Duplicate Modal (Prompt #10) */}
        {duplicateModal && potentialDuplicate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-2">Potential Duplicate Found</h3>
              <div className="mb-2">A contact with similar name, email, or phone exists.</div>
              <div className="mb-4">
                {/* Highlight matching fields */}
                <div className="mb-2"><span className="font-semibold">Existing:</span> {JSON.stringify(potentialDuplicate)}</div>
                <div className="mb-2"><span className="font-semibold">New:</span> {JSON.stringify(formData)}</div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => { setDuplicateModal(false); }}>Cancel</button>
                <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={async () => { setDuplicateModal(false); await handleSubmit({ preventDefault: () => {} }); }}>Create New Anyway</button>
                <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={async () => { /* Merge logic here */ setDuplicateModal(false); }}>Merge</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
export default AddLeadModal;
