import React from 'react';

const ContactTimelineModal = ({ isOpen, onClose, timeline }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Contact Activity Timeline</h2>
        <div className="mb-4">
          {timeline.length === 0 ? (
            <div className="text-gray-500">No activity found.</div>
          ) : (
            <ul className="timeline">
              {timeline.map((event, idx) => (
                <li key={idx} className="mb-2">
                  <div className="font-semibold">{event.type}</div>
                  <div className="text-xs text-gray-600">{event.timestamp}</div>
                  <div className="text-sm text-gray-800">{event.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ContactTimelineModal;
