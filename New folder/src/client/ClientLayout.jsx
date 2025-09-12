// Client Portal Layout Shell
import React from 'react';
import BrandLogo from '@/components/BrandLogo';
import { useTheme } from '@/theme/ThemeProvider';

// --- ON-SCREEN BEACON ---
const Beacon = () => (
  <div style={{background:'#d1fae5',color:'#065f46',padding:'4px 0',textAlign:'center',fontWeight:'bold',letterSpacing:1,marginBottom:12,zIndex:9999}}>
    [BEACON: ClientLayout.jsx]
  </div>
);

const ClientLayout = ({ children }) => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {import.meta.env.DEV && <Beacon />}
      {/* Sidebar/Header with logo */}
      <nav className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
        <BrandLogo variant="client" theme={theme === 'dark' ? 'dark' : 'light'} style={{height:40}} />
        <button
          className="ml-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
};

export default ClientLayout;
