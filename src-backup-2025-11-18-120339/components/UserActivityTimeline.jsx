import React from 'react';
import { FaUser, FaUserEdit, FaSignInAlt } from 'react-icons/fa';
import './UserActivityTimeline.css';

const mockActivities = [
  { id: 1, type: 'login', user: 'john.doe@email.com', time: '2 min ago', details: 'Logged in' },
  { id: 2, type: 'role_change', user: 'jane.smith@email.com', time: '1 hour ago', details: 'Role changed to Admin' },
  { id: 3, type: 'register', user: 'alice@email.com', time: '3 hours ago', details: 'Registered' },
  { id: 4, type: 'login', user: 'bob@email.com', time: '5 hours ago', details: 'Logged in' },
];

const iconMap = {
  login: <FaSignInAlt className="text-blue-500" />,
  role_change: <FaUserEdit className="text-purple-500" />,
  register: <FaUser className="text-green-500" />,
};

const UserActivityTimeline = ({ darkMode }) => {
  return (
    <div className={`rounded-xl p-6 shadow-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors duration-300 w-full`}>
      <h3 className="text-lg font-bold mb-4">User Activity Timeline</h3>
      <ul className="space-y-4">
        {mockActivities.map(activity => (
          <li key={activity.id} className={`flex items-center gap-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-colors`}>
            {iconMap[activity.type]}
            <div className="flex-1">
              <div className="font-semibold">{activity.user}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{activity.details} • {activity.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActivityTimeline;
