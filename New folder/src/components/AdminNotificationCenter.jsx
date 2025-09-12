import React, { useState, useEffect } from 'react';
import { FaBell, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import './AdminNotificationCenter.css';

const mockNotifications = [
  { id: 1, type: 'info', message: 'New user registered: john.doe@email.com', time: '2 min ago' },
  { id: 2, type: 'security', message: 'Suspicious login detected for admin account', time: '10 min ago' },
  { id: 3, type: 'success', message: 'User role updated: jane.smith@email.com → Admin', time: '1 hour ago' },
  { id: 4, type: 'warning', message: 'Multiple failed login attempts detected', time: '2 hours ago' },
];

const iconMap = {
  info: <FaBell className="text-blue-500" />,
  security: <FaShieldAlt className="text-purple-500" />,
  success: <FaBell className="text-green-500" />,
  warning: <FaExclamationTriangle className="text-yellow-500" />,
};

const AdminNotificationCenter = ({ darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnread(mockNotifications.length);
  }, []);

  const markAllRead = () => setUnread(0);

  return (
    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300 w-full`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaBell /> Notifications
          {unread > 0 && <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{unread}</span>}
        </h3>
        <button onClick={markAllRead} className="rounded px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm">Mark all read</button>
      </div>
      <ul className="space-y-3">
        {notifications.map(n => (
          <li key={n.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-colors`}>
            {iconMap[n.type]}
            <div className="flex-1">
              <div className="font-semibold">{n.message}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{n.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNotificationCenter;
