import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DatabaseDiagnostic() {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCollections();
  }, []);

  const checkCollections = async () => {
    setLoading(true);
    const results = {};

    // Check standard contacts collection
    try {
      const contactsSnap = await getDocs(collection(db, 'contacts'));
      results['contacts'] = {
        exists: true,
        count: contactsSnap.size,
        sampleData: contactsSnap.size > 0 ? contactsSnap.docs[0].data() : null,
        path: 'contacts'
      };
    } catch (error) {
      results['contacts'] = { exists: false, error: error.message };
    }

    // Check possible duplicate paths
    const possiblePaths = [
      'Contacts', // capital C
      'contact',  // singular
      'users/contacts', // nested
      'data/contacts' // nested
    ];

    for (const path of possiblePaths) {
      try {
        const snap = await getDocs(collection(db, path));
        if (snap.size > 0) {
          results[path] = {
            exists: true,
            count: snap.size,
            sampleData: snap.docs[0].data(),
            path: path
          };
        }
      } catch (error) {
        // Collection doesn't exist or can't access
        results[path] = { exists: false };
      }
    }

    // Check leads collection too (for reference)
    try {
      const leadsSnap = await getDocs(collection(db, 'leads'));
      results['leads'] = {
        exists: true,
        count: leadsSnap.size,
        path: 'leads'
      };
    } catch (error) {
      results['leads'] = { exists: false };
    }

    setCollections(results);
    setLoading(false);
  };

  const getRecommendation = () => {
    const activeCollections = Object.entries(collections)
      .filter(([key, val]) => val.exists && key.includes('contact'))
      .map(([key, val]) => ({ name: key, ...val }));

    if (activeCollections.length === 0) {
      return 'No contacts collections found. You may need to create one.';
    } else if (activeCollections.length === 1) {
      return `Only one contacts collection found: "${activeCollections[0].name}" with ${activeCollections[0].count} documents.`;
    } else {
      return `WARNING: ${activeCollections.length} contacts collections found! This needs cleanup.`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostic Tool</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Scanning database collections...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Collection Analysis</h2>
            <div className="space-y-3">
              {Object.entries(collections).map(([name, info]) => (
                <div key={name} className={`p-3 rounded border ${
                  info.exists ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{name}</span>
                    {info.exists ? (
                      <span className="text-sm">
                        ✅ {info.count} documents
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not found</span>
                    )}
                  </div>
                  {info.exists && info.sampleData && (
                    <div className="text-xs text-gray-600 mt-1">
                      Sample fields: {Object.keys(info.sampleData).slice(0, 5).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            Object.values(collections).filter(c => c.exists && c.path?.includes('contact')).length > 1
              ? 'bg-red-100 border border-red-300'
              : 'bg-green-100 border border-green-300'
          }`}>
            <p className="font-semibold mb-2">Recommendation:</p>
            <p>{getRecommendation()}</p>
            
            {Object.values(collections).filter(c => c.exists && c.path?.includes('contact')).length > 1 && (
              <div className="mt-4 p-3 bg-white rounded">
                <p className="text-sm font-medium mb-2">To fix duplicate collections:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Identify which collection your app is using (check the code)</li>
                  <li>Export data from the unused collection (Firebase Console)</li>
                  <li>Import into the correct collection if needed</li>
                  <li>Delete the duplicate collection in Firebase Console</li>
                </ol>
              </div>
            )}
          </div>

          <button
            onClick={checkCollections}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Re-scan Database
          </button>
        </>
      )}
    </div>
  );
}
