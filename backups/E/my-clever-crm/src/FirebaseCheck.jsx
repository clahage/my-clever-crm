import React from 'react';

const FirebaseCheck = () => {
  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#e0f2fe',
      border: '1px solid #0284c7',
      borderRadius: '0.5rem',
      margin: '0.5rem 0'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>
        🔥 Firebase Status (Simplified)
      </h4>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>
        Firebase component is loading... (Basic version working)
      </p>
    </div>
  );
};

export default FirebaseCheck;