import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, sendNotification } = useNotification();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Urgent Notifications</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="p-4 overflow-y-auto h-full">
        {notifications.length === 0 ? (
          <div className="text-gray-500">No urgent contacts.</div>
        ) : (
          notifications.map(contact => {
            const timeLeft = contact.responseRequiredBy ? Math.max(0, Math.floor((new Date(contact.responseRequiredBy) - now) / 1000)) : null;
            return (
              <div key={contact.id} className="mb-4 p-3 bg-yellow-50 rounded shadow flex flex-col gap-2">
                <div className="font-semibold text-lg">{contact.firstName} {contact.lastName}</div>
                <div className="text-sm text-gray-700">Source: {contact.source}</div>
                <div className="text-sm text-red-600">Time Remaining: {timeLeft !== null ? `${Math.floor(timeLeft/60)}m ${timeLeft%60}s` : 'N/A'}</div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => window.open(`tel:${contact.phone}`)}>Call</button>
                  <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => window.open(`mailto:${contact.email}`)}>Email</button>
                  <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {/* Mark handled logic */}}>Mark Handled</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
