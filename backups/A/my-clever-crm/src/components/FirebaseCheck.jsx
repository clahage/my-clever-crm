import React, { useState, useEffect } from 'react';

function FirebaseCheck() {
  const [status, setStatus] = useState({
    auth: false,
    db: false,
    storage: false,
    connected: false,
    loading: true
  });

  useEffect(() => {
    // Try to import Firebase services
    const checkFirebase = async () => {
      try {
        // Dynamic import to avoid build errors
        const { auth, db, storage } = await import('../firebaseConfig');
        
        setStatus({
          auth: !!auth,
          db: !!db,
          storage: !!storage,
          connected: isFirebaseConnected ? isFirebaseConnected() : false,
          loading: false
        });
      } catch (error) {
        console.log('Firebase import error:', error);
        setStatus({
          auth: false,
          db: false,
          storage: false,
          connected: false,
          loading: false
        });
      }
    };

    checkFirebase();
  }, []);

  if (status.loading) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
        <h3>🔥 Firebase Status</h3>
        <p>Checking connection...</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: status.connected ? '#ecfdf5' : '#fef2f2',
      border: `1px solid ${status.connected ? '#10b981' : '#ef4444'}`,
      borderRadius: '0.5rem',
      margin: '0.5rem 0'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: status.connected ? '#065f46' : '#7f1d1d' }}>
        🔥 Firebase Connection Status
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <strong>Auth:</strong> {status.auth ? '✅' : '❌'}
        </div>
        <div>
          <strong>Firestore:</strong> {status.db ? '✅' : '❌'}
        </div>
        <div>
          <strong>Storage:</strong> {status.storage ? '✅' : '❌'}
        </div>
      </div>
      
      <div style={{
        padding: '0.5rem',
        backgroundColor: status.connected ? '#d1fae5' : '#fee2e2',
        borderRadius: '0.25rem',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {status.connected ? '✅ All Systems Connected' : '❌ Connection Issues'}
      </div>
      
      {status.connected && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', textAlign: 'center' }}>
          Ready for Contacts Management!
        </p>
      )}
    </div>
  );
}

export default FirebaseCheck;