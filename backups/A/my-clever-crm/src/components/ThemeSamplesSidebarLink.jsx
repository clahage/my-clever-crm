// Add a sidebar link to the Theme Samples page for easy access
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function ThemeSamplesSidebarLink() {
  return (
    <NavLink
      to="/theme-samples"
      className={({ isActive }) =>
        `flex items-center px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50 text-gray-700 dark:text-gray-200'}`
      }
      style={{ marginTop: 8 }}
    >
      <span role="img" aria-label="magic" className="mr-2">✨</span>
      Theme Samples
    </NavLink>
  );
}
