import React from 'react';

// ResponsiveLayout.jsx - Device-aware layout system for SpeedyCRM
const ResponsiveLayout = ({ children }) => {
  return (
    <div className="responsive-layout min-h-screen flex flex-col md:flex-row">
      {children}
    </div>
  );
};

export default ResponsiveLayout;
