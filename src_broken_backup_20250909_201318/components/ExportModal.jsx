import React, { useState } from 'react';

const ExportModal = ({ isOpen, onClose, contacts, fields, onExport }) => {
  const [selectedFields, setSelectedFields] = useState(fields);

  const handleFieldToggle = (field) => {
    setSelectedFields(f => f.includes(field) ? f.filter(x => x !== field) : [...f, field]);
  };

  const handleExport = () => {
    const exportContacts = contacts.map(c => {
      const obj = {};
      selectedFields.forEach(f => obj[f] = c[f]);
      return obj;
    });
    onExport(exportContacts, selectedFields);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Export Contacts</h2>
        <div className="mb-4">
          <div className="font-semibold mb-2">Select Fields:</div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map(f => (
              <label key={f} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedFields.includes(f)} onChange={() => handleFieldToggle(f)} />
                <span>{f}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleExport}>Export</button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
