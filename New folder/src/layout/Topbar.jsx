// scr-admin-vite/src/layout/Topbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../themeContext';

function Topbar({ className = '' }) {
  const { mode, setTheme } = useTheme();
  return (
    <header className={`topbar shadow p-4 flex justify-between items-center ${className}`}>
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        {/* Theme mode segmented control */}
        <div className="flex gap-1">
          <button onClick={() => setTheme('light')} className={`px-2 py-1 rounded text-xs font-bold border ${mode==='light' ? 'bg-blue-500 text-white border-blue-700' : 'bg-white/10 text-blue-900 dark:text-white/80 border-transparent'}`}>Light</button>
          <button onClick={() => setTheme('medium')} className={`px-2 py-1 rounded text-xs font-bold border ${mode==='medium' ? 'bg-cyan-700 text-white border-cyan-900' : 'bg-white/10 text-cyan-900 dark:text-white/80 border-transparent'}`}>Medium</button>
          <button onClick={() => setTheme('dark')} className={`px-2 py-1 rounded text-xs font-bold border ${mode==='dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white/10 text-gray-900 dark:text-white/80 border-transparent'}`}>Dark</button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;